/**
 * Zod schemas for input validation
 */

import { z } from 'zod';
import {
	DEFAULT_LIST_LIMIT,
	DEFAULT_SEARCH_LIMIT,
	MAX_LIST_LIMIT,
	MAX_SEARCH_LIMIT,
} from '../constants/index.js';

// List specs schema
export const ListSpecsSchema = z.object({
	organization: z
		.enum(['W3C', 'WHATWG', 'IETF', 'all'])
		.optional()
		.describe('Filter by standards organization'),
	keyword: z.string().optional().describe('Filter by keyword in title or shortname'),
	category: z.string().optional().describe('Filter by category (e.g., "browser")'),
	limit: z
		.number()
		.min(1)
		.max(MAX_LIST_LIMIT)
		.optional()
		.default(DEFAULT_LIST_LIMIT)
		.describe(`Maximum number of results (default: ${DEFAULT_LIST_LIMIT})`),
});

export type ListSpecsInput = z.infer<typeof ListSpecsSchema>;

// Get spec schema
export const GetSpecSchema = z.object({
	shortname: z
		.string()
		.min(1, 'shortname is required')
		.describe('Specification shortname (e.g., "service-workers", "appmanifest", "fetch", "dom")'),
});

export type GetSpecInput = z.infer<typeof GetSpecSchema>;

// Search specs schema
export const SearchSpecsSchema = z.object({
	query: z
		.string()
		.min(1, 'query is required')
		.describe('Search query (e.g., "service worker", "manifest", "storage")'),
	limit: z
		.number()
		.min(1)
		.max(MAX_SEARCH_LIMIT)
		.optional()
		.default(DEFAULT_SEARCH_LIMIT)
		.describe(`Maximum number of results (default: ${DEFAULT_SEARCH_LIMIT})`),
});

export type SearchSpecsInput = z.infer<typeof SearchSpecsSchema>;

// Get WebIDL schema
export const GetWebIDLSchema = z.object({
	shortname: z
		.string()
		.min(1, 'shortname is required')
		.describe('Specification shortname (e.g., "service-workers", "fetch", "dom")'),
});

export type GetWebIDLInput = z.infer<typeof GetWebIDLSchema>;

// Get CSS properties schema
export const GetCSSPropertiesSchema = z.object({
	spec: z
		.string()
		.optional()
		.describe(
			'Specification shortname (e.g., "css-grid-1", "css-flexbox-1"). If omitted, returns all CSS properties.',
		),
	property: z.string().optional().describe('Search for a specific CSS property by name'),
});

export type GetCSSPropertiesInput = z.infer<typeof GetCSSPropertiesSchema>;

// Get elements schema
export const GetElementsSchema = z.object({
	spec: z
		.string()
		.optional()
		.describe('Specification shortname (e.g., "html", "svg"). If omitted, returns all elements.'),
	element: z
		.string()
		.optional()
		.describe('Search for a specific element by name (e.g., "video", "canvas")'),
});

export type GetElementsInput = z.infer<typeof GetElementsSchema>;

// Get PWA specs schema
export const GetPwaSpecsSchema = z.object({
	coreOnly: z
		.boolean()
		.optional()
		.default(false)
		.describe(
			'If true, return only the core PWA specs (Service Worker, Manifest, Push, Notifications)',
		),
	includeRelated: z
		.boolean()
		.optional()
		.default(false)
		.describe(
			'If true, also include related specs whose title mentions storage, caching, offline, etc. (ignored when coreOnly is true)',
		),
});

export type GetPwaSpecsInput = z.infer<typeof GetPwaSpecsSchema>;

/**
 * Validate input against a schema
 */
export function validateInput<T>(
	schema: z.ZodSchema<T>,
	data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
	const result = schema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, error: result.error };
}
