# W3C MCP Server パフォーマンス改善提案

## 1. データローダーの改善 (`src/data/loader.ts`)

### 問題点
- 複数の同時リクエストで重複ロードが発生する可能性
- `findSpec` が毎回 O(n) の線形検索

### 改善策

```typescript
// Before: 単純なキャッシュ
let specsCache: SpecDetail[] | null = null;

// After: Promise-based singleton + インデックス
let specsPromise: Promise<SpecDetail[]> | null = null;
let specsIndex: Map<string, SpecDetail> | null = null;
```

**効果:**
- 同時リクエスト時の重複ロード防止
- `findSpec` が O(1) に改善（インデックス利用時）
- メモリ効率の改善（Mapによる高速検索）

---

## 2. 起動時プリロード (`src/index.ts`)

### 問題点
- 初回リクエスト時に全データロードが発生
- ユーザー体感の初回レスポンスが遅い

### 改善策

```typescript
async function main() {
  // サーバー起動時に並列でデータをプリロード
  await preloadAll();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

```typescript
// data/loader.ts に追加
export async function preloadAll(): Promise<void> {
  await Promise.all([
    loadSpecs(),
    loadWebIDLRaw(),
    loadCSS(),
    loadElements()
  ]);
}
```

**効果:**
- 初回リクエストのレスポンス時間改善
- バックグラウンドでの並列ロード

---

## 3. 検索アルゴリズムの最適化 (`src/tools/search-specs.ts`)

### 問題点
- 毎回全仕様をスキャン
- 文字列操作が非効率

### 改善策

```typescript
// Before: 毎回 split
const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

// After: 正規表現をプリコンパイル
const WORD_SPLIT_REGEX = /\s+/;
const queryWords = lowerQuery.split(WORD_SPLIT_REGEX).filter(w => w.length > 2);
```

```typescript
// shortname の長さチェックを先に
else if (lowerShortname.length > 3 && lowerQuery.includes(lowerShortname)) {
  // ...
}
```

**効果:**
- 正規表現のコンパイルコスト削減
- 不要な文字列操作の削減

---

## 4. 追加の改善提案

### 4.1 レスポンスのストリーミング（将来的な改善）

大量のデータを返す場合、JSON全体を構築せずにストリーミングで返す：

```typescript
// 現在
return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };

// 将来的にMCPがストリーミングをサポートした場合
// 部分的なレスポンスを順次送信
```

### 4.2 結果の制限とページネーション

```typescript
// list_w3c_specs にページネーション追加
{
  name: 'list_w3c_specs',
  inputSchema: {
    properties: {
      limit: { type: 'number', default: 50 },
      offset: { type: 'number', default: 0 },  // 追加
      // ...
    }
  }
}
```

### 4.3 WebIDLの部分ロード

全WebIDLをメモリに保持するのではなく、必要な仕様のみ読み込む：

```typescript
// 現在: 全ファイルを事前ロード
const idlData = await loadWebIDLRaw();

// 改善案: オンデマンドロード + LRUキャッシュ
const idlCache = new LRUCache<string, string>({ max: 50 });

export async function getWebIDLOnDemand(shortname: string): Promise<string> {
  if (idlCache.has(shortname)) {
    return idlCache.get(shortname)!;
  }
  // 単一ファイルのみ読み込み
  const content = await loadSingleIDL(shortname);
  idlCache.set(shortname, content);
  return content;
}
```

---

## 5. ベンチマーク推奨

改善前後の比較のため、以下の計測を推奨：

```typescript
// 計測ポイント
console.time('loadSpecs');
await loadSpecs();
console.timeEnd('loadSpecs');

console.time('searchSpecs');
await searchSpecs('service worker');
console.timeEnd('searchSpecs');

console.time('findSpec');
await findSpec('service-workers');
console.timeEnd('findSpec');
```

---

## 優先度

| 改善 | 効果 | 実装コスト | 優先度 |
|------|------|-----------|--------|
| Promise-based キャッシュ | 高 | 低 | ⭐⭐⭐ |
| Spec インデックス | 高 | 低 | ⭐⭐⭐ |
| 起動時プリロード | 中 | 低 | ⭐⭐⭐ |
| 検索最適化 | 低〜中 | 低 | ⭐⭐ |
| オンデマンドIDL | 中 | 中 | ⭐⭐ |
| ページネーション | 低 | 中 | ⭐ |

---

## 適用方法

1. `src/data/loader.ts` を改善版に置き換え
2. `src/index.ts` に `preloadAll()` 呼び出しを追加
3. `src/tools/search-specs.ts` を最適化版に置き換え
4. ビルド・テスト実行
