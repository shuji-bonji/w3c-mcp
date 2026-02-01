# CLAUDE.md

This file provides guidance for Claude Code when working on this project.

## Project Overview

W3C MCP Server - An MCP (Model Context Protocol) server that provides access to W3C/WHATWG/IETF web specifications. It enables AI assistants to query official web standards data including specifications, WebIDL definitions, CSS properties, and HTML elements.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript (ES Modules)
- **MCP SDK**: @modelcontextprotocol/sdk
- **Validation**: Zod
- **Testing**: Vitest
- **Linting/Formatting**: Biome

## Project Structure

```
src/
├── index.ts              # MCP server entry point, tool definitions
├── data/
│   └── loader.ts         # Data loading with Promise-based caching
├── tools/                # Tool implementations
│   ├── list-specs.ts     # list_w3c_specs
│   ├── get-spec.ts       # get_w3c_spec, get_spec_dependencies
│   ├── search-specs.ts   # search_w3c_specs
│   ├── get-webidl.ts     # get_webidl, list_webidl_specs
│   ├── get-css.ts        # get_css_properties, list_css_specs
│   ├── get-elements.ts   # get_html_elements, list_element_specs
│   └── get-pwa-specs.ts  # get_pwa_specs
├── schemas/
│   └── index.ts          # Zod validation schemas for tool inputs
├── errors/
│   └── index.ts          # Custom error classes with suggestions
├── utils/
│   ├── logger.ts         # Debug/performance logging
│   └── mapper.ts         # SpecSummary mapping utilities
└── types/
    └── index.ts          # TypeScript type definitions
```

## Common Commands

```bash
npm run build      # Compile TypeScript
npm run dev        # Watch mode compilation
npm test           # Run tests
npm run lint       # Run Biome linter
npm run check      # Lint + format (auto-fix)
```

## Code Conventions

### Error Handling

- Use custom error classes from `src/errors/index.ts`
- `SpecNotFoundError` - for missing specs (includes suggestions)
- `WebIDLNotFoundError` - for missing WebIDL (includes suggestions)
- `CSSNotFoundError` - for missing CSS data
- `ElementsNotFoundError` - for missing elements data (limit suggestions to 10)
- `ValidationError` - for Zod validation failures
- All errors are formatted via `formatErrorResponse()` for structured JSON output

### Data Mapping

- Use `toSpecSummary()` / `toSpecSummaries()` from `src/utils/mapper.ts`
- Do not duplicate SpecDetail → SpecSummary mapping logic

### Dependencies

- Use fixed versions (with `^`) for data packages (`@webref/*`, `web-specs`)
- Server version is dynamically loaded from `package.json`

### Imports

- Use `.js` extension for local imports (ES Modules requirement)
- Use `node:` prefix for Node.js built-in modules

## Data Sources

Data comes from npm packages maintained by W3C:
- `web-specs` - Specification metadata
- `@webref/idl` - WebIDL definitions
- `@webref/css` - CSS properties
- `@webref/elements` - HTML element definitions

## Testing

- Tests are in `tests/` directory
- Use Vitest with the existing setup
- Run `npm test` before committing changes
