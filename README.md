# W3C MCP Server

[![npm version](https://img.shields.io/npm/v/@shuji-bonji/w3c-mcp.svg)](https://www.npmjs.com/package/@shuji-bonji/w3c-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-blueviolet?logo=anthropic)](https://claude.ai/code)

MCP Server for accessing W3C/WHATWG/IETF web specifications. Provides AI assistants with access to official web standards data including specifications, WebIDL definitions, CSS properties, and HTML elements.

## Installation

```bash
npm install -g @shuji-bonji/w3c-mcp
```

Or use directly with npx:

```bash
npx @shuji-bonji/w3c-mcp
```

## Configuration

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "w3c": {
      "command": "npx",
      "args": ["-y", "@shuji-bonji/w3c-mcp"]
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json` in your project or global settings):

```json
{
  "mcpServers": {
    "w3c": {
      "command": "npx",
      "args": ["-y", "@shuji-bonji/w3c-mcp"]
    }
  }
}
```

## Available Tools

### Specification Discovery

#### `list_w3c_specs`
List W3C/WHATWG/IETF web specifications with optional filtering.

Parameters:
- `organization` (optional): Filter by organization - `"W3C"`, `"WHATWG"`, `"IETF"`, or `"all"`
- `keyword` (optional): Filter by keyword in title or shortname
- `category` (optional): Filter by category
- `limit` (optional): Maximum number of results (default: 50)

#### `get_w3c_spec`
Get detailed information about a specific web specification.

Parameters:
- `shortname` (required): Specification shortname (e.g., `"service-workers"`, `"appmanifest"`, `"fetch"`)

#### `search_w3c_specs`
Search web specifications by query string.

Parameters:
- `query` (required): Search query (e.g., `"service worker"`, `"manifest"`, `"storage"`)
- `limit` (optional): Maximum number of results (default: 20)

### WebIDL

#### `get_webidl`
Get WebIDL interface definitions for a specification. WebIDL defines the JavaScript APIs.

Parameters:
- `shortname` (required): Specification shortname (e.g., `"service-workers"`, `"fetch"`, `"dom"`)

#### `list_webidl_specs`
List all specifications that have WebIDL definitions available.

### CSS

#### `get_css_properties`
Get CSS property definitions from a specific spec or all specs.

Parameters:
- `spec` (optional): Specification shortname (e.g., `"css-grid-1"`, `"css-flexbox-1"`)
- `property` (optional): Search for a specific CSS property by name

#### `list_css_specs`
List all CSS specifications that have property definitions available.

### HTML Elements

#### `get_html_elements`
Get HTML element definitions from a specific spec or all specs.

Parameters:
- `spec` (optional): Specification shortname (e.g., `"html"`, `"svg"`)
- `element` (optional): Search for a specific element by name (e.g., `"video"`, `"canvas"`)

#### `list_element_specs`
List all specifications that have HTML element definitions available.

### PWA

#### `get_pwa_specs`
Get all Progressive Web App (PWA) related specifications.

Parameters:
- `coreOnly` (optional): If true, return only the core PWA specs (Service Worker, Manifest, Push, Notifications)

#### `get_spec_dependencies`
Get dependency information for a specification.

Parameters:
- `shortname` (required): Specification shortname

## Usage Examples

### Find Service Worker APIs

```
Use the get_webidl tool with shortname "service-workers" to see the ServiceWorker interface definitions.
```

### Explore PWA Technologies

```
Use get_pwa_specs to see all PWA-related specifications, then use get_w3c_spec for details on each one.
```

### Look up CSS Grid Properties

```
Use get_css_properties with spec "css-grid-1" to see all CSS Grid layout properties.
```

### Search for Storage APIs

```
Use search_w3c_specs with query "storage" to find all storage-related specifications.
```

## Data Sources

This MCP server uses the following W3C/webref data packages:

| Package | Description |
|---------|-------------|
| [web-specs](https://www.npmjs.com/package/web-specs) | Metadata for all web specifications |
| [@webref/idl](https://www.npmjs.com/package/@webref/idl) | WebIDL interface definitions |
| [@webref/css](https://www.npmjs.com/package/@webref/css) | CSS properties and values |
| [@webref/elements](https://www.npmjs.com/package/@webref/elements) | HTML element definitions |

These packages are maintained by the W3C and provide machine-readable data extracted from official specifications.

**GitHub Repositories**:
- https://github.com/w3c/browser-specs
- https://github.com/w3c/webref

## Debug Mode

Enable debug logging with environment variables:

```bash
# Enable debug logging
W3C_MCP_DEBUG=true npx @shuji-bonji/w3c-mcp

# Enable performance logging only
W3C_MCP_PERF=true npx @shuji-bonji/w3c-mcp
```

Debug output includes:
- Tool call arguments
- Execution timing
- Data loading performance

## Architecture

```
src/
├── index.ts          # MCP server entry point
├── data/
│   └── loader.ts     # Data loading with caching
├── tools/            # Tool implementations
│   ├── list-specs.ts
│   ├── get-spec.ts
│   ├── search-specs.ts
│   ├── get-webidl.ts
│   ├── get-css.ts
│   ├── get-elements.ts
│   └── get-pwa-specs.ts
├── schemas/
│   └── index.ts      # Zod validation schemas
├── errors/
│   └── index.ts      # Custom error classes
├── utils/
│   └── logger.ts     # Debug logging utilities
└── types/
    └── index.ts      # TypeScript type definitions
```

### Performance

- **Startup**: ~70ms parallel preloading of all data
- **Spec Lookup**: O(1) using Map-based index
- **Search**: Optimized with early termination on exact matches

## Development

```bash
# Clone the repository
git clone https://github.com/shuji-bonji/w3c-mcp.git
cd w3c-mcp

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Run with debug logging
W3C_MCP_DEBUG=true npm start
```

## License

MIT
