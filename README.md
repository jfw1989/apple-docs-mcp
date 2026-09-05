# Apple Docs MCP - Apple Developer Documentation Model Context Protocol Server

[![CI](https://github.com/jfw1989/apple-docs-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/jfw1989/apple-docs-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Apple Developer Documentation MCP Server - Access Apple's official developer docs, frameworks, APIs, SwiftUI, UIKit, and WWDC videos through Model Context Protocol. Search iOS, macOS, watchOS, tvOS, and visionOS documentation with AI-powered natural language queries. Get instant access to Swift/Objective-C code examples, API references, and technical guides directly in Claude, Cursor, or any MCP-compatible AI assistant. On hosts with a local Swift toolchain, an additional **symbolgraph layer** answers structural SDK questions — exact signatures, conformances, and member lists — offline.

## ✨ Features

- 🔍 **Smart Search**: Intelligent search across Apple Developer Documentation for SwiftUI, UIKit, Foundation, CoreData, ARKit, and more
- 📚 **Complete Documentation Access**: Full access to Apple's JSON API for Swift, Objective-C, and framework documentation
- 🔧 **Framework Index**: Browse hierarchical API structures for iOS, macOS, watchOS, tvOS, visionOS frameworks
- 📋 **Technology Catalog**: Explore Apple technologies including SwiftUI, UIKit, Metal, Core ML, Vision, and ARKit
- 📰 **Documentation Updates**: Track WWDC 2024/2025 announcements, iOS 26, macOS 26, and latest SDK releases
- 🎯 **Technology Overviews**: Comprehensive guides for Swift, SwiftUI, UIKit, and all Apple development platforms
- 💻 **Sample Code Library**: Swift and Objective-C code examples for iOS, macOS, and cross-platform development
- 🎥 **WWDC Video Library**: Search WWDC 2014-2025 sessions with transcripts, Swift/SwiftUI code examples, and resources
- 🔗 **Related APIs Discovery**: Find SwiftUI views, UIKit controllers, and framework-specific API relationships
- 📊 **Platform Compatibility**: iOS 13+, macOS 10.15+, watchOS 6+, tvOS 13+, visionOS compatibility analysis
- ⚡ **High Performance**: Optimized for Xcode, Swift Playgrounds, and AI-powered development environments
- 🔄 **Smart UserAgent Pool**: Intelligent UserAgent rotation system with automatic failure recovery and performance monitoring
- 🌐 **Multi-Platform**: Complete iOS, iPadOS, macOS, watchOS, tvOS, and visionOS documentation support
- 🏷️ **Beta & Status Tracking**: iOS 26 beta APIs, deprecated UIKit methods, new SwiftUI features tracking
- 🧩 **SDK Symbolgraph Layer**: Structural SDK questions — exact signatures, kind info, conformances, member lists — answered from the local Swift toolchain (macOS: ~300 SDK frameworks; Linux: Swift stdlib modules; no network needed)

## 🚀 Quick Start

### Install from GitHub (this fork)

This fork is distributed directly from GitHub — no npm registry needed. `npx` clones the repo, installs dependencies, builds via the `prepare` script, and runs the server automatically:

```json
{
  "mcpServers": {
    "apple-docs": {
      "command": "npx",
      "args": ["-y", "github:jfw1989/apple-docs-mcp"]
    }
  }
}
```

Or via CLI:

```bash
claude mcp add apple-docs -- npx -y github:jfw1989/apple-docs-mcp
```

> Based on [kimsungwhee/apple-docs-mcp](https://github.com/kimsungwhee/apple-docs-mcp) (MIT). This fork replaces the defunct HTML-scraping search route with Apple's internal JSONL search API.

### Claude Desktop (Recommended)

Add this to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "apple-docs": {
      "command": "npx",
      "args": ["-y", "github:jfw1989/apple-docs-mcp"]
    }
  }
}
```

> **Note**: If you encounter issues with an old version being used, add `@latest` to force the latest version:
> ```json
> "args": ["-y", "github:jfw1989/apple-docs-mcp@latest"]
> ```

Restart Claude Desktop and start asking about Apple APIs!

## 📦 Installation

<details>
<summary><strong>📱 Claude Code</strong></summary>

```bash
claude mcp add apple-docs -- npx -y github:jfw1989/apple-docs-mcp@latest
```

[📖 Claude Code MCP docs](https://docs.anthropic.com/en/docs/claude-code/mcp)

</details>

<details>
<summary><strong>🖱️ Cursor</strong></summary>

**Via Settings**: Settings → Cursor Settings → MCP → Add new global MCP server

**Via Config File**: Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "apple-docs": {
      "command": "npx",
      "args": ["-y", "github:jfw1989/apple-docs-mcp"]
    }
  }
}
```

[📖 Cursor MCP docs](https://docs.cursor.com/context/mcp)

</details>

<details>
<summary><strong>🔷 VS Code</strong></summary>

Add to your VS Code MCP config:

```json
{
  "mcp": {
    "servers": {
      "apple-docs": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "github:jfw1989/apple-docs-mcp"]
      }
    }
  }
}
```

[📖 VS Code MCP docs](https://code.visualstudio.com/docs/editor/mcp)

</details>

<details>
<summary><strong>🌊 Windsurf</strong></summary>

Add to your Windsurf MCP config:

```json
{
  "mcpServers": {
    "apple-docs": {
      "command": "npx",
      "args": ["-y", "github:jfw1989/apple-docs-mcp"]
    }
  }
}
```

[📖 Windsurf MCP docs](https://docs.codeium.com/windsurf/mcp)

</details>

<details>
<summary><strong>⚡ Zed</strong></summary>

Add to your Zed `settings.json`:

```json
{
  "context_servers": {
    "Apple Docs": {
      "command": {
        "path": "npx",
        "args": ["-y", "github:jfw1989/apple-docs-mcp"]
      },
      "settings": {}
    }
  }
}
```

[📖 Zed Context Server docs](https://zed.dev/docs/context-servers)

</details>

<details>
<summary><strong>🔧 Cline</strong></summary>

**Via Marketplace**:
1. Open Cline → Menu (☰) → MCP Servers → Marketplace
2. Search "Apple Docs MCP" → Install

**Via Config**: Add to `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "apple-docs": {
      "command": "npx",
      "args": ["-y", "github:jfw1989/apple-docs-mcp"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

</details>

<details>
<summary><strong>🟠 Amazon Q Developer CLI</strong></summary>

**Via Config File**: Add to `~/.aws/amazonq/mcp.json`:

```json
{
  "mcpServers": {
    "apple-docs": {
      "command": "npx",
      "args": ["-y", "github:jfw1989/apple-docs-mcp"]
    }
  }
}
```

[📖 Amazon Q Developer CLI MCP docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/qdev-mcp.html)

</details>

<details>
<summary><strong>🪟 Windows</strong></summary>

For Windows systems, use:

```json
{
  "mcpServers": {
    "apple-docs": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "github:jfw1989/apple-docs-mcp"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

</details>

<details>
<summary><strong>⚙️ Advanced Installation</strong></summary>

**Global Installation**:
```bash
# Using pnpm (recommended)
pnpm add -g github:jfw1989/apple-docs-mcp

# Using npm
npm install -g github:jfw1989/apple-docs-mcp
```

**Direct Usage**:
```bash
npx github:jfw1989/apple-docs-mcp --help
```

**Development Setup**:
```bash
git clone https://github.com/jfw1989/apple-docs-mcp.git
cd apple-docs-mcp

# Using pnpm (recommended)
pnpm install && pnpm run build

# Using npm
npm install && npm run build
```

</details>

## 💬 Usage Examples

### 🔍 Smart Search
```
"Search for SwiftUI animations"
"Find withAnimation API documentation"
"Look up async/await patterns in Swift"
"Show me UITableView delegate methods"
"Search Core Data NSPersistentContainer examples"
"Find AVFoundation video playback APIs"
```

### 📚 Documentation Access
```
"Get detailed information about the SwiftUI framework"
"Show me withAnimation API with related APIs"
"Get platform compatibility for SwiftData"
"Access UIViewController documentation with similar APIs"
"Show me NSManagedObjectContext documentation"
"Get URLSession async/await methods"
```

### 🔧 Framework Exploration
```
"Show me SwiftUI framework API index"
"List all UIKit classes and methods"
"Browse ARKit framework structure"
"Get WeatherKit API hierarchy"
"Explore Core ML model loading APIs"
"Show Vision framework image analysis APIs"
```

### 🔗 API Discovery
```
"Find APIs related to UIViewController"
"Show me similar APIs to withAnimation"
"Get all references from SwiftData documentation"
"Discover alternatives to Core Data NSManagedObject"
```

### 🧩 SDK Symbolgraph (local Swift toolchain)

Structural questions answered from the local SDK symbolgraph — offline, exact, current toolchain state:

```
"Which protocols does Swift.Collection conform to?"
"What is the exact kind and signature of Duration in the Swift module?"
"List all members of SwiftUI.List"
"Which modules are available for symbolgraph extraction on this host?"
```

### 📋 Technology & Platform Analysis
```
"List all Beta frameworks in iOS 26"
"Show me Graphics & Games technologies"
"What machine learning frameworks are available?"
"Analyze platform compatibility for Vision framework"
```

### 📰 Documentation Updates
```
"Show me the latest WWDC updates"
"What's new in SwiftUI?"
"Get technology updates for iOS"
"Show me release notes for Xcode"
"Find beta features in the latest updates"
```

### 🎯 Technology Overviews
```
"Show me technology overviews for app design and UI"
"Get comprehensive guides for games development"
"Explore AI and machine learning overviews"
"Show me iOS-specific technology guides"
"Get data management technology overviews"
```

### 💻 Sample Code Library
```
"Show SwiftUI sample code projects"
"Find sample code for machine learning"
"Get UIKit example projects"
"Show featured WWDC sample code"
"Find Core Data sample implementations"
"Show only beta sample code projects"
```

### 🎥 WWDC Video Search
```
"Search WWDC videos about SwiftUI"
"Find WWDC sessions on machine learning"
"Show me WWDC 2024 videos"
"Search for async/await WWDC talks"
"Find WWDC videos about Swift concurrency"
"Show accessibility-focused WWDC sessions"
```

### 📺 WWDC Video Details
```
"Get details for WWDC session 10176"
"Show me the transcript for WWDC23 session on SwiftData"
"Get code examples from WWDC video 10019"
"Show resources from Vision Pro WWDC session"
"Get transcript for 'Meet async/await in Swift' session"
```

### 📋 WWDC Topics & Years
```
"List all WWDC topics"
"Show me Swift topic WWDC videos"
"Get WWDC videos about developer tools"
"List WWDC videos from 2023"
"Show all SwiftUI and UI frameworks sessions"
"Get machine learning WWDC content"
```

### 🛠️ Advanced Usage
```
"Find related APIs for @State with platform analysis"
"Resolve all references from SwiftUI documentation"
"Get platform compatibility analysis for Vision framework"
"Find similar APIs to UIViewController with deep search"
```

## 🛠️ Available Tools

**22 tools** in two layers. The **doc layer** (18 tools) fetches live data from Apple Developer. The **symbolgraph layer** (4 tools) answers structural SDK questions from the local Swift toolchain — available wherever a Swift toolchain is installed, no network needed.

### Doc Layer (18)

| Tool | Description | Key Features |
|------|-------------|--------------|
| `search_apple_docs` | Search Apple Developer Documentation | Apple's internal JSONL search API, find specific APIs, classes, methods |
| `get_apple_doc_content` | Get detailed documentation content | JSON API access, optional enhanced analysis (related/similar APIs, platform compatibility) |
| `list_technologies` | Browse all Apple technologies | Category filtering, language support, beta status |
| `search_framework_symbols` | Search symbols in specific framework | Classes, structs, protocols, wildcard patterns, type filtering |
| `get_related_apis` | Find related APIs | Inheritance, conformance, "See Also" relationships |
| `resolve_references_batch` | Batch resolve API references | Extract and resolve all references from documentation |
| `get_platform_compatibility` | Platform compatibility analysis | Version support, beta status, deprecation info |
| `find_similar_apis` | Discover similar APIs | Apple's official recommendations, topic groupings |
| `get_documentation_updates` | Track Apple documentation updates | WWDC announcements, technology updates, release notes |
| `get_technology_overviews` | Get technology overviews and guides | Comprehensive guides, hierarchical navigation, platform filtering |
| `get_sample_code` | Browse Apple sample code projects | Framework filtering (with limitations), keyword search, beta status |
| `list_wwdc_videos` | Browse WWDC video sessions | Year/topic filtering, session metadata |
| `search_wwdc_content` | Full-text search across WWDC videos | Transcripts, code examples, resources |
| `get_wwdc_video` | Get complete WWDC session content | Full transcript, code examples, resources, platform info |
| `get_wwdc_code_examples` | Browse code examples from WWDC sessions | Per-session Swift/SwiftUI samples |
| `browse_wwdc_topics` | List all WWDC topic categories | 19 topic categories with IDs |
| `find_related_wwdc_videos` | Discover WWDC sessions related to a video | Cross-session recommendations |
| `list_wwdc_years` | List all available WWDC years | Conference years with video counts |

### Symbolgraph Layer (4)

| Tool | Description | Key Features |
|------|-------------|--------------|
| `symbolgraph_list_modules` | List modules available for symbolgraph extraction on this host | macOS: ~300 SDK frameworks; Linux: Swift stdlib modules |
| `symbolgraph_lookup_symbol` | Look up a symbol in a Swift module via the local SDK symbolgraph | Exact kind (Structure/Class/Protocol…), precise identifier, doc text |
| `symbolgraph_relations` | Get the relationship network of a symbol | conformsTo, memberOf, inheritsFrom, member lists, conforming types |
| `symbolgraph_cache_info` | Show symbolgraph cache directory and configuration | Target triple, Swift binary path — useful for debugging extraction |

## 🏗️ Technical Architecture for Apple Developer Documentation Access

```
apple-docs-mcp/
├── 🔧 src/
│   ├── index.ts                      # MCP server entry point with all tools
│   ├── tools/                        # MCP tool implementations
│   │   ├── apple-search-api.ts       # Apple's internal JSONL search API client
│   │   ├── search-parser.ts          # Search result formatting
│   │   ├── search-result-parser.ts   # Shared search result types
│   │   ├── doc-fetcher.ts            # JSON API documentation fetching
│   │   ├── doc-formatter.ts          # Documentation content formatting
│   │   ├── definitions.ts            # All 22 tool definitions (schemas, annotations)
│   │   ├── handlers.ts               # Tool-call dispatch
│   │   ├── tools-guide.ts            # Tool usage guidance
│   │   ├── symbolgraph.ts            # SDK symbolgraph layer (local Swift toolchain)
│   │   ├── search-framework-symbols.ts # Framework symbol search
│   │   ├── list-technologies.ts      # Technology catalog handling
│   │   ├── get-documentation-updates.ts # Documentation updates tracking
│   │   ├── get-technology-overviews.ts # Technology overviews and guides
│   │   ├── get-sample-code.ts        # Sample code library browser
│   │   ├── get-framework-index.ts    # Framework structure indexing
│   │   ├── get-related-apis.ts       # Related API discovery
│   │   ├── resolve-references-batch.ts # Batch reference resolution
│   │   ├── get-platform-compatibility.ts # Platform analysis
│   │   ├── find-similar-apis.ts      # Similar API recommendations
│   │   └── wwdc/                     # WWDC video tools
│   │       ├── wwdc-handlers.ts      # WWDC tool handlers
│   │       ├── content-extractor.ts  # Video content extraction
│   │       ├── topics-extractor.ts   # Topic listing
│   │       └── video-list-extractor.ts # Video list parsing
│   └── utils/                        # Utility functions and helpers
│       ├── cache.ts                  # Memory cache with TTL support
│       ├── cache-warmer.ts           # Cache warm-up + periodic refresh
│       ├── preloader.ts              # Popular-framework preloading
│       ├── constants.ts              # Application constants and URLs
│       ├── error-handler.ts          # Error handling and validation
│       ├── http-client.ts            # HTTP client with performance tracking
│       ├── user-agent-pool.ts        # Smart UserAgent rotation system
│       ├── http-headers-generator.ts # Dynamic browser headers generation
│       ├── rate-limiter.ts           # Request rate limiting
│       ├── wwdc-data-source.ts       # Bundled WWDC data access
│       └── url-converter.ts          # URL conversion utilities
├── 📦 dist/                          # Compiled JavaScript (incl. bundled data/)
├── 📄 package.json                   # Package configuration (prepare = build)
└── 📖 README.md                      # This file
```

### 🚀 Performance Features

- **Memory-Based Caching**: Custom cache implementation with automatic cleanup and TTL support
- **Smart UserAgent Pool**: Intelligent rotation system with automatic failure recovery and performance monitoring
- **Dynamic Headers**: Realistic browser headers generation (Accept, Accept-Language, User-Agent)
- **Smart Search**: Official Apple search API with enhanced result formatting
- **Enhanced Analysis**: Optional related APIs, platform compatibility, and similarity analysis
- **Error Resilience**: Graceful degradation with comprehensive error handling
- **Type Safety**: Full TypeScript with Zod v4.0.5 runtime validation
- **Latest Dependencies**: MCP SDK v1.15.1, optimized package footprint

### 💾 Caching Strategy

| Content Type | Cache Duration | Cache Size | Reason |
|--------------|----------------|------------|--------|
| API Documentation | 30 minutes | 500 entries | Frequently accessed, moderate updates |
| Search Results | 10 minutes | 200 entries | Dynamic content, user-specific |
| Framework Indexes | 1 hour | 100 entries | Stable structure, less frequent changes |
| Technologies List | 2 hours | 50 entries | Rarely changes, large content |
| Documentation Updates | 30 minutes | 100 entries | Regular updates, WWDC announcements |

### 🧩 Symbolgraph Layer Configuration

The symbolgraph layer uses the local Swift toolchain via `swift-symbolgraph-extract`. Extraction results are cached on disk (persistent across restarts; SwiftUI ~456 MB JSON, so extraction is a one-time cost per module).

#### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SG_SWIFT_BIN` | Path to the `swift` binary | `swift` (from `PATH`) | `/opt/swift/usr/bin/swift` |
| `SG_TARGET` | Target triple for extraction | Auto-detected (`arm64-apple-macos26.0` on macOS, `x86_64`/`aarch64-unknown-linux-gnu` on Linux) | `arm64-apple-macos26.0` |
| `SG_CACHE_DIR` | Symbolgraph cache directory | `<os.tmpdir>/symbolgraph-cache` | `/var/cache/symbolgraph` |
| `SG_PREWARM` | Comma-separated modules to extract at startup | *(none)* | `Swift,Foundation` |

**Two-layer split** (by design): Apple-exclusive frameworks (SwiftUI, MapKit, …) extract only on **macOS** (via the local SDK, ~300 frameworks). On **Linux**, the layer covers Swift standard library modules (Swift: 14,252 symbols, Foundation: 5,450 — measured with Swift 6.2.1). Hosts without a Swift toolchain get a clear error, never a hang — the 18 doc-layer tools keep working.

## 📦 WWDC Data

All WWDC video data (2014-2025) is **bundled directly in the package** (installed from GitHub, `data/` ships inside the built `dist/`), providing:

- ✅ **Zero network latency** - No API calls needed for WWDC content
- ✅ **100% offline access** - Works without internet connection
- ✅ **No rate limits** - Unlimited WWDC searches and browsing
- ✅ **Instant responses** - All data is locally available

The package includes:
- 📹 **1,266 WWDC session videos** with full transcripts
- 🏷️ **19 topic categories** for organized browsing
- 📅 **12 years of content** (2014-2025)
- 💾 **36MB of JSON data**

> **Note**: Keep your package updated to get the latest WWDC content additions.

## ⚙️ Configuration

### 🔄 UserAgent Pool Configuration

The MCP server includes an intelligent UserAgent rotation system to improve API reliability:

#### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `USER_AGENT_ROTATION_ENABLED` | Enable/disable rotation | `true` | `true` |
| `USER_AGENT_POOL_STRATEGY` | Rotation strategy | `random` | `smart` |
| `USER_AGENT_MAX_RETRIES` | Max retry attempts | `3` | `5` |
| `USER_AGENT_POOL_CONFIG` | Custom pool config (JSON) | Built-in agents | See below |

#### Custom Pool Configuration

```bash
# Configure custom UserAgent pool
export USER_AGENT_POOL_CONFIG='[
  {"userAgent": "MyApp/1.0 (compatible)", "weight": 3, "maxUsageCount": 1000},
  {"userAgent": "MyApp/2.0 (advanced)", "weight": 2, "maxUsageCount": 800}
]'

# Set rotation strategy (random/sequential/smart)
export USER_AGENT_POOL_STRATEGY=smart

# Enable debugging
export NODE_ENV=development
```

#### Available Strategies

- **`random`**: Fast random selection (best performance)
- **`sequential`**: Round-robin rotation (predictable order)
- **`smart`**: Success rate optimization (best reliability)

#### Built-in UserAgents

The server includes 12+ pre-configured UserAgent strings covering:
- Chrome (Mac Intel/Apple Silicon, Windows, Linux)
- Firefox (Mac Intel/Apple Silicon, Windows, Linux)
- Safari (Mac Intel/Apple Silicon, latest versions)
- Edge (Windows, Mac Intel/Apple Silicon)

## 🧪 Development

### Quick Commands

```bash
# Development with auto-reload
pnpm run dev    # or: npm run dev

# Build for production  
pnpm run build  # or: npm run build

# Type checking
pnpm exec tsc --noEmit  # or: npx tsc --noEmit

# Clean build artifacts
pnpm run clean  # or: npm run clean
```

### Testing Locally

```bash
# Test the MCP server directly
node dist/index.js

# Test with sample queries
npx github:jfw1989/apple-docs-mcp --test
```

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## ⚠️ Disclaimer

This project is not affiliated with or endorsed by Apple Inc. It uses publicly available Apple Developer Documentation APIs for educational and development purposes.
