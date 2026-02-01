#!/usr/bin/env node

/**
 * W3C MCP Server
 * Provides access to W3C/WHATWG/IETF web specifications via MCP protocol
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { preloadAll } from './data/loader.js';

// Load package.json for version info
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as {
	name: string;
	version: string;
};

// Error handling
import { formatErrorResponse, ValidationError } from './errors/index.js';
// Validation schemas
import {
	GetCSSPropertiesSchema,
	GetElementsSchema,
	GetPwaSpecsSchema,
	GetSpecDependenciesSchema,
	GetSpecSchema,
	GetWebIDLSchema,
	ListSpecsSchema,
	SearchSpecsSchema,
	validateInput,
} from './schemas/index.js';
import { getCSSProperties, listCSSSpecs, searchCSSProperty } from './tools/get-css.js';
import { getElements, listElementSpecs, searchElement } from './tools/get-elements.js';
import { getCorePwaSpecs, getPwaSpecs } from './tools/get-pwa-specs.js';
import { getSpec, getSpecDependencies } from './tools/get-spec.js';
import { getWebIDL, listWebIDLSpecs } from './tools/get-webidl.js';
import { listSpecs } from './tools/list-specs.js';
import { searchSpecs } from './tools/search-specs.js';

// Logging
import { info, logToolCall, logToolResult, PerformanceTimer } from './utils/logger.js';

const server = new Server(
	{
		name: pkg.name,
		version: pkg.version,
	},
	{
		capabilities: {
			tools: {},
		},
	},
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => ({
	tools: [
		{
			name: 'list_w3c_specs',
			description:
				'List W3C/WHATWG/IETF web specifications with optional filtering by organization, keyword, or category',
			inputSchema: {
				type: 'object',
				properties: {
					organization: {
						type: 'string',
						enum: ['W3C', 'WHATWG', 'IETF', 'all'],
						description: 'Filter by standards organization',
					},
					keyword: {
						type: 'string',
						description: 'Filter by keyword in title or shortname',
					},
					category: {
						type: 'string',
						description: 'Filter by category (e.g., "browser")',
					},
					limit: {
						type: 'number',
						description: 'Maximum number of results (default: 50)',
					},
				},
			},
		},
		{
			name: 'get_w3c_spec',
			description:
				'Get detailed information about a specific web specification including URLs, status, repository, and test info',
			inputSchema: {
				type: 'object',
				properties: {
					shortname: {
						type: 'string',
						description:
							'Specification shortname (e.g., "service-workers", "appmanifest", "fetch", "dom")',
					},
				},
				required: ['shortname'],
			},
		},
		{
			name: 'search_w3c_specs',
			description:
				'Search web specifications by query string, searching in title, shortname, and description',
			inputSchema: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'Search query (e.g., "service worker", "manifest", "storage")',
					},
					limit: {
						type: 'number',
						description: 'Maximum number of results (default: 20)',
					},
				},
				required: ['query'],
			},
		},
		{
			name: 'get_webidl',
			description:
				'Get WebIDL interface definitions for a specification. WebIDL defines the JavaScript APIs.',
			inputSchema: {
				type: 'object',
				properties: {
					shortname: {
						type: 'string',
						description: 'Specification shortname (e.g., "service-workers", "fetch", "dom")',
					},
				},
				required: ['shortname'],
			},
		},
		{
			name: 'list_webidl_specs',
			description: 'List all specifications that have WebIDL definitions available',
			inputSchema: {
				type: 'object',
				properties: {},
			},
		},
		{
			name: 'get_css_properties',
			description: 'Get CSS property definitions from a specific spec or all specs',
			inputSchema: {
				type: 'object',
				properties: {
					spec: {
						type: 'string',
						description:
							'Specification shortname (e.g., "css-grid-1", "css-flexbox-1"). If omitted, returns all CSS properties.',
					},
					property: {
						type: 'string',
						description: 'Search for a specific CSS property by name',
					},
				},
			},
		},
		{
			name: 'list_css_specs',
			description: 'List all CSS specifications that have property definitions available',
			inputSchema: {
				type: 'object',
				properties: {},
			},
		},
		{
			name: 'get_html_elements',
			description: 'Get HTML element definitions from a specific spec or all specs',
			inputSchema: {
				type: 'object',
				properties: {
					spec: {
						type: 'string',
						description:
							'Specification shortname (e.g., "html", "svg"). If omitted, returns all elements.',
					},
					element: {
						type: 'string',
						description: 'Search for a specific element by name (e.g., "video", "canvas")',
					},
				},
			},
		},
		{
			name: 'list_element_specs',
			description: 'List all specifications that have HTML element definitions available',
			inputSchema: {
				type: 'object',
				properties: {},
			},
		},
		{
			name: 'get_pwa_specs',
			description:
				'Get all Progressive Web App (PWA) related specifications including Service Worker, Web App Manifest, Push API, Background Sync, etc.',
			inputSchema: {
				type: 'object',
				properties: {
					coreOnly: {
						type: 'boolean',
						description:
							'If true, return only the core PWA specs (Service Worker, Manifest, Push, Notifications)',
					},
				},
			},
		},
		{
			name: 'get_spec_dependencies',
			description:
				'Get basic information for a specification. Note: Dependency data (dependencies/dependents) is not yet available from the upstream data source and currently returns empty arrays.',
			inputSchema: {
				type: 'object',
				properties: {
					shortname: {
						type: 'string',
						description: 'Specification shortname',
					},
				},
				required: ['shortname'],
			},
		},
	],
}));

// Tool execution with validation and error handling
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;
	const timer = new PerformanceTimer(`tool:${name}`);

	logToolCall(name, args);

	try {
		let result: unknown;

		switch (name) {
			case 'list_w3c_specs': {
				const validation = validateInput(ListSpecsSchema, args);
				if (!validation.success) throw new ValidationError(validation.error);
				result = await listSpecs(validation.data);
				break;
			}

			case 'get_w3c_spec': {
				const validation = validateInput(GetSpecSchema, args);
				if (!validation.success) throw new ValidationError(validation.error);
				result = await getSpec(validation.data.shortname);
				break;
			}

			case 'search_w3c_specs': {
				const validation = validateInput(SearchSpecsSchema, args);
				if (!validation.success) throw new ValidationError(validation.error);
				result = await searchSpecs(validation.data.query, validation.data.limit);
				break;
			}

			case 'get_webidl': {
				const validation = validateInput(GetWebIDLSchema, args);
				if (!validation.success) throw new ValidationError(validation.error);
				const idl = await getWebIDL(validation.data.shortname);
				timer.end();
				logToolResult(name, idl.length);
				return { content: [{ type: 'text', text: idl }] };
			}

			case 'list_webidl_specs': {
				result = await listWebIDLSpecs();
				break;
			}

			case 'get_css_properties': {
				const validation = validateInput(GetCSSPropertiesSchema, args);
				if (!validation.success) throw new ValidationError(validation.error);
				result = validation.data.property
					? await searchCSSProperty(validation.data.property)
					: await getCSSProperties(validation.data.spec);
				break;
			}

			case 'list_css_specs': {
				result = await listCSSSpecs();
				break;
			}

			case 'get_html_elements': {
				const validation = validateInput(GetElementsSchema, args);
				if (!validation.success) throw new ValidationError(validation.error);
				result = validation.data.element
					? await searchElement(validation.data.element)
					: await getElements(validation.data.spec);
				break;
			}

			case 'list_element_specs': {
				result = await listElementSpecs();
				break;
			}

			case 'get_pwa_specs': {
				const validation = validateInput(GetPwaSpecsSchema, args);
				if (!validation.success) throw new ValidationError(validation.error);
				result = validation.data.coreOnly ? await getCorePwaSpecs() : await getPwaSpecs();
				break;
			}

			case 'get_spec_dependencies': {
				const validation = validateInput(GetSpecDependenciesSchema, args);
				if (!validation.success) throw new ValidationError(validation.error);
				result = await getSpecDependencies(validation.data.shortname);
				break;
			}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}

		const text = JSON.stringify(result, null, 2);
		timer.end();
		logToolResult(name, text.length);

		return { content: [{ type: 'text', text }] };
	} catch (error) {
		timer.end();
		const formatted = formatErrorResponse(error);
		return {
			content: [{ type: 'text', text: formatted.text }],
			isError: true,
		};
	}
});

// Start server
async function main() {
	info('W3C MCP Server: Preloading data...');
	const timer = new PerformanceTimer('preload');

	await preloadAll();

	const loadTime = timer.end();
	info(`W3C MCP Server: Data loaded in ${loadTime}ms`);

	const transport = new StdioServerTransport();
	await server.connect(transport);
	info('W3C MCP Server running on stdio');
}

main().catch((err) => {
	console.error('Failed to start server:', err);
	process.exit(1);
});
