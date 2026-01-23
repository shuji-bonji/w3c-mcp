# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-24

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
