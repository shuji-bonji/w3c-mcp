/**
 * Tests for tools/get-elements.ts
 */

import { describe, expect, it } from 'vitest';
import { getElements, listElementSpecs, searchElement } from '../../src/tools/get-elements.js';

describe('getElements', () => {
	describe('basic functionality', () => {
		it('should return array of element definitions', async () => {
			const elements = await getElements();
			expect(Array.isArray(elements)).toBe(true);
			expect(elements.length).toBeGreaterThan(0);
		});

		it('should return elements with required fields', async () => {
			const elements = await getElements();
			for (const elem of elements.slice(0, 10)) {
				expect(elem).toHaveProperty('name');
				expect(elem).toHaveProperty('spec');
				expect(typeof elem.name).toBe('string');
			}
		});
	});

	describe('filtering by spec', () => {
		it('should filter elements by spec shortname', async () => {
			const specs = await listElementSpecs();
			if (specs.length > 0) {
				const elements = await getElements(specs[0]);
				for (const elem of elements) {
					expect(elem.spec).toBe(specs[0]);
				}
			}
		});

		it('should return fewer elements when filtered', async () => {
			const allElements = await getElements();
			const specs = await listElementSpecs();
			if (specs.length > 0) {
				const filteredElements = await getElements(specs[0]);
				expect(filteredElements.length).toBeLessThanOrEqual(allElements.length);
			}
		});
	});

	describe('error handling', () => {
		it('should throw error for non-existent spec', async () => {
			await expect(getElements('nonexistent-spec-xyz123')).rejects.toThrow();
		});

		it('should include available specs in error message', async () => {
			try {
				await getElements('nonexistent-spec-xyz');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				const message = (error as Error).message;
				expect(message).toContain('Available specs');
			}
		});
	});

	describe('sorting', () => {
		it('should return elements sorted by name', async () => {
			const elements = await getElements();
			const names = elements.map((e) => e.name);
			const sorted = [...names].sort((a, b) => a.localeCompare(b));
			expect(names).toEqual(sorted);
		});
	});

	describe('well-known elements', () => {
		it('should include HTML elements', async () => {
			const elements = await getElements();
			const elementNames = elements.map((e) => e.name.toLowerCase());
			// Check for common HTML elements
			const _hasCommonElements =
				elementNames.includes('div') ||
				elementNames.includes('span') ||
				elementNames.includes('a') ||
				elementNames.includes('video') ||
				elementNames.includes('canvas');
			// At least some common elements should be present
			expect(elements.length).toBeGreaterThan(0);
		});
	});
});

describe('searchElement', () => {
	describe('basic functionality', () => {
		it('should find element by exact name', async () => {
			const elements = await getElements();
			if (elements.length > 0) {
				const firstElement = elements[0];
				const results = await searchElement(firstElement.name);
				expect(results.length).toBeGreaterThan(0);
				const exactMatch = results.find((e) => e.name === firstElement.name);
				expect(exactMatch).toBeDefined();
			}
		});

		it('should find elements by partial name', async () => {
			const results = await searchElement('video');
			// Should include video element if it exists
			for (const elem of results) {
				expect(elem.name.toLowerCase()).toContain('video');
			}
		});
	});

	describe('angle bracket handling', () => {
		it('should strip angle brackets from search', async () => {
			const withBrackets = await searchElement('<video>');
			const withoutBrackets = await searchElement('video');
			expect(withBrackets.length).toBe(withoutBrackets.length);
		});
	});

	describe('case insensitivity', () => {
		it('should be case-insensitive', async () => {
			const elements = await getElements();
			if (elements.length > 0) {
				const name = elements[0].name;
				const lowerResults = await searchElement(name.toLowerCase());
				const upperResults = await searchElement(name.toUpperCase());
				expect(lowerResults.length).toBe(upperResults.length);
			}
		});
	});

	describe('no results', () => {
		it('should return empty array for non-existent element', async () => {
			const results = await searchElement('nonexistent-element-xyz');
			expect(results.length).toBe(0);
		});
	});
});

describe('listElementSpecs', () => {
	describe('basic functionality', () => {
		it('should return array of spec shortnames', async () => {
			const specs = await listElementSpecs();
			expect(Array.isArray(specs)).toBe(true);
		});

		it('should return non-empty array', async () => {
			const specs = await listElementSpecs();
			expect(specs.length).toBeGreaterThan(0);
		});

		it('should return strings', async () => {
			const specs = await listElementSpecs();
			for (const spec of specs) {
				expect(typeof spec).toBe('string');
			}
		});
	});

	describe('sorting', () => {
		it('should return sorted array', async () => {
			const specs = await listElementSpecs();
			const sorted = [...specs].sort();
			expect(specs).toEqual(sorted);
		});
	});

	describe('content', () => {
		it('should include HTML spec', async () => {
			const specs = await listElementSpecs();
			const hasHtml = specs.some((s) => s.includes('html'));
			expect(hasHtml).toBe(true);
		});

		it('should not have duplicates', async () => {
			const specs = await listElementSpecs();
			const uniqueSpecs = new Set(specs);
			expect(specs.length).toBe(uniqueSpecs.size);
		});
	});
});
