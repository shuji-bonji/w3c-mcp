#!/usr/bin/env node

/**
 * W3C MCP Server
 * Provides access to W3C/WHATWG/IETF web specifications via MCP protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { listSpecs } from './tools/list-specs.js';
import { getSpec, getSpecDependencies } from './tools/get-spec.js';
import { searchSpecs } from './tools/search-specs.js';
import { getWebIDL, listWebIDLSpecs } from './tools/get-webidl.js';
import { getCSSProperties, getCSSValues, searchCSSProperty, listCSSSpecs } from './tools/get-css.js';
import { getElements, searchElement, listElementSpecs } from './tools/get-elements.js';
import { getPwaSpecs, getCorePwaSpecs } from './tools/get-pwa-specs.js';

const server = new Server(
  {
    name: 'w3c-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // Phase 1: Basic tools
    {
      name: 'list_w3c_specs',
      description: 'List W3C/WHATWG/IETF web specifications with optional filtering by organization, keyword, or category',
      inputSchema: {
        type: 'object',
        properties: {
          organization: {
            type: 'string',
            enum: ['W3C', 'WHATWG', 'IETF', 'all'],
            description: 'Filter by standards organization'
          },
          keyword: {
            type: 'string',
            description: 'Filter by keyword in title or shortname'
          },
          category: {
            type: 'string',
            description: 'Filter by category (e.g., "browser")'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 50)'
          }
        }
      }
    },
    {
      name: 'get_w3c_spec',
      description: 'Get detailed information about a specific web specification including URLs, status, repository, and test info',
      inputSchema: {
        type: 'object',
        properties: {
          shortname: {
            type: 'string',
            description: 'Specification shortname (e.g., "service-workers", "appmanifest", "fetch", "dom")'
          }
        },
        required: ['shortname']
      }
    },
    {
      name: 'search_w3c_specs',
      description: 'Search web specifications by query string, searching in title, shortname, and description',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (e.g., "service worker", "manifest", "storage")'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 20)'
          }
        },
        required: ['query']
      }
    },

    // Phase 2: WebIDL, CSS, Elements
    {
      name: 'get_webidl',
      description: 'Get WebIDL interface definitions for a specification. WebIDL defines the JavaScript APIs.',
      inputSchema: {
        type: 'object',
        properties: {
          shortname: {
            type: 'string',
            description: 'Specification shortname (e.g., "service-workers", "fetch", "dom")'
          }
        },
        required: ['shortname']
      }
    },
    {
      name: 'list_webidl_specs',
      description: 'List all specifications that have WebIDL definitions available',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_css_properties',
      description: 'Get CSS property definitions from a specific spec or all specs',
      inputSchema: {
        type: 'object',
        properties: {
          spec: {
            type: 'string',
            description: 'Specification shortname (e.g., "css-grid-1", "css-flexbox-1"). If omitted, returns all CSS properties.'
          },
          property: {
            type: 'string',
            description: 'Search for a specific CSS property by name'
          }
        }
      }
    },
    {
      name: 'list_css_specs',
      description: 'List all CSS specifications that have property definitions available',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_html_elements',
      description: 'Get HTML element definitions from a specific spec or all specs',
      inputSchema: {
        type: 'object',
        properties: {
          spec: {
            type: 'string',
            description: 'Specification shortname (e.g., "html", "svg"). If omitted, returns all elements.'
          },
          element: {
            type: 'string',
            description: 'Search for a specific element by name (e.g., "video", "canvas")'
          }
        }
      }
    },
    {
      name: 'list_element_specs',
      description: 'List all specifications that have HTML element definitions available',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },

    // Phase 3: PWA and convenience tools
    {
      name: 'get_pwa_specs',
      description: 'Get all Progressive Web App (PWA) related specifications including Service Worker, Web App Manifest, Push API, Background Sync, etc.',
      inputSchema: {
        type: 'object',
        properties: {
          coreOnly: {
            type: 'boolean',
            description: 'If true, return only the core PWA specs (Service Worker, Manifest, Push, Notifications)'
          }
        }
      }
    },
    {
      name: 'get_spec_dependencies',
      description: 'Get dependency information for a specification (which specs it depends on and which depend on it)',
      inputSchema: {
        type: 'object',
        properties: {
          shortname: {
            type: 'string',
            description: 'Specification shortname'
          }
        },
        required: ['shortname']
      }
    }
  ]
}));

// Tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Phase 1
      case 'list_w3c_specs': {
        const result = await listSpecs({
          organization: args?.organization as 'W3C' | 'WHATWG' | 'IETF' | 'all' | undefined,
          keyword: args?.keyword as string | undefined,
          category: args?.category as string | undefined,
          limit: args?.limit as number | undefined
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'get_w3c_spec': {
        const result = await getSpec(args?.shortname as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'search_w3c_specs': {
        const result = await searchSpecs(
          args?.query as string,
          args?.limit as number | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      // Phase 2
      case 'get_webidl': {
        const result = await getWebIDL(args?.shortname as string);
        return { content: [{ type: 'text', text: result }] };
      }

      case 'list_webidl_specs': {
        const result = await listWebIDLSpecs();
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'get_css_properties': {
        let result;
        if (args?.property) {
          result = await searchCSSProperty(args.property as string);
        } else {
          result = await getCSSProperties(args?.spec as string | undefined);
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'list_css_specs': {
        const result = await listCSSSpecs();
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'get_html_elements': {
        let result;
        if (args?.element) {
          result = await searchElement(args.element as string);
        } else {
          result = await getElements(args?.spec as string | undefined);
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'list_element_specs': {
        const result = await listElementSpecs();
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      // Phase 3
      case 'get_pwa_specs': {
        const result = args?.coreOnly
          ? await getCorePwaSpecs()
          : await getPwaSpecs();
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'get_spec_dependencies': {
        const result = await getSpecDependencies(args?.shortname as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('W3C MCP Server running on stdio');
}

main().catch(console.error);
