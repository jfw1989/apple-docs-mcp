/**
 * Apple Developer Search API client.
 *
 * Root-cause fix for the defunct search_apple_docs route: Apple's
 * https://developer.apple.com/search/ page is a JS SPA; its result HTML
 * classes ('.search-result') never appear in the server-rendered shell,
 * so HTML scraping returns 0 results permanently. The real search is an
 * internal JSONL API discovered from Apple's own search.js:
 *
 *   POST https://devintserv.msc.sbz.apple.com/api/v1/query
 *   Content-Type: application/json
 *   Accept: application/jsonl
 *   (Origin/Referer: developer.apple.com — required, otherwise HTTP 400)
 *   body: { text, targetResultLocale, includedResponses: [...] }
 *
 * The 'search' stream phase currently ends with {"kind":"error","response":
 * "searchFailed"} server-side, but 'quickSearch' reliably returns 3-10
 * documentation hits (title, hierarchy, description, availability, permalink).
 *
 * Latency: the stream stays open ~10-15 s until the (failing) search part
 * ends; quickSearch lines are complete after ~1 s, so the client reads
 * incrementally and stops right after quickSearchFinished.
 */

import { logger } from '../utils/logger.js';
import type { SearchResult } from './search-result-parser.js';

const SEARCH_API_HOST = 'https://devintserv.msc.sbz.apple.com';
const QUERY_PATH = '/api/v1/query';
const JSONL_ACCEPT = 'application/jsonl';
const TARGET_LOCALE = 'en-US';

/** Response kinds we request from Apple's search service. */
const INCLUDED_RESPONSES = ['quickSearch', 'search'];

/** Hard cap — mirrors API_LIMITS.MAX_SEARCH_RESULTS upstream behaviour. */
const MAX_RESULTS = 50;

/** Bail out early once quickSearch finished (search part is broken upstream). */
const QUICK_SEARCH_STOP_TIMEOUT_MS = 4000;

interface AppleSearchMeta {
  title?: string;
  description?: string;
  permalink?: string;
  hierarchy?: string;
  availability?: string;
  kind?: string;
  metadataKind?: string;
}

interface AppleSearchHit {
  metadata?: AppleSearchMeta;
  origin?: string;
}

interface AppleStreamLine {
  kind?: string;
  response?: unknown;
}

/**
 * Query Apple's internal search API (JSONL over POST).
 * Returns parsed documentation hits from the quickSearch stream.
 */
export async function fetchSearchResults(
  query: string,
  filterType: string = 'all',
): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), QUICK_SEARCH_STOP_TIMEOUT_MS);

  try {
    const res = await fetch(`${SEARCH_API_HOST}${QUERY_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: JSONL_ACCEPT,
        'User-Agent': 'Mozilla/5.0',
        Origin: 'https://developer.apple.com',
        Referer: 'https://developer.apple.com/search/',
      },
      body: JSON.stringify({
        text: query,
        includedResponses: INCLUDED_RESPONSES,
        targetResultLocale: TARGET_LOCALE,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      logger.warn(`Apple search API returned HTTP ${res.status} for query "${query}"`);
      return [];
    }

    if (!res.body) {
      return [];
    }

    // Read the JSONL stream line by line; stop after quickSearchFinished.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const results: SearchResult[] = [];

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let obj: AppleStreamLine;
        try {
          obj = JSON.parse(trimmed) as AppleStreamLine;
        } catch {
          continue;
        }

        if (obj.kind === 'quickSearch' && isRecord(obj.response)) {
          const hits = (obj.response as { results?: AppleSearchHit[] }).results ?? [];
          for (const hit of hits) {
            const mapped = mapQuickSearchHit(hit, filterType);
            if (mapped && results.length < MAX_RESULTS) {
              results.push(mapped);
            }
          }
        } else if (obj.kind === 'quickSearchFinished' || obj.kind === 'error') {
          clearTimeout(timer);
          try { await reader.cancel(); } catch { /* stream already ending */ }
          break outer;
        }
      }
    }

    clearTimeout(timer);
    logger.info(`Apple search API: ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    clearTimeout(timer);
    logger.error('Apple search API request failed:', error);
    return [];
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** Map a quickSearch documentation hit onto the legacy SearchResult shape. */
function mapQuickSearchHit(hit: AppleSearchHit, filterType: string): SearchResult | null {
  const meta = hit.metadata;
  if (!meta || !meta.title) return null;

  // Only documentation-origin results are relevant here.
  if (meta.metadataKind && meta.metadataKind !== 'documentation') return null;

  const url = meta.permalink ?? '';
  if (!url) return null;

  // Derive the legacy type from the hierarchy/kind so existing filters keep working.
  const type = meta.kind === 'symbol' ? 'documentation' : 'documentation-article';

  // Respect the legacy filter semantics.
  const allowed: Record<string, string[]> = {
    all: ['documentation', 'documentation-article', 'documentation-tutorial', 'sample-code'],
    documentation: ['documentation', 'documentation-article'],
    sample: ['sample-code'],
  };
  if (!(allowed[filterType] ?? allowed.all).includes(type)) return null;

  return {
    title: meta.title,
    url,
    type,
    description: meta.description ?? '',
    framework: meta.hierarchy?.split('>')?.[0]?.trim(),
    beta: /beta/i.test(meta.availability ?? ''),
  };
}