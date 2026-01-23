# W3C MCP Server - Examples

This directory contains sample outputs from the W3C MCP Server tools.

## Sample Files

| File | Description |
|------|-------------|
| [pwa-specs.md](./pwa-specs.md) | PWA-related specifications from `get_pwa_specs` |
| [service-worker-webidl.md](./service-worker-webidl.md) | Service Worker WebIDL from `get_webidl` |
| [css-grid-properties.md](./css-grid-properties.md) | CSS Grid properties from `get_css_properties` |
| [storage-specs-search.md](./storage-specs-search.md) | Storage-related specs from `search_w3c_specs` |

## Tool Overview

### Specification Discovery
- `list_w3c_specs` - List all W3C/WHATWG/IETF specifications
- `get_w3c_spec` - Get detailed spec information
- `search_w3c_specs` - Search specs by query

### WebIDL
- `get_webidl` - Get JavaScript API definitions
- `list_webidl_specs` - List specs with WebIDL

### CSS
- `get_css_properties` - Get CSS property definitions
- `list_css_specs` - List CSS specifications

### HTML Elements
- `get_html_elements` - Get HTML element definitions
- `list_element_specs` - List specs with element definitions

### PWA
- `get_pwa_specs` - Get all PWA-related specifications
