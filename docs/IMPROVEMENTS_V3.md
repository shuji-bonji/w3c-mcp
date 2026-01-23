# W3C MCP Server 追加改善提案 V3

## 現在の状況

V2 の改善がすべて反映済み。コード品質は非常に高い状態です。

---

## 1. schemas/index.ts の改善

### 問題点
現在の `validateInput` の戻り値型が不正確：

```typescript
// 現在
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError }
```

### 改善案

```typescript
// src/schemas/index.ts

/**
 * Zod schemas for input validation
 */

import { z } from 'zod';

// List specs schema
export const ListSpecsSchema = z.object({
  organization: z.enum(['W3C', 'WHATWG', 'IETF', 'all']).optional(),
  keyword: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().min(1).max(500).optional().default(50)
});

export type ListSpecsInput = z.infer<typeof ListSpecsSchema>;

// Get spec schema
export const GetSpecSchema = z.object({
  shortname: z.string().min(1, 'shortname is required')
});

export type GetSpecInput = z.infer<typeof GetSpecSchema>;

// Search specs schema
export const SearchSpecsSchema = z.object({
  query: z.string().min(1, 'query is required'),
  limit: z.number().min(1).max(100).optional().default(20)
});

export type SearchSpecsInput = z.infer<typeof SearchSpecsSchema>;

// Get WebIDL schema
export const GetWebIDLSchema = z.object({
  shortname: z.string().min(1, 'shortname is required')
});

export type GetWebIDLInput = z.infer<typeof GetWebIDLSchema>;

// Get CSS properties schema
export const GetCSSPropertiesSchema = z.object({
  spec: z.string().optional(),
  property: z.string().optional()
});

export type GetCSSPropertiesInput = z.infer<typeof GetCSSPropertiesSchema>;

// Get elements schema
export const GetElementsSchema = z.object({
  spec: z.string().optional(),
  element: z.string().optional()
});

export type GetElementsInput = z.infer<typeof GetElementsSchema>;

// Get PWA specs schema
export const GetPwaSpecsSchema = z.object({
  coreOnly: z.boolean().optional().default(false)
});

export type GetPwaSpecsInput = z.infer<typeof GetPwaSpecsSchema>;

// Get spec dependencies schema
export const GetSpecDependenciesSchema = z.object({
  shortname: z.string().min(1, 'shortname is required')
});

export type GetSpecDependenciesInput = z.infer<typeof GetSpecDependenciesSchema>;

/**
 * Validate input against a schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
```

---

## 2. errors/index.ts の改善

### 問題点
`ValidationError` が `z.ZodError` を受け取るが、`index.ts` では文字列を渡している可能性

### 改善案

```typescript
// src/errors/index.ts

import { z } from 'zod';

/**
 * Base class for W3C MCP errors
 */
export class W3CMCPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'W3CMCPError';
  }
}

/**
 * Spec not found error with suggestions
 */
export class SpecNotFoundError extends W3CMCPError {
  public suggestions?: string[];

  constructor(shortname: string, suggestions?: string[]) {
    const message = suggestions?.length
      ? `Specification "${shortname}" not found. Did you mean: ${suggestions.join(', ')}?`
      : `Specification "${shortname}" not found.`;
    super(message);
    this.name = 'SpecNotFoundError';
    this.suggestions = suggestions;
  }
}

/**
 * WebIDL not found error
 */
export class WebIDLNotFoundError extends W3CMCPError {
  constructor(shortname: string) {
    super(`WebIDL not found for "${shortname}". This specification might not have WebIDL definitions.`);
    this.name = 'WebIDLNotFoundError';
  }
}

/**
 * CSS data not found error
 */
export class CSSNotFoundError extends W3CMCPError {
  constructor(spec: string, availableSpecs?: string[]) {
    const message = availableSpecs?.length
      ? `CSS data not found for "${spec}". Available CSS specs: ${availableSpecs.slice(0, 10).join(', ')}...`
      : `CSS data not found for "${spec}".`;
    super(message);
    this.name = 'CSSNotFoundError';
  }
}

/**
 * Elements data not found error
 */
export class ElementsNotFoundError extends W3CMCPError {
  constructor(spec: string, availableSpecs?: string[]) {
    const message = availableSpecs?.length
      ? `Elements data not found for "${spec}". Available specs: ${availableSpecs.join(', ')}`
      : `Elements data not found for "${spec}".`;
    super(message);
    this.name = 'ElementsNotFoundError';
  }
}

/**
 * Validation error wrapper
 */
export class ValidationError extends W3CMCPError {
  public zodError: z.ZodError;

  constructor(zodError: z.ZodError) {
    const issues = zodError.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    super(`Validation error: ${issues}`);
    this.name = 'ValidationError';
    this.zodError = zodError;
  }
}

/**
 * Format error response for MCP
 */
export function formatErrorResponse(error: unknown): { text: string; errorType: string } {
  if (error instanceof ValidationError) {
    return {
      text: JSON.stringify({
        error: 'ValidationError',
        message: error.message,
        issues: error.zodError.issues
      }, null, 2),
      errorType: 'ValidationError'
    };
  }

  if (error instanceof SpecNotFoundError) {
    return {
      text: JSON.stringify({
        error: 'SpecNotFoundError',
        message: error.message,
        suggestions: error.suggestions
      }, null, 2),
      errorType: 'SpecNotFoundError'
    };
  }

  if (error instanceof W3CMCPError) {
    return {
      text: JSON.stringify({
        error: error.name,
        message: error.message
      }, null, 2),
      errorType: error.name
    };
  }

  if (error instanceof Error) {
    return {
      text: `Error: ${error.message}`,
      errorType: 'Error'
    };
  }

  return {
    text: 'An unknown error occurred',
    errorType: 'UnknownError'
  };
}
```

---

## 3. index.ts の修正

```typescript
// ValidationError の使い方を修正
case 'list_w3c_specs': {
  const validation = validateInput(ListSpecsSchema, args);
  if (!validation.success) throw new ValidationError(validation.error); // z.ZodError を渡す
  result = await listSpecs(validation.data);
  break;
}
```

---

## 4. CHANGELOG.md の追加

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-01-24

### Added
- Zod input validation for all tools
- Custom error classes with suggestions
- Debug logging (W3C_MCP_DEBUG=true)
- Performance logging (W3C_MCP_PERF=true)
- CI/CD with GitHub Actions

### Changed
- Improved error messages with structured JSON responses
- Promise-based singleton caching for data loading
- O(1) spec lookup using Map index

### Performance
- Parallel data preloading at startup (~70ms)
- Optimized search algorithm with early termination

## [0.1.0] - 2025-01-24

### Added
- Initial release
- 11 tools for W3C/WHATWG/IETF specification access
- PWA-related specifications aggregation
- WebIDL, CSS, HTML elements support
```

---

## 5. README.md のバッジ追加

```markdown
# W3C MCP Server

[![npm version](https://img.shields.io/npm/v/@shuji-bonji/w3c-mcp-server.svg)](https://www.npmjs.com/package/@shuji-bonji/w3c-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

...
```

---

## 6. npm publish 前のチェックリスト

- [ ] `package.json` の version を確認
- [ ] `npm run build` が成功するか
- [ ] `npm pack` でパッケージ内容を確認
- [ ] README.md が充実しているか
- [ ] LICENSE ファイルがあるか
- [ ] `.npmignore` または `files` フィールドで不要ファイルを除外

---

## 優先度

| 改善 | 効果 | 実装コスト | 優先度 |
|------|------|-----------|--------|
| ValidationError 修正 | 高 | 低 | ⭐⭐⭐ |
| CHANGELOG.md | 中 | 低 | ⭐⭐⭐ |
| README バッジ | 低 | 低 | ⭐⭐ |
| npm publish | 高 | 低 | ⭐⭐⭐ |
