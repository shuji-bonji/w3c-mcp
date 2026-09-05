#!/usr/bin/env node

/**
 * W3C MCP Server
 * Provides access to W3C/WHATWG/IETF web specifications via MCP protocol
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type CallToolResult, McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import type { z } from 'zod';
import { preloadAll } from './data/loader.js';

// Load package.json for version info
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as {
	name: string;
	version: string;
};

// Error handling
import { formatErrorResponse } from './errors/index.js';
// Validation schemas (the SDK validates tool arguments against these before
// the handler runs, and derives the JSON Schema published by tools/list)
import {
	GetCSSPropertiesSchema,
	GetElementsSchema,
	GetPwaSpecsSchema,
	GetSpecSchema,
	GetWebIDLSchema,
	ListSpecsSchema,
	SearchSpecsSchema,
} from './schemas/index.js';
import { getCSSProperties, listCSSSpecs, searchCSSProperty } from './tools/get-css.js';
import { getElements, listElementSpecs, searchElement } from './tools/get-elements.js';
import { getCorePwaSpecs, getPwaSpecs } from './tools/get-pwa-specs.js';
import { getSpec } from './tools/get-spec.js';
import { getWebIDL, listWebIDLSpecs } from './tools/get-webidl.js';
import { listSpecs } from './tools/list-specs.js';
import { searchSpecs } from './tools/search-specs.js';

// Logging
import { info, logToolCall, logToolResult, PerformanceTimer } from './utils/logger.js';

/**
 * Wrap a tool implementation with logging, timing, and error formatting.
 * `fn` returns the text to send back; a thrown error is converted to an
 * `isError` result via `formatErrorResponse()`.
 */
function toolHandler<Args>(
	name: string,
	fn: (args: Args) => Promise<string>,
): (args: Args) => Promise<CallToolResult> {
	return async (args) => {
		const timer = new PerformanceTimer(`tool:${name}`);
		logToolCall(name, args);

		try {
			const text = await fn(args);
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
	};
}

/** Serialize a tool result as pretty-printed JSON */
function toJson(value: unknown): string {
	return JSON.stringify(value, null, 2);
}

/**
 * Build a server instance with every tool registered.
 * `serveStdio` calls this once per connection.
 */
function createServer(): McpServer {
	const server = new McpServer(
		{ name: pkg.name, version: pkg.version },
		{ capabilities: { tools: {} } },
	);

	server.registerTool(
		'list_w3c_specs',
		{
			description:
				'List W3C/WHATWG/IETF web specifications with optional filtering by organization, keyword, or category',
			inputSchema: ListSpecsSchema,
		},
		toolHandler<z.infer<typeof ListSpecsSchema>>('list_w3c_specs', async (args) =>
			toJson(await listSpecs(args)),
		),
	);

	server.registerTool(
		'get_w3c_spec',
		{
			description:
				'Get detailed information about a specific web specification including URLs, status, repository, and test info',
			inputSchema: GetSpecSchema,
		},
		toolHandler<z.infer<typeof GetSpecSchema>>('get_w3c_spec', async ({ shortname }) =>
			toJson(await getSpec(shortname)),
		),
	);

	server.registerTool(
		'search_w3c_specs',
		{
			description:
				'Search web specifications by query string, searching in title, shortname, and description',
			inputSchema: SearchSpecsSchema,
		},
		toolHandler<z.infer<typeof SearchSpecsSchema>>('search_w3c_specs', async ({ query, limit }) =>
			toJson(await searchSpecs(query, limit)),
		),
	);

	server.registerTool(
		'get_webidl',
		{
			description:
				'Get WebIDL interface definitions for a specification. WebIDL defines the JavaScript APIs.',
			inputSchema: GetWebIDLSchema,
		},
		// WebIDL is returned as-is (plain text), not JSON-encoded
		toolHandler<z.infer<typeof GetWebIDLSchema>>('get_webidl', ({ shortname }) =>
			getWebIDL(shortname),
		),
	);

	server.registerTool(
		'list_webidl_specs',
		{ description: 'List all specifications that have WebIDL definitions available' },
		toolHandler('list_webidl_specs', async () => toJson(await listWebIDLSpecs())),
	);

	server.registerTool(
		'get_css_properties',
		{
			description: 'Get CSS property definitions from a specific spec or all specs',
			inputSchema: GetCSSPropertiesSchema,
		},
		toolHandler<z.infer<typeof GetCSSPropertiesSchema>>(
			'get_css_properties',
			async ({ spec, property }) =>
				toJson(property ? await searchCSSProperty(property) : await getCSSProperties(spec)),
		),
	);

	server.registerTool(
		'list_css_specs',
		{ description: 'List all CSS specifications that have property definitions available' },
		toolHandler('list_css_specs', async () => toJson(await listCSSSpecs())),
	);

	server.registerTool(
		'get_html_elements',
		{
			description: 'Get HTML element definitions from a specific spec or all specs',
			inputSchema: GetElementsSchema,
		},
		toolHandler<z.infer<typeof GetElementsSchema>>('get_html_elements', async ({ spec, element }) =>
			toJson(element ? await searchElement(element) : await getElements(spec)),
		),
	);

	server.registerTool(
		'list_element_specs',
		{ description: 'List all specifications that have HTML element definitions available' },
		toolHandler('list_element_specs', async () => toJson(await listElementSpecs())),
	);

	server.registerTool(
		'get_pwa_specs',
		{
			description:
				'Get all Progressive Web App (PWA) related specifications including Service Worker, Web App Manifest, Push API, Background Sync, etc.',
			inputSchema: GetPwaSpecsSchema,
		},
		toolHandler<z.infer<typeof GetPwaSpecsSchema>>('get_pwa_specs', async ({ coreOnly }) =>
			toJson(coreOnly ? await getCorePwaSpecs() : await getPwaSpecs()),
		),
	);

	return server;
}

// Start server
async function main() {
	info('W3C MCP Server: Preloading data...');
	const timer = new PerformanceTimer('preload');

	await preloadAll();

	const loadTime = timer.end();
	info(`W3C MCP Server: Data loaded in ${loadTime}ms`);

	// serveStdio negotiates the protocol revision with the client
	// (2024-11-05 ... 2025-11-25 via `initialize`, or 2026-07-28 via `server/discover`)
	// and serves the same tool set on either.
	serveStdio(createServer, {
		onerror: (err) => console.error('W3C MCP Server transport error:', err),
	});
	info('W3C MCP Server running on stdio');
}

main().catch((err) => {
	console.error('Failed to start server:', err);
	process.exit(1);
});
