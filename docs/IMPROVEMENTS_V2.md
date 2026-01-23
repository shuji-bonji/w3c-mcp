# W3C MCP Server 追加改善提案

## 現在の実装状況 ✅

前回の改善が反映済み：
- Promise-based シングルトンキャッシュ
- Spec インデックス（Map による O(1) 検索）
- 起動時プリロード
- 検索アルゴリズム最適化

---

## 追加改善提案

### 1. 型安全性の強化

#### 1.1 Zod スキーマによる入力バリデーション

現在、ツール引数の型チェックが `as` キャストに依存しています：

```typescript
// Before: 型安全ではない
const result = await listSpecs({
  organization: args?.organization as 'W3C' | 'WHATWG' | 'IETF' | 'all' | undefined,
  // ...
});
```

```typescript
// After: Zod でバリデーション
import { z } from 'zod';

const ListSpecsSchema = z.object({
  organization: z.enum(['W3C', 'WHATWG', 'IETF', 'all']).optional(),
  keyword: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().min(1).max(500).optional().default(50)
});

// ツール実行時
case 'list_w3c_specs': {
  const validated = ListSpecsSchema.parse(args);
  const result = await listSpecs(validated);
  // ...
}
```

---

### 2. エラーハンドリングの改善

#### 2.1 カスタムエラークラス

```typescript
// src/errors/index.ts
export class SpecNotFoundError extends Error {
  constructor(shortname: string, suggestions?: string[]) {
    const message = suggestions?.length
      ? `Specification "${shortname}" not found. Did you mean: ${suggestions.join(', ')}?`
      : `Specification "${shortname}" not found.`;
    super(message);
    this.name = 'SpecNotFoundError';
  }
}

export class WebIDLNotFoundError extends Error {
  constructor(shortname: string) {
    super(`WebIDL not found for "${shortname}". This spec might not have WebIDL definitions.`);
    this.name = 'WebIDLNotFoundError';
  }
}
```

#### 2.2 エラーレスポンスの構造化

```typescript
// Before
return {
  content: [{ type: 'text', text: `Error: ${error.message}` }],
  isError: true
};

// After: 構造化エラー
return {
  content: [{
    type: 'text',
    text: JSON.stringify({
      error: error.name,
      message: error.message,
      suggestions: error instanceof SpecNotFoundError ? error.suggestions : undefined
    }, null, 2)
  }],
  isError: true
};
```

---

### 3. メモリ使用量の最適化

#### 3.1 WeakRef によるキャッシュ管理（Node.js 14+）

長時間稼働時のメモリ解放を可能に：

```typescript
// 大きなデータに対してのみ適用
let idlWeakRef: WeakRef<Record<string, string>> | null = null;
let idlPromise: Promise<Record<string, string>> | null = null;

export async function loadWebIDLRaw(): Promise<Record<string, string>> {
  // WeakRef から取得を試みる
  const cached = idlWeakRef?.deref();
  if (cached) return cached;
  
  if (!idlPromise) {
    idlPromise = (async () => {
      const data = await actualLoadWebIDL();
      idlWeakRef = new WeakRef(data);
      idlPromise = null; // 次回ロード可能に
      return data;
    })();
  }
  return idlPromise;
}
```

※ 注意: MCPサーバーは短命なことが多いため、これは長時間稼働する場合のみ有効

---

### 4. ログとデバッグ機能

#### 4.1 環境変数によるデバッグモード

```typescript
// src/utils/logger.ts
const DEBUG = process.env.W3C_MCP_DEBUG === 'true';

export function debug(message: string, data?: unknown): void {
  if (DEBUG) {
    console.error(`[DEBUG] ${message}`, data ? JSON.stringify(data) : '');
  }
}

export function logPerformance(label: string, startTime: number): void {
  if (DEBUG) {
    console.error(`[PERF] ${label}: ${Date.now() - startTime}ms`);
  }
}
```

#### 4.2 使用例

```typescript
import { debug, logPerformance } from '../utils/logger.js';

export async function searchSpecs(query: string, limit: number = 20) {
  const startTime = Date.now();
  debug('searchSpecs called', { query, limit });
  
  // ... 処理 ...
  
  logPerformance('searchSpecs', startTime);
  return results;
}
```

---

### 5. テスト用のモック対応

#### 5.1 依存性注入パターン

```typescript
// src/data/loader.ts
export interface DataLoader {
  loadSpecs(): Promise<SpecDetail[]>;
  loadWebIDLRaw(): Promise<Record<string, string>>;
  loadCSS(): Promise<CSSData>;
  loadElements(): Promise<Record<string, ElementSpecData>>;
}

// デフォルト実装
export const defaultLoader: DataLoader = {
  loadSpecs,
  loadWebIDLRaw,
  loadCSS,
  loadElements
};

// テスト用モック
export function createMockLoader(overrides: Partial<DataLoader>): DataLoader {
  return { ...defaultLoader, ...overrides };
}
```

---

### 6. README とドキュメントの改善

#### 6.1 使用例の追加

```markdown
## 使用例

### Claude での使用

```
User: Service Worker の Cache API について教えて

Claude: [get_webidl を shortname "service-workers" で呼び出し]
Cache API の WebIDL 定義を取得しました...
```

### プログラマティックな使用

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({ name: 'my-app', version: '1.0.0' });
// ... 接続設定 ...

const result = await client.callTool('get_pwa_specs', { coreOnly: true });
console.log(result);
```
```

---

### 7. CI/CD と品質管理

#### 7.1 GitHub Actions ワークフロー

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm test
      
  publish:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### 7.2 package.json へのスクリプト追加

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js",
    "test": "node --test",
    "lint": "eslint src/**/*.ts",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  }
}
```

---

## 優先度マトリクス

| 改善 | 効果 | 実装コスト | 優先度 |
|------|------|-----------|--------|
| Zod バリデーション | 中 | 低 | ⭐⭐⭐ |
| カスタムエラー | 中 | 低 | ⭐⭐⭐ |
| デバッグログ | 中 | 低 | ⭐⭐ |
| CI/CD | 高 | 中 | ⭐⭐⭐ |
| テストモック | 中 | 中 | ⭐⭐ |
| WeakRef キャッシュ | 低 | 中 | ⭐ |
| README 改善 | 高 | 低 | ⭐⭐⭐ |

---

## 次のステップ

1. **v0.1.1**: Zod バリデーション + カスタムエラー
2. **v0.2.0**: CI/CD + テスト追加
3. **v0.3.0**: npm publish + MCP Registry 登録
