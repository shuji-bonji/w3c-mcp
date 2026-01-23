# W3C MCP Server - サンプル

このディレクトリには W3C MCP Server ツールのサンプル出力が含まれています。

## サンプルファイル

| ファイル | 説明 |
|---------|------|
| [pwa-specs.md](./pwa-specs.md) | `get_pwa_specs` による PWA 関連仕様 |
| [service-worker-webidl.md](./service-worker-webidl.md) | `get_webidl` による Service Worker WebIDL |
| [css-grid-properties.md](./css-grid-properties.md) | `get_css_properties` による CSS Grid プロパティ |
| [storage-specs-search.md](./storage-specs-search.md) | `search_w3c_specs` によるストレージ関連仕様検索 |

## ツール概要

### 仕様の検索・取得
- `list_w3c_specs` - W3C/WHATWG/IETF 仕様一覧
- `get_w3c_spec` - 仕様の詳細情報取得
- `search_w3c_specs` - クエリで仕様を検索

### WebIDL
- `get_webidl` - JavaScript API 定義取得
- `list_webidl_specs` - WebIDL がある仕様一覧

### CSS
- `get_css_properties` - CSS プロパティ定義取得
- `list_css_specs` - CSS 仕様一覧

### HTML 要素
- `get_html_elements` - HTML 要素定義取得
- `list_element_specs` - 要素定義がある仕様一覧

### PWA
- `get_pwa_specs` - PWA 関連仕様一覧
