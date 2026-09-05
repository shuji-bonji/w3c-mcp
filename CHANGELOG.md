# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-09-05

### Changed

- **MCP SDK v2**: Migrated from `@modelcontextprotocol/sdk` (v1) to
  `@modelcontextprotocol/server` `^2.0.0`. The server is now built on
  `McpServer.registerTool()` with the zod schemas in `src/schemas/index.ts`;
  the hand-written JSON Schema in `src/index.ts` and the `switch`-based
  dispatcher are gone. `tools/list` publishes the JSON Schema generated from
  zod (field descriptions are kept via `.describe()`).
- **Protocol negotiation**: The server starts through `serveStdio()`, which
  answers both the `initialize` opening (protocol revisions 2024-11-05 through
  2025-11-25) and the `server/discover` opening introduced in revision
  2026-07-28.
- **Input validation**: The SDK validates tool arguments against the zod
  schema before the handler runs. A validation failure is returned as an
  `isError` text result whose wording comes from the SDK
  (`Input validation error: ...`) instead of the previous
  `{ "error": "ValidationError", ... }` JSON payload. Other errors
  (`SpecNotFoundError`, `WebIDLNotFoundError`, ...) keep the same JSON format.
- **TypeScript 7**: Build now uses the Go-based `tsc` (`typescript@^7.0.2`).
  `tsconfig.json` gained `"types": ["node"]` because TypeScript 7 no longer
  picks up `@types/*` automatically. `@types/node` bumped to `^22`. Emitted
  JavaScript is identical to the TypeScript 5.9 output.

### Removed

- **`get_spec_dependencies` tool** (deprecated since 0.1.9). Upstream
  `web-specs` never exposed dependency data, so the tool only ever returned
  empty arrays. Use `get_w3c_spec` instead. The `getSpecDependencies()`
  function, `DependencyInfo` type and `GetSpecDependenciesSchema` were removed
  as well.

## [0.1.12] - 2026-07-14

### Added

- **`.claude-plugin/plugin.json`**: Claude Code plugin manifest so the server
  can be installed as a plugin (`mcpServers.w3c` runs
  `npx -y @shuji-bonji/w3c-mcp@latest`).

### Changed

- **Biome 2.5**: Migrated `biome.json` (`recommended` → `preset`).
- **CI**: `actions/checkout` bumped from 6 to 7.

## [0.1.10] - 2026-05-06

### Changed

- **zod 4**: Bumped `zod` from `^3.25.76` to `^4.4.3`.
- **`@webref/*` / `web-specs`**: Weekly Dependabot group update (3 packages).
- **CI**: `actions/checkout` 4 → 6, `actions/setup-node` 4 → 6.

## [0.1.11] - 2026-05-09

### Build

- **build script に `chmod +x dist/index.js` を追加**: local dev で `./dist/index.js` を直接実行した際の `permission denied` を回避。npm install / npx 経由の通常利用には影響なし (npm が install 時に bin を chmod するため)。shuji 製 MCP 全体で build script を統一。
- **`biome.json` の `$schema` を 2.4.12 → 2.4.14 に更新**: ローカル CLI バージョンと一致させて `biome check` 時の info ログを解消。

## [0.1.9] - 2026-04-23

### Changed

- **Release pipeline**: Migrated to npm Trusted Publisher (OIDC). No `NPM_TOKEN`
  secret is required anymore; the publish job uses `id-token: write` +
  `--provenance`. Because `npm` bundled with Node 22 is too old for Trusted
  Publisher (needs `npm >= 11.5.1`), the publish step now shells out via
  `npx -y npm@latest publish`.
- **CI startup check**: The `Test startup` step no longer depends on log string
  grep. It now sends a JSON-RPC `initialize` request over stdio and verifies
  the server responds with a valid `result.serverInfo`, which is resilient to
  future log-wording changes.
- **`@biomejs/biome`**: Bumped from `^2.3.12` to `^2.4.12` to match the current
  CLI (removes the `$schema` version mismatch info log on `npm run check`).

### Deprecated

- **`get_spec_dependencies` tool**: Marked as `[DEPRECATED]` in the tool
  description and with a `@deprecated` JSDoc tag. Upstream `web-specs` does not
  expose dependency-graph data, so this tool currently returns empty
  `dependencies` / `dependents` arrays. It is scheduled for removal in the next
  major release. Use `get_w3c_spec` for basic spec metadata instead.

### Added

- **Dependabot weekly updates** (`.github/dependabot.yml`): `@webref/*` and
  `web-specs` are grouped into a single weekly PR; dev dependencies are grouped
  separately; `github-actions` updates are tracked on the same weekly cadence.

### Docs

- **`CLAUDE.md`** trimmed from 94 → 65 lines. Removed sections that duplicate
  `package.json` or are derivable from the filesystem (`Tech Stack`,
  `Project Structure`, `Data Sources`, `Testing`). Added a `Release` section
  documenting the Trusted Publisher flow and a `Constants and hardcoding`
  convention block.

## [0.1.8] - 2026-04-15

### Fixed

- **README**: Documentation corrections and alignment with current implementation
  - `get_spec_dependencies` description now matches the actual tool behavior (dependency data is not yet exposed by upstream `web-specs`; returns empty arrays)
  - Added Linux path for `claude_desktop_config.json` (previously only macOS and Windows were documented)
  - Added Claude Code (`claude mcp add`) setup instructions
- **README.ja.md**: Resolved asymmetry with the English README
  - Added a link back to the English README
  - Added the `tests/` sub-tree to the architecture section
  - Added missing development commands (`test`, `test:coverage`, `lint`, `format`, `check`)
- **npm package**: Added `README.ja.md` to the `files` field in `package.json`
  - The "日本語版 README" link on the npm page now resolves correctly (previously 404 on npm, only worked on GitHub)

## [0.1.7] - 2026-02-05

### Fixed

- **npm package**: Added `README.md` to `files` field in `package.json`
  - Previously README was not included in published package
  - npm now displays the README on the package page

## [0.1.6] - 2026-02-05

### Added

- **`src/constants/index.ts`**: Centralized configuration constants
  - `SEARCH_SCORES` - All search scoring values with `as const`
  - `SearchScoreKey`, `SearchScoreValue` types for type-safe score access
  - `PwaShortname`, `CorePwaShortname`, `PwaKeyword` types derived from const arrays
  - `DEFAULT_LIST_LIMIT`, `MAX_LIST_LIMIT`, `DEFAULT_SEARCH_LIMIT`, `MAX_SEARCH_LIMIT`
  - `CSSWG_URL_PATTERN`, `UNKNOWN_SPEC` for CSS URL parsing
- **`src/utils/suggestions.ts`**: DRY extraction of suggestion generation
  - `generateSpecSuggestions()` - Generate suggestions for spec lookups
  - `generateWebIDLSuggestions()` - Generate suggestions for WebIDL lookups
  - `toOptionalSuggestions()` - Convert empty arrays to undefined
- **`src/utils/search.ts`**: Generic search utilities
  - `filterByName<T>()` - Generic filter function for name-based search
  - `normalizeElementName()` - Normalize element names (strip angle brackets)
- **`ErrorResponse` interface**: Structured error response type in `src/errors/index.ts`

### Changed

- **Refactored tool implementations** to use centralized constants
  - `search-specs.ts` - Uses `SEARCH_SCORES` constants
  - `get-css.ts` - Uses `CSSWG_URL_PATTERN`, `UNKNOWN_SPEC`
  - `get-pwa-specs.ts` - Uses `PWA_SHORTNAMES`, `CORE_PWA_SHORTNAMES`, `PWA_KEYWORDS`
- **Refactored error handling** to use `toJsonResponse()` helper
- **Improved type safety** with const assertions and derived types

### Testing

- Test coverage increased from 83.47% to **86.7%**
- Test count increased from 163 to **190 tests**
- `errors/index.ts` now has **100% coverage** (was 85.32%)
- Added coverage tests for:
  - `QUERY_CONTAINS_SHORTNAME` score branch
  - `ALL_WORDS_MATCH` score branch
  - Abstract/description matching
  - All error class variations (`WebIDLNotFoundError`, `CSSNotFoundError`, `ElementsNotFoundError`)

## [0.1.5] - 2026-02-01

### Fixed

- **`get-webidl.ts`**: Multiple match case now uses `WebIDLNotFoundError` with suggestions
  - Previously used generic `Error`, now LLM receives suggestions for exact shortnames
- **`getSpecDependencies`**: Now uses `SpecNotFoundError` with suggestions
  - Previously used generic `Error`, matching the pattern in `getSpec()`
- **`formatErrorResponse`**: Added proper handling for `WebIDLNotFoundError` suggestions
  - Previously `WebIDLNotFoundError` suggestions were not included in error response

### Changed

- **`WebIDLNotFoundError`**: Added `multipleMatch` parameter for accurate error messages
- **`get_spec_dependencies` tool description**: Updated to clarify that dependency data is not yet available from upstream data source

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
