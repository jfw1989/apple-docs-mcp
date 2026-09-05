/**
 * Symbolgraph layer — "What can the SDK I build against?"
 *
 * Complements the Apple-docs layer (search/volltext): answers structural
 * questions (signatures, init variants, conformsTo/memberOf/inheritsFrom
 * networks) from the local Swift toolchain via `swift symbolgraph-extract`.
 *
 * Platform notes (verified measurements):
 * - Mac (Xcode 26.6): `xcrun swift-symbolgraph-extract -module-name <M> -sdk
 *   $(xcrun --show-sdk-path --sdk macosx) -target arm64-apple-macos26.0`;
 *   ~300 frameworks from the SDK directory. Big modules: SwiftUI ~2 min /
 *   456 MB JSON → persistent disk cache + optional SG_PREWARM.
 * - Linux (Swift 6.2.1, @developer-homelab's measurements): Swift 14,252
 *   symbols, Foundation 5,450, Observation 50 (0.8 s extract). Apple-only
 *   frameworks are absent on Linux — that is the documented two-layer split.
 * - Hosts without a Swift toolchain get a clear error, never a hang.
 *
 * Data-shape pitfalls (both cross-checked on macOS + Linux graphs):
 * - docComment is a Dict `{ module, lines: [{ text }] }`, NOT an abstract
 *   field; macOS SDK graphs mostly lack `abstract` entirely. Always fall
 *   back to docComment.lines.
 * - kind.displayName is e.g. "Structure" (not "Struct") — the consistent
 *   form for tool answers.
 */

import { spawn } from 'child_process';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execFileAsync = promisify(execFile);

const CACHE_ROOT = process.env.SG_CACHE_DIR
  ? path.resolve(process.env.SG_CACHE_DIR)
  : path.join(os.tmpdir(), 'symbolgraph-cache');

const SWIFT_BIN = process.env.SG_SWIFT_BIN ?? 'swift';
/** Target triple is platform-parametrised, never hard-coded. */
const SG_TARGET = process.env.SG_TARGET ?? detectDefaultTarget();

function detectDefaultTarget(): string {
  return process.platform === 'darwin' ? 'arm64-apple-macos26.0' : `${os.arch() === 'arm64' ? 'aarch64' : 'x86_64'}-unknown-linux-gnu`;
}

/** Extract output dir per module+target (persistent across restarts). */
function cacheDirFor(moduleName: string): string {
  return path.join(CACHE_ROOT, moduleName.replace(/[^A-Za-z0-9_-]/g, '_') + '@' + SG_TARGET);
}

interface SymbolRef {
  precise?: string;
  interfaceLanguage?: string;
}

interface SGSymbol {
  kind: { identifier: string; displayName: string };
  identifier: SymbolRef | string;
  pathComponents?: string[];
  names?: { title?: string };
  docComment?: unknown;
  functionSignature?: unknown;
  declarationFragments?: unknown;
  accessLevel?: string;
}

interface SGGraph {
  symbols: SGSymbol[];
  relationships: Array<{ kind: string; source: string; target: string }>;
}

function preciseId(s: SGSymbol): string {
  const id = s.identifier;
  return typeof id === 'string' ? id : id.precise ?? '';
}

function title(s: SGSymbol): string {
  return s.names?.title ?? s.pathComponents?.join('.') ?? preciseId(s);
}

/**
 * Extract doc text: prefer `abstract`-style docComment.lines, tolerate both
 * the Dict {module, lines} and plain-list shapes seen in the wild.
 */
function docText(s: SGSymbol): string {
  const dc = s.docComment as
    | { lines?: Array<{ text?: string } | string> }
    | Array<{ text?: string } | string>
    | undefined;
  if (!dc) {
    return '';
  }
  const lines = Array.isArray(dc) ? dc : dc.lines ?? [];
  const texts = lines.map(l => (typeof l === 'string' ? l : l.text ?? ''));
  return texts.join(' ').trim();
}

/** Ensure the symbolgraph JSON for a module exists in cache; extract if not. */
async function ensureGraph(moduleName: string): Promise<string> {
  const dir = cacheDirFor(moduleName);
  const jsonPath = path.join(dir, `${moduleName}.symbols.json`);
  if (fs.existsSync(jsonPath)) {
    return jsonPath;
  }

  fs.mkdirSync(dir, { recursive: true });

  // macOS: xcrun needs the subcommand as first arg; Linux: the standalone
  // binary is called directly (no subcommand — the args above would carry a
  // bogus '-symbolgraph-extract' that swift-frontend rejects).
  const args =
    process.platform === 'darwin'
      ? ['swift-symbolgraph-extract', '-module-name', moduleName, '-sdk', await macSdkPath(), '-target', SG_TARGET, '-output-dir', dir]
      : ['-module-name', moduleName, '-target', SG_TARGET, '-output-dir', dir];

  try {
    const { stderr } = await runSwift(args);
    if (stderr && /unable to find|No such module/i.test(stderr)) {
      throw new Error(`Module "${moduleName}" not found on this platform's toolchain (target ${SG_TARGET}). Apple-exclusive frameworks are only available on macOS.`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/not found on this platform/.test(msg)) {
      throw e;
    }
    if (/ENOENT|spawn/i.test(msg)) {
      throw new Error('No Swift toolchain found on this host. Install Swift (Linux) or Xcode (macOS) to use the symbolgraph layer.');
    }
    throw new Error(`symbolgraph-extract failed for "${moduleName}": ${msg}`);
  }

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`symbolgraph-extract produced no output for "${moduleName}" — is it a valid module on ${SG_TARGET}?`);
  }
  return jsonPath;
}

function runSwift(args: string[]): Promise<{ stdout: string; stderr: string }> {
  // Both platforms expose a dedicated binary: macOS via `xcrun
  // swift-symbolgraph-extract`, Linux as `<toolchain>/usr/bin/swift-symbolgraph-extract`.
  // (The `swift` driver does not accept -output-dir; the standalone binary does.)
  const useXcrun = process.platform === 'darwin';
  const cmd = useXcrun ? 'xcrun' : `${SWIFT_BIN}-symbolgraph-extract`;
  const fullArgs = useXcrun ? args : args;
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, fullArgs, { env: process.env });
    let stdout = '', stderr = '';
    child.stdout.on('data', d => (stdout += d));
    child.stderr.on('data', d => (stderr += d));
    child.on('error', reject);
    child.on('close', code =>
      code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`exit ${code}: ${stderr.slice(0, 300)}`)),
    );
  });
}

async function macSdkPath(): Promise<string> {
  const { stdout } = await execFileAsync('xcrun', ['--show-sdk-path', '--sdk', 'macosx']);
  return stdout.trim();
}

async function loadGraph(moduleName: string): Promise<SGGraph> {
  const p = await ensureGraph(moduleName);
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as SGGraph;
}

/* ------------------------------------------------------------------ */
/* Tools                                                               */
/* ------------------------------------------------------------------ */

/** list_frameworks — platform manifest straight from the toolchain/SDK. */
export async function listFrameworks(): Promise<string> {
  let modules: string[] = [];
  if (process.platform === 'darwin') {
    const sdkPath = await macSdkPath();
    const frameworksDir = path.join(sdkPath, 'System', 'Library', 'Frameworks');
    modules = fs
      .readdirSync(frameworksDir)
      .filter(d => d.endsWith('.framework'))
      .map(d => d.replace(/\.framework$/, ''));
  } else {
    // Linux: modules live in <toolchain>/usr/lib/swift/linux as *.swiftmodule
    const swiftLib = path.dirname(SWIFT_BIN) === '/' ? '/usr/lib/swift/linux' : path.join(path.dirname(SWIFT_BIN), '..', 'lib', 'swift', 'linux');
    if (fs.existsSync(swiftLib)) {
      modules = fs
        .readdirSync(swiftLib)
        .filter(d => d.endsWith('.swiftmodule'))
        .map(d => d.replace(/\.swiftmodule$/, ''));
    } else {
      modules = ['Swift', 'Foundation', 'Glibc'];
    }
  }
  modules.sort((a, b) => a.localeCompare(b));
  const platform = process.platform === 'darwin' ? 'macOS SDK' : 'Linux toolchain';
  return `# Symbolgraph: available modules (${platform}, target ${SG_TARGET})\n\nFound **${modules.length} modules**:\n\n${modules.map(m => `- ${m}`).join('\n')}\n`;
}

/** lookup_symbol — signature + kind + doc text (docComment fallback). */
export async function lookupSymbol(moduleName: string, symbolName: string): Promise<string> {
  const graph = await loadGraph(moduleName);
  const needle = symbolName.toLowerCase();
  const exact = graph.symbols.filter(
    s => title(s).toLowerCase() === needle || title(s).toLowerCase().endsWith('.' + needle),
  );
  const partial = exact.length
    ? exact
    : graph.symbols.filter(s => title(s).toLowerCase().includes(needle)).slice(0, 10);

  if (!partial.length) {
    return `No symbol matching "${symbolName}" in module ${moduleName}.`;
  }

  const fmt = (s: SGSymbol): string => {
    const doc = docText(s);
    let out = `### ${title(s)}\n- Kind: ${s.kind.displayName}\n- Identifier: \`${preciseId(s)}\``;
    if (doc) {
      out += `\n- Doc: ${doc.slice(0, 400)}`;
    }
    return out + '\n';
  };
  const header = exact.length ? `# ${moduleName} :: ${symbolName} (exact match)` : `# ${moduleName} :: partial matches for "${symbolName}"`;
  return `${header}\n\n${partial.map(fmt).join('\n')}`;
}

/** relations — conformsTo / memberOf / inheritsFrom / overrides network. */
export async function relations(moduleName: string, symbolName: string): Promise<string> {
  const graph = await loadGraph(moduleName);
  const needle = symbolName.toLowerCase();
  const sym = graph.symbols.find(s => title(s).toLowerCase() === needle);
  if (!sym) {
    return `No symbol "${symbolName}" in module ${moduleName}. Use lookup_symbol first.`;
  }
  const pid = preciseId(sym);
  const outgoing = graph.relationships.filter(r => r.source === pid);
  const incoming = graph.relationships.filter(r => r.target === pid);
  const nameOf = (id: string): string => {
    const t = graph.symbols.find(x => preciseId(x) === id);
    return t ? `${title(t)} (${t.kind.displayName})` : id;
  };

  let out = `# ${moduleName} :: ${title(sym)} — relationships\n`;
  const kindMap: Record<string, string> = {
    conformsTo: 'conforms to',
    memberOf: 'is member of',
    inheritsFrom: 'inherits from',
    overrides: 'overrides',
    requirementOf: 'requirement of protocol',
    defaultImplementationOf: 'default implementation of',
  };
  for (const r of outgoing) {
    if (kindMap[r.kind]) {
      out += `- ${kindMap[r.kind]}: ${nameOf(r.target)}\n`;
    }
  }
  const members = incoming.filter(r => r.kind === 'memberOf');
  if (members.length) {
    out += `\n**Members (${members.length}):** ${members.slice(0, 30).map(r => nameOf(r.source)).join(', ')}${members.length > 30 ? ' …' : ''}\n`;
  }
  const conforms = incoming.filter(r => r.kind === 'conformsTo');
  if (conforms.length) {
    out += `\n**Conformed by ${conforms.length} types** (first 30): ${conforms.slice(0, 30).map(r => nameOf(r.source)).join(', ')}${conforms.length > 30 ? ' …' : ''}\n`;
  }
  return out;
}

/** Cache info for diagnostics. */
export function cacheInfo(): string {
  return `Cache dir: ${CACHE_ROOT} | Target: ${SG_TARGET} | Swift bin: ${SWIFT_BIN}`;
}