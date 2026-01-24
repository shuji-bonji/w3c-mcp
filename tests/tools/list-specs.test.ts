/**
 * Tests for tools/list-specs.ts
 */

import { describe, expect, it } from 'vitest';
import { listSpecs } from '../../src/tools/list-specs.js';

describe('listSpecs', () => {
	describe('basic functionality', () => {
		it('should return array of spec summaries', async () => {
			const specs = await listSpecs();
			expect(Array.isArray(specs)).toBe(true);
			expect(specs.length).toBeGreaterThan(0);
		});

		it('should return specs with required properties', async () => {
			const specs = await listSpecs({ limit: 10 });
			for (const spec of specs) {
				expect(spec).toHaveProperty('shortname');
				expect(spec).toHaveProperty('title');
				expect(spec).toHaveProperty('url');
			}
		});
	});

	describe('organization filter', () => {
		it('should filter by W3C organization', async () => {
			const specs = await listSpecs({ organization: 'W3C', limit: 20 });
			for (const spec of specs) {
				expect(spec.organization?.toUpperCase()).toBe('W3C');
			}
		});

		it('should filter by WHATWG organization', async () => {
			const specs = await listSpecs({ organization: 'WHATWG', limit: 20 });
			for (const spec of specs) {
				expect(spec.organization?.toUpperCase()).toBe('WHATWG');
			}
		});

		it('should filter by IETF organization', async () => {
			const specs = await listSpecs({ organization: 'IETF', limit: 20 });
			for (const spec of specs) {
				expect(spec.organization?.toUpperCase()).toBe('IETF');
			}
		});

		it('should return all organizations when set to "all"', async () => {
			const specs = await listSpecs({ organization: 'all', limit: 100 });
			const orgs = new Set(specs.map((s) => s.organization?.toUpperCase()));
			// Should have at least W3C specs
			expect(orgs.size).toBeGreaterThanOrEqual(1);
		});
	});

	describe('keyword filter', () => {
		it('should filter by keyword in title', async () => {
			const specs = await listSpecs({ keyword: 'fetch' });
			for (const spec of specs) {
				const matchesTitle = spec.title.toLowerCase().includes('fetch');
				const matchesShortname = spec.shortname.toLowerCase().includes('fetch');
				expect(matchesTitle || matchesShortname).toBe(true);
			}
		});

		it('should filter by keyword in shortname', async () => {
			const specs = await listSpecs({ keyword: 'dom' });
			for (const spec of specs) {
				const matchesTitle = spec.title.toLowerCase().includes('dom');
				const matchesShortname = spec.shortname.toLowerCase().includes('dom');
				expect(matchesTitle || matchesShortname).toBe(true);
			}
		});

		it('should be case-insensitive', async () => {
			const lowerResults = await listSpecs({ keyword: 'fetch' });
			const upperResults = await listSpecs({ keyword: 'FETCH' });
			expect(lowerResults.length).toBe(upperResults.length);
		});
	});

	describe('category filter', () => {
		it('should filter by category when specs have categories', async () => {
			const specs = await listSpecs({ category: 'browser', limit: 50 });
			for (const spec of specs) {
				if (spec.categories && spec.categories.length > 0) {
					const hasCategory = spec.categories.some((c) => c.toLowerCase().includes('browser'));
					expect(hasCategory).toBe(true);
				}
			}
		});
	});

	describe('limit option', () => {
		it('should respect limit parameter', async () => {
			const specs = await listSpecs({ limit: 10 });
			expect(specs.length).toBeLessThanOrEqual(10);
		});

		it('should use default limit of 50', async () => {
			const specs = await listSpecs();
			expect(specs.length).toBeLessThanOrEqual(50);
		});

		it('should return fewer results if fewer match', async () => {
			const specs = await listSpecs({ keyword: 'fetch', limit: 100 });
			// 'fetch' should have fewer than 100 matches
			expect(specs.length).toBeLessThan(100);
		});
	});

	describe('combined filters', () => {
		it('should apply both organization and keyword filters', async () => {
			const specs = await listSpecs({
				organization: 'WHATWG',
				keyword: 'html',
				limit: 20,
			});

			for (const spec of specs) {
				expect(spec.organization?.toUpperCase()).toBe('WHATWG');
				const matchesKeyword =
					spec.title.toLowerCase().includes('html') ||
					spec.shortname.toLowerCase().includes('html');
				expect(matchesKeyword).toBe(true);
			}
		});
	});
});
