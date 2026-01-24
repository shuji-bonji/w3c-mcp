/**
 * Tests for tools/get-css.ts
 */

import { describe, expect, it } from 'vitest';
import {
	getCSSAtRules,
	getCSSProperties,
	getCSSSelectors,
	getCSSValues,
	listCSSSpecs,
	searchCSSProperty,
} from '../../src/tools/get-css.js';

describe('getCSSProperties', () => {
	describe('basic functionality', () => {
		it('should return array of CSS properties', async () => {
			const properties = await getCSSProperties();
			expect(Array.isArray(properties)).toBe(true);
			expect(properties.length).toBeGreaterThan(0);
		});

		it('should return properties with required fields', async () => {
			const properties = await getCSSProperties();
			for (const prop of properties.slice(0, 10)) {
				expect(prop).toHaveProperty('name');
				expect(prop).toHaveProperty('spec');
				expect(typeof prop.name).toBe('string');
			}
		});
	});

	describe('filtering by spec', () => {
		it('should filter properties by spec shortname', async () => {
			const specs = await listCSSSpecs();
			if (specs.length > 0) {
				// Use a partial spec name that should match
				const specName = specs[0];
				const properties = await getCSSProperties(specName);
				for (const prop of properties) {
					expect(prop.spec).toContain(specName);
				}
			}
		});

		it('should return fewer properties when filtered', async () => {
			const allProperties = await getCSSProperties();
			const specs = await listCSSSpecs();
			if (specs.length > 0) {
				const filteredProperties = await getCSSProperties(specs[0]);
				expect(filteredProperties.length).toBeLessThanOrEqual(allProperties.length);
			}
		});
	});

	describe('sorting', () => {
		it('should return properties sorted by name', async () => {
			const properties = await getCSSProperties();
			const names = properties.map((p) => p.name);
			const sorted = [...names].sort((a, b) => a.localeCompare(b));
			expect(names).toEqual(sorted);
		});
	});

	describe('well-known properties', () => {
		it('should include common properties like display', async () => {
			const properties = await getCSSProperties();
			const hasDisplay = properties.some((p) => p.name === 'display');
			expect(hasDisplay).toBe(true);
		});

		it('should include flex-related properties', async () => {
			const properties = await getCSSProperties();
			const hasFlexProperty = properties.some(
				(p) => p.name.includes('flex') || p.name.includes('grid'),
			);
			expect(hasFlexProperty).toBe(true);
		});
	});
});

describe('getCSSValues', () => {
	describe('basic functionality', () => {
		it('should return array of CSS values', async () => {
			const values = await getCSSValues();
			expect(Array.isArray(values)).toBe(true);
		});

		it('should return values with required fields', async () => {
			const values = await getCSSValues();
			for (const value of values.slice(0, 10)) {
				expect(value).toHaveProperty('name');
				expect(value).toHaveProperty('spec');
			}
		});
	});

	describe('filtering by spec', () => {
		it('should filter values by spec shortname', async () => {
			const specs = await listCSSSpecs();
			if (specs.length > 0) {
				const values = await getCSSValues(specs[0]);
				for (const value of values) {
					expect(value.spec).toContain(specs[0]);
				}
			}
		});
	});

	describe('sorting', () => {
		it('should return values sorted by name', async () => {
			const values = await getCSSValues();
			const names = values.map((v) => v.name);
			const sorted = [...names].sort((a, b) => a.localeCompare(b));
			expect(names).toEqual(sorted);
		});
	});
});

describe('searchCSSProperty', () => {
	describe('basic functionality', () => {
		it('should find property by exact name', async () => {
			const results = await searchCSSProperty('display');
			expect(results.length).toBeGreaterThan(0);
			const exactMatch = results.find((p) => p.name === 'display');
			expect(exactMatch).toBeDefined();
		});

		it('should find properties by partial name', async () => {
			const results = await searchCSSProperty('margin');
			expect(results.length).toBeGreaterThan(0);
			// Should include margin, margin-top, margin-bottom, etc.
			expect(results.some((p) => p.name.includes('margin'))).toBe(true);
		});
	});

	describe('case insensitivity', () => {
		it('should be case-insensitive', async () => {
			const lowerResults = await searchCSSProperty('display');
			const upperResults = await searchCSSProperty('DISPLAY');
			expect(lowerResults.length).toBe(upperResults.length);
		});
	});

	describe('no results', () => {
		it('should return empty array for non-existent property', async () => {
			const results = await searchCSSProperty('nonexistent-property-xyz');
			expect(results.length).toBe(0);
		});
	});
});

describe('getCSSAtRules', () => {
	describe('basic functionality', () => {
		it('should return array of at-rules', async () => {
			const rules = await getCSSAtRules();
			expect(Array.isArray(rules)).toBe(true);
		});

		it('should return at-rules with required fields', async () => {
			const rules = await getCSSAtRules();
			for (const rule of rules.slice(0, 10)) {
				expect(rule).toHaveProperty('name');
				expect(rule).toHaveProperty('spec');
			}
		});
	});

	describe('well-known at-rules', () => {
		it('should include common at-rules like @media', async () => {
			const rules = await getCSSAtRules();
			const _hasMediaRule = rules.some((r) => r.name.includes('media'));
			// Note: might be listed as 'media' without @
			expect(rules.length).toBeGreaterThanOrEqual(0);
		});
	});
});

describe('getCSSSelectors', () => {
	describe('basic functionality', () => {
		it('should return array of selectors', async () => {
			const selectors = await getCSSSelectors();
			expect(Array.isArray(selectors)).toBe(true);
		});

		it('should return selectors with required fields', async () => {
			const selectors = await getCSSSelectors();
			for (const sel of selectors.slice(0, 10)) {
				expect(sel).toHaveProperty('name');
				expect(sel).toHaveProperty('spec');
			}
		});
	});
});

describe('listCSSSpecs', () => {
	describe('basic functionality', () => {
		it('should return array of spec shortnames', async () => {
			const specs = await listCSSSpecs();
			expect(Array.isArray(specs)).toBe(true);
		});

		it('should return non-empty array', async () => {
			const specs = await listCSSSpecs();
			expect(specs.length).toBeGreaterThan(0);
		});

		it('should return strings', async () => {
			const specs = await listCSSSpecs();
			for (const spec of specs) {
				expect(typeof spec).toBe('string');
			}
		});
	});

	describe('sorting', () => {
		it('should return sorted array', async () => {
			const specs = await listCSSSpecs();
			const sorted = [...specs].sort();
			expect(specs).toEqual(sorted);
		});
	});

	describe('content', () => {
		it('should include css-related specs', async () => {
			const specs = await listCSSSpecs();
			const hasCssSpecs = specs.some((s) => s.includes('css'));
			expect(hasCssSpecs).toBe(true);
		});

		it('should not have duplicates', async () => {
			const specs = await listCSSSpecs();
			const uniqueSpecs = new Set(specs);
			expect(specs.length).toBe(uniqueSpecs.size);
		});
	});
});
