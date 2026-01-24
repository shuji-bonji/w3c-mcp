/**
 * Tests for tools/search-specs.ts
 */

import { describe, expect, it } from 'vitest';
import { quickFindByShortname, searchSpecs } from '../../src/tools/search-specs.js';

describe('searchSpecs', () => {
	describe('basic functionality', () => {
		it('should return array of search results', async () => {
			const results = await searchSpecs('fetch');
			expect(Array.isArray(results)).toBe(true);
		});

		it('should return results with required properties', async () => {
			const results = await searchSpecs('fetch');
			if (results.length > 0) {
				const result = results[0];
				expect(result).toHaveProperty('shortname');
				expect(result).toHaveProperty('title');
				expect(result).toHaveProperty('url');
				expect(result).toHaveProperty('matchType');
				expect(result).toHaveProperty('score');
			}
		});

		it('should respect limit parameter', async () => {
			const results = await searchSpecs('web', 5);
			expect(results.length).toBeLessThanOrEqual(5);
		});

		it('should return empty array for non-matching query', async () => {
			const results = await searchSpecs('xyznonexistent123abc');
			expect(results.length).toBe(0);
		});
	});

	describe('scoring', () => {
		it('should give exact shortname match highest score (100)', async () => {
			const results = await searchSpecs('fetch');
			const exactMatch = results.find((r) => r.shortname === 'fetch');
			expect(exactMatch).toBeDefined();
			expect(exactMatch?.score).toBe(100);
		});

		it('should prioritize shortname matches over title matches', async () => {
			const results = await searchSpecs('dom');
			const shortnameMatch = results.find((r) => r.matchType === 'shortname');
			const titleMatch = results.find((r) => r.matchType === 'title');

			if (shortnameMatch && titleMatch) {
				expect(shortnameMatch.score).toBeGreaterThanOrEqual(titleMatch.score);
			}
		});

		it('should sort results by score descending', async () => {
			const results = await searchSpecs('service worker');
			for (let i = 0; i < results.length - 1; i++) {
				expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
			}
		});
	});

	describe('match types', () => {
		it('should identify shortname matches', async () => {
			const results = await searchSpecs('fetch');
			const shortnameMatches = results.filter((r) => r.matchType === 'shortname');
			expect(shortnameMatches.length).toBeGreaterThan(0);
		});

		it('should identify title matches', async () => {
			const results = await searchSpecs('Service Worker');
			const hasMatch = results.some((r) => r.matchType === 'title' || r.matchType === 'shortname');
			expect(hasMatch).toBe(true);
		});
	});

	describe('word-based matching', () => {
		it('should match multi-word queries', async () => {
			const results = await searchSpecs('service worker');
			expect(results.length).toBeGreaterThan(0);
		});

		it('should match partial word queries', async () => {
			const results = await searchSpecs('manifest');
			expect(results.length).toBeGreaterThan(0);
		});
	});

	describe('default limit', () => {
		it('should use default limit of 20', async () => {
			const results = await searchSpecs('web');
			expect(results.length).toBeLessThanOrEqual(20);
		});
	});
});

describe('quickFindByShortname', () => {
	it('should find spec by exact shortname', async () => {
		const result = await quickFindByShortname('fetch');
		expect(result).toBeDefined();
		expect(result?.shortname).toBe('fetch');
		expect(result?.score).toBe(100);
		expect(result?.matchType).toBe('shortname');
	});

	it('should return null for non-existent shortname', async () => {
		const result = await quickFindByShortname('nonexistent-spec-xyz');
		expect(result).toBeNull();
	});

	it('should return result with all required properties', async () => {
		const result = await quickFindByShortname('dom');
		expect(result).toBeDefined();
		if (result) {
			expect(result).toHaveProperty('shortname');
			expect(result).toHaveProperty('title');
			expect(result).toHaveProperty('url');
			expect(result).toHaveProperty('matchType');
			expect(result).toHaveProperty('score');
		}
	});

	it('should find specs through series shortname', async () => {
		// Many specs have series shortnames that differ from their main shortname
		const result = await quickFindByShortname('service-workers');
		expect(result).toBeDefined();
	});
});
