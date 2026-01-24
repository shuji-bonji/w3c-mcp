/**
 * Integration tests for MCP server functionality
 * Tests the complete flow from tool invocation to response
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { clearCache, preloadAll } from '../../src/data/loader.js';
import {
	formatErrorResponse,
	SpecNotFoundError,
	ValidationError,
	W3CMCPError,
} from '../../src/errors/index.js';
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
} from '../../src/schemas/index.js';
import { getCSSProperties, listCSSSpecs } from '../../src/tools/get-css.js';
import { getElements, listElementSpecs } from '../../src/tools/get-elements.js';
import { getCorePwaSpecs, getPwaSpecs } from '../../src/tools/get-pwa-specs.js';
import { getSpec, getSpecDependencies } from '../../src/tools/get-spec.js';
import { getWebIDL, listWebIDLSpecs } from '../../src/tools/get-webidl.js';
import { listSpecs } from '../../src/tools/list-specs.js';
import { searchSpecs } from '../../src/tools/search-specs.js';

describe('MCP Server Integration', () => {
	beforeAll(async () => {
		// Preload all data for faster tests
		await preloadAll();
	});

	describe('list_w3c_specs tool', () => {
		it('should list specs with default options', async () => {
			const validation = validateInput(ListSpecsSchema, {});
			expect(validation.success).toBe(true);
			if (validation.success) {
				const result = await listSpecs(validation.data);
				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toBeLessThanOrEqual(50);
			}
		});

		it('should validate and filter by organization', async () => {
			const validation = validateInput(ListSpecsSchema, { organization: 'W3C' });
			expect(validation.success).toBe(true);
			if (validation.success) {
				const result = await listSpecs(validation.data);
				for (const spec of result) {
					expect(spec.organization?.toUpperCase()).toBe('W3C');
				}
			}
		});

		it('should reject invalid organization', async () => {
			const validation = validateInput(ListSpecsSchema, { organization: 'INVALID' });
			expect(validation.success).toBe(false);
		});

		it('should reject invalid limit', async () => {
			const validation = validateInput(ListSpecsSchema, { limit: 1000 });
			expect(validation.success).toBe(false);
		});
	});

	describe('get_w3c_spec tool', () => {
		it('should get spec details', async () => {
			const validation = validateInput(GetSpecSchema, { shortname: 'fetch' });
			expect(validation.success).toBe(true);
			if (validation.success) {
				const result = await getSpec(validation.data.shortname);
				expect(result).toBeDefined();
				expect(result?.shortname).toBe('fetch');
			}
		});

		it('should require shortname', async () => {
			const validation = validateInput(GetSpecSchema, {});
			expect(validation.success).toBe(false);
		});

		it('should reject empty shortname', async () => {
			const validation = validateInput(GetSpecSchema, { shortname: '' });
			expect(validation.success).toBe(false);
		});
	});

	describe('search_w3c_specs tool', () => {
		it('should search specs', async () => {
			const validation = validateInput(SearchSpecsSchema, { query: 'fetch' });
			expect(validation.success).toBe(true);
			if (validation.success) {
				const result = await searchSpecs(validation.data.query, validation.data.limit);
				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toBeGreaterThan(0);
			}
		});

		it('should require query', async () => {
			const validation = validateInput(SearchSpecsSchema, {});
			expect(validation.success).toBe(false);
		});

		it('should respect limit', async () => {
			const validation = validateInput(SearchSpecsSchema, { query: 'web', limit: 5 });
			expect(validation.success).toBe(true);
			if (validation.success) {
				const result = await searchSpecs(validation.data.query, validation.data.limit);
				expect(result.length).toBeLessThanOrEqual(5);
			}
		});
	});

	describe('get_webidl tool', () => {
		it('should get WebIDL for valid spec', async () => {
			const specs = await listWebIDLSpecs();
			if (specs.length > 0) {
				const validation = validateInput(GetWebIDLSchema, { shortname: specs[0] });
				expect(validation.success).toBe(true);
				if (validation.success) {
					const result = await getWebIDL(validation.data.shortname);
					expect(typeof result).toBe('string');
				}
			}
		});

		it('should require shortname', async () => {
			const validation = validateInput(GetWebIDLSchema, {});
			expect(validation.success).toBe(false);
		});
	});

	describe('get_css_properties tool', () => {
		it('should get all CSS properties', async () => {
			const validation = validateInput(GetCSSPropertiesSchema, {});
			expect(validation.success).toBe(true);
			if (validation.success) {
				const result = await getCSSProperties(validation.data.spec);
				expect(Array.isArray(result)).toBe(true);
			}
		});

		it('should filter by spec', async () => {
			const specs = await listCSSSpecs();
			if (specs.length > 0) {
				const validation = validateInput(GetCSSPropertiesSchema, { spec: specs[0] });
				expect(validation.success).toBe(true);
				if (validation.success) {
					const result = await getCSSProperties(validation.data.spec);
					for (const prop of result) {
						expect(prop.spec).toContain(specs[0]);
					}
				}
			}
		});
	});

	describe('get_html_elements tool', () => {
		it('should get all elements', async () => {
			const validation = validateInput(GetElementsSchema, {});
			expect(validation.success).toBe(true);
			if (validation.success) {
				const result = await getElements(validation.data.spec);
				expect(Array.isArray(result)).toBe(true);
			}
		});

		it('should filter by spec', async () => {
			const specs = await listElementSpecs();
			if (specs.length > 0) {
				const validation = validateInput(GetElementsSchema, { spec: specs[0] });
				expect(validation.success).toBe(true);
				if (validation.success) {
					const result = await getElements(validation.data.spec);
					for (const elem of result) {
						expect(elem.spec).toBe(specs[0]);
					}
				}
			}
		});
	});

	describe('get_pwa_specs tool', () => {
		it('should get all PWA specs', async () => {
			const validation = validateInput(GetPwaSpecsSchema, {});
			expect(validation.success).toBe(true);
			if (validation.success) {
				const result = await getPwaSpecs();
				expect(Array.isArray(result)).toBe(true);
			}
		});

		it('should get core PWA specs only', async () => {
			const validation = validateInput(GetPwaSpecsSchema, { coreOnly: true });
			expect(validation.success).toBe(true);
			if (validation.success) {
				const result = await getCorePwaSpecs();
				const allSpecs = await getPwaSpecs();
				expect(result.length).toBeLessThanOrEqual(allSpecs.length);
			}
		});
	});

	describe('get_spec_dependencies tool', () => {
		it('should get spec dependencies', async () => {
			const validation = validateInput(GetSpecDependenciesSchema, { shortname: 'fetch' });
			expect(validation.success).toBe(true);
			if (validation.success) {
				const result = await getSpecDependencies(validation.data.shortname);
				expect(result).toHaveProperty('shortname');
				expect(result).toHaveProperty('dependencies');
				expect(result).toHaveProperty('dependents');
			}
		});

		it('should require shortname', async () => {
			const validation = validateInput(GetSpecDependenciesSchema, {});
			expect(validation.success).toBe(false);
		});
	});
});

describe('Error Handling', () => {
	describe('ValidationError', () => {
		it('should format validation errors correctly', async () => {
			const validation = validateInput(GetSpecSchema, {});
			if (!validation.success) {
				const error = new ValidationError(validation.error);
				expect(error.message).toContain('Validation error');
				expect(error.zodError).toBeDefined();
			}
		});

		it('should format error response correctly', () => {
			const validation = validateInput(GetSpecSchema, {});
			if (!validation.success) {
				const error = new ValidationError(validation.error);
				const response = formatErrorResponse(error);
				expect(response.errorType).toBe('ValidationError');
				expect(response.text).toContain('ValidationError');
			}
		});
	});

	describe('SpecNotFoundError', () => {
		it('should include suggestions in error message', () => {
			const error = new SpecNotFoundError('fetc', ['fetch', 'fetch-api']);
			expect(error.message).toContain('fetch');
			expect(error.suggestions).toContain('fetch');
		});

		it('should format error response with suggestions', () => {
			const error = new SpecNotFoundError('fetc', ['fetch']);
			const response = formatErrorResponse(error);
			expect(response.errorType).toBe('SpecNotFoundError');
			expect(response.text).toContain('suggestions');
		});
	});

	describe('W3CMCPError', () => {
		it('should format generic W3C errors', () => {
			const error = new W3CMCPError('Test error');
			const response = formatErrorResponse(error);
			expect(response.errorType).toBe('W3CMCPError');
		});
	});

	describe('Generic Error', () => {
		it('should format generic errors', () => {
			const error = new Error('Generic error');
			const response = formatErrorResponse(error);
			expect(response.errorType).toBe('Error');
			expect(response.text).toContain('Generic error');
		});
	});

	describe('Unknown Error', () => {
		it('should handle unknown error types', () => {
			const response = formatErrorResponse('string error');
			expect(response.errorType).toBe('UnknownError');
		});
	});
});

describe('Data Preloading', () => {
	it('should preload all data successfully', async () => {
		clearCache();
		await preloadAll();

		// All data should be immediately available after preload
		const specs = await listSpecs({ limit: 1 });
		const idlSpecs = await listWebIDLSpecs();
		const cssSpecs = await listCSSSpecs();
		const elementSpecs = await listElementSpecs();

		expect(specs.length).toBeGreaterThan(0);
		expect(idlSpecs.length).toBeGreaterThan(0);
		expect(cssSpecs.length).toBeGreaterThan(0);
		expect(elementSpecs.length).toBeGreaterThan(0);
	});
});

describe('Cross-Tool Consistency', () => {
	it('should find same specs across different tools', async () => {
		// Search for a spec
		const searchResults = await searchSpecs('fetch');
		const fetchResult = searchResults.find((r) => r.shortname === 'fetch');

		if (fetchResult) {
			// Get the same spec through getSpec
			const specDetail = await getSpec('fetch');
			expect(specDetail?.shortname).toBe(fetchResult.shortname);
			expect(specDetail?.title).toBe(fetchResult.title);
		}
	});

	it('should list same specs as can be retrieved individually', async () => {
		const listedSpecs = await listSpecs({ limit: 5 });

		for (const listed of listedSpecs) {
			const detail = await getSpec(listed.shortname);
			expect(detail?.shortname).toBe(listed.shortname);
		}
	});
});
