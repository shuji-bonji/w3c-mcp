# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2026-02-01

### Changed

- **Custom Error Classes**: Now properly used in all tool implementations
  - `get-spec.ts` uses `SpecNotFoundError` with suggestions
  - `get-webidl.ts` uses `WebIDLNotFoundError` with suggestions
  - `get-elements.ts` uses `ElementsNotFoundError` with limited suggestion count
- **Dependency Versions**: Fixed versions for `@webref/*` and `web-specs` packages (previously `"latest"`)
  - `@webref/css`: `^8.2.1`
  - `@webref/elements`: `^2.6.1`
  - `@webref/idl`: `^3.71.1`
  - `web-specs`: `^3.76.0`
- **Server Version**: Now dynamically loaded from `package.json`

### Added

- **Utility Functions**: `toSpecSummary()` and `toSpecSummaries()` in `src/utils/mapper.ts`
  - Consolidates SpecSummary mapping logic from 4 different files

### Fixed

- `ElementsNotFoundError` now limits available specs to 10 in error message (prevents overly long messages)
- Removed unused `_foundPerfectMatch` variable in `search-specs.ts`

## [0.1.2] - 2025-01-24

### Added

- **Test Suite**: Comprehensive test coverage with Vitest (163 tests)
  - Unit tests for all data loaders and tools
  - Integration tests for MCP server functionality
  - ~82% code coverage
- **Biome**: Fast linter and formatter for code quality
  - ESLint + Prettier replacement
  - Configured with TypeScript support

### Changed

- Code cleanup via Biome auto-fixes (unused imports, `node:` protocol, etc.)

## [0.2.0] - 2025-01-24

### Added

- **Zod Input Validation**: Type-safe validation for all tool inputs with structured error responses
- **Custom Error Classes**: `SpecNotFoundError`, `WebIDLNotFoundError`, `CSSNotFoundError`, `ElementsNotFoundError`, `ValidationError` with helpful suggestions
- **Debug Logging**: Environment-based logging controlled by `W3C_MCP_DEBUG=true`
- **Performance Logging**: Timing information for tool calls with `W3C_MCP_PERF=true`
- **CI/CD Pipeline**: GitHub Actions workflow for Node.js 18/20/22 with automatic npm publishing

### Changed

- Structured error responses with JSON format including error type, message, and suggestions
- Improved error messages for not-found scenarios

### Performance

- Promise-based singleton caching prevents duplicate data loads
- Map-based spec index for O(1) lookups (previously O(n))
- Parallel data preloading at server startup (~70ms total)
- Optimized search with pre-compiled regex and early termination

## [0.1.0] - 2025-01-24

### Added

- Initial release of W3C MCP Server
- **Specification Discovery Tools**
  - `list_w3c_specs` - List W3C/WHATWG/IETF web specifications with filtering
  - `get_w3c_spec` - Get detailed information about a specific specification
  - `search_w3c_specs` - Search specifications by query
- **WebIDL Tools**
  - `get_webidl` - Get WebIDL interface definitions for a specification
  - `list_webidl_specs` - List all specs with WebIDL definitions
- **CSS Tools**
  - `get_css_properties` - Get CSS property definitions
  - `list_css_specs` - List all CSS specifications
- **HTML Elements Tools**
  - `get_html_elements` - Get HTML element definitions
  - `list_element_specs` - List all specs with element definitions
- **PWA Tools**
  - `get_pwa_specs` - Get all PWA-related specifications
  - `get_spec_dependencies` - Get specification dependency information
