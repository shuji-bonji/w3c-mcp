# W3C MCP Server

[![npm version](https://img.shields.io/npm/v/@shuji-bonji/w3c-mcp.svg)](https://www.npmjs.com/package/@shuji-bonji/w3c-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-blueviolet?logo=anthropic)](https://claude.ai/code)

W3C/WHATWG/IETF の Web 仕様にアクセスするための MCP Server です。AI アシスタントに公式 Web 標準データ（仕様、WebIDL 定義、CSS プロパティ、HTML 要素）へのアクセスを提供します。

## インストール

```bash
npm install -g @shuji-bonji/w3c-mcp
```

または npx で直接実行:

```bash
npx @shuji-bonji/w3c-mcp
```

## 設定

### Claude Desktop

Claude Desktop の設定ファイルに追加してください:

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

Cursor の MCP 設定（プロジェクトの `.cursor/mcp.json` またはグローバル設定）に追加:

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

## 利用可能なツール

### 仕様の検索・取得

#### `list_w3c_specs`
W3C/WHATWG/IETF の Web 仕様一覧を取得します。

パラメータ:
- `organization` (任意): 組織でフィルタ - `"W3C"`, `"WHATWG"`, `"IETF"`, `"all"`
- `keyword` (任意): タイトルまたは shortname でフィルタ
- `category` (任意): カテゴリでフィルタ
- `limit` (任意): 最大件数 (デフォルト: 50)

#### `get_w3c_spec`
特定の Web 仕様の詳細情報を取得します。

パラメータ:
- `shortname` (必須): 仕様の shortname (例: `"service-workers"`, `"appmanifest"`, `"fetch"`)

#### `search_w3c_specs`
クエリ文字列で Web 仕様を検索します。

パラメータ:
- `query` (必須): 検索クエリ (例: `"service worker"`, `"manifest"`, `"storage"`)
- `limit` (任意): 最大件数 (デフォルト: 20)

### WebIDL

#### `get_webidl`
仕様の WebIDL インターフェース定義を取得します。WebIDL は JavaScript API を定義しています。

パラメータ:
- `shortname` (必須): 仕様の shortname (例: `"service-workers"`, `"fetch"`, `"dom"`)

#### `list_webidl_specs`
WebIDL 定義がある仕様の一覧を取得します。

### CSS

#### `get_css_properties`
特定の仕様または全仕様から CSS プロパティ定義を取得します。

パラメータ:
- `spec` (任意): 仕様の shortname (例: `"css-grid-1"`, `"css-flexbox-1"`)
- `property` (任意): 特定の CSS プロパティを名前で検索

#### `list_css_specs`
CSS プロパティ定義がある仕様の一覧を取得します。

### HTML 要素

#### `get_html_elements`
特定の仕様または全仕様から HTML 要素定義を取得します。

パラメータ:
- `spec` (任意): 仕様の shortname (例: `"html"`, `"svg"`)
- `element` (任意): 特定の要素を名前で検索 (例: `"video"`, `"canvas"`)

#### `list_element_specs`
HTML 要素定義がある仕様の一覧を取得します。

### PWA

#### `get_pwa_specs`
Progressive Web App (PWA) 関連の全仕様を取得します。

パラメータ:
- `coreOnly` (任意): true の場合、コア PWA 仕様のみ返す (Service Worker, Manifest, Push, Notifications)

#### `get_spec_dependencies`
仕様の依存関係情報を取得します。

パラメータ:
- `shortname` (必須): 仕様の shortname

## 使用例

### Service Worker API を調べる

```
get_webidl ツールで shortname "service-workers" を指定して ServiceWorker インターフェース定義を取得
```

### PWA 技術を探索する

```
get_pwa_specs で PWA 関連の全仕様を取得し、get_w3c_spec で各仕様の詳細を確認
```

### CSS Grid プロパティを調べる

```
get_css_properties で spec "css-grid-1" を指定して CSS Grid レイアウトの全プロパティを取得
```

### ストレージ API を検索する

```
search_w3c_specs で query "storage" を指定してストレージ関連の仕様を検索
```

## データソース

この MCP サーバーは以下の W3C/webref データパッケージを使用しています:

| パッケージ | 説明 |
|-----------|------|
| [web-specs](https://www.npmjs.com/package/web-specs) | 全 Web 仕様のメタデータ |
| [@webref/idl](https://www.npmjs.com/package/@webref/idl) | WebIDL インターフェース定義 |
| [@webref/css](https://www.npmjs.com/package/@webref/css) | CSS プロパティと値 |
| [@webref/elements](https://www.npmjs.com/package/@webref/elements) | HTML 要素定義 |

これらのパッケージは W3C によってメンテナンスされており、公式仕様から抽出された機械可読データを提供しています。

**GitHub リポジトリ**:
- https://github.com/w3c/browser-specs
- https://github.com/w3c/webref

## デバッグモード

環境変数でデバッグログを有効化できます:

```bash
# デバッグログを有効化
W3C_MCP_DEBUG=true npx @shuji-bonji/w3c-mcp

# パフォーマンスログのみ有効化
W3C_MCP_PERF=true npx @shuji-bonji/w3c-mcp
```

デバッグ出力には以下が含まれます:
- ツール呼び出しの引数
- 実行時間
- データロードのパフォーマンス

## アーキテクチャ

```
src/
├── index.ts          # MCP サーバーエントリポイント
├── data/
│   └── loader.ts     # キャッシュ付きデータロード
├── tools/            # ツール実装
│   ├── list-specs.ts
│   ├── get-spec.ts
│   ├── search-specs.ts
│   ├── get-webidl.ts
│   ├── get-css.ts
│   ├── get-elements.ts
│   └── get-pwa-specs.ts
├── schemas/
│   └── index.ts      # Zod バリデーションスキーマ
├── errors/
│   └── index.ts      # カスタムエラークラス
├── utils/
│   ├── logger.ts     # デバッグログユーティリティ
│   └── mapper.ts     # Spec データマッピングユーティリティ
└── types/
    └── index.ts      # TypeScript 型定義
```

### パフォーマンス

- **起動時間**: 約70ms（全データの並列プリロード）
- **仕様検索**: O(1)（Map ベースのインデックス使用）
- **テキスト検索**: 完全一致時の早期終了で最適化

## 開発

```bash
# リポジトリをクローン
git clone https://github.com/shuji-bonji/w3c-mcp.git
cd w3c-mcp

# 依存関係をインストール
npm install

# ビルド
npm run build

# 開発モードで実行
npm run dev

# デバッグログ付きで実行
W3C_MCP_DEBUG=true npm start
```

## ライセンス

MIT
