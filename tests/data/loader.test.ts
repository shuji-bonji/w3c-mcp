/**
 * Tests for data/loader.ts
 */

import { describe, expect, it } from 'vitest';
import {
	clearCache,
	findSpec,
	loadCSS,
	loadElements,
	loadSpecs,
	loadWebIDLRaw,
	preloadAll,
} from '../../src/data/loader.js';

describe('loadSpecs', () => {
	it('should load specs array', async () => {
		const specs = await loadSpecs();
		expect(Array.isArray(specs)).toBe(true);
		expect(specs.length).toBeGreaterThan(0);
	});

	it('should have required properties for each spec', async () => {
		const specs = await loadSpecs();
		const spec = specs[0];
		expect(spec).toHaveProperty('shortname');
		expect(spec).toHaveProperty('title');
		expect(spec).toHaveProperty('url');
	});

	it('should share cache on multiple calls (singleton pattern)', async () => {
		// Clear cache to start fresh
		clearCache();

		// First call creates the promise
		const promise1 = loadSpecs();
		// Second call should use the same cached promise
		const promise2 = loadSpecs();

		// Both should resolve to the same array reference
		const result1 = await promise1;
		const result2 = await promise2;
		expect(result1).toBe(result2);
	});

	it('should return new promise after clearCache', async () => {
		const promise1 = loadSpecs();
		await promise1;
		clearCache();
		const promise2 = loadSpecs();
		expect(promise1).not.toBe(promise2);
	});
});

describe('findSpec', () => {
	it('should find spec by exact shortname', async () => {
		const spec = await findSpec('fetch');
		expect(spec).toBeDefined();
		expect(spec?.shortname).toBe('fetch');
	});

	it('should find spec by series shortname', async () => {
		// service-workers-1 has series.shortname = 'service-workers'
		const spec = await findSpec('service-workers');
		expect(spec).toBeDefined();
		expect(spec?.shortname).toContain('service-workers');
	});

	it('should find spec by partial match', async () => {
		const spec = await findSpec('dom');
		expect(spec).toBeDefined();
	});

	it('should return undefined for non-existent spec', async () => {
		const spec = await findSpec('nonexistent-spec-xyz123');
		expect(spec).toBeUndefined();
	});
});

describe('loadWebIDLRaw', () => {
	it('should load WebIDL data', async () => {
		const idlData = await loadWebIDLRaw();
		expect(typeof idlData).toBe('object');
	});

	it('should contain WebIDL for known specs', async () => {
		const idlData = await loadWebIDLRaw();
		// Check if any specs have IDL data
		const keys = Object.keys(idlData);
		expect(keys.length).toBeGreaterThan(0);
	});

	it('should return IDL content as strings', async () => {
		const idlData = await loadWebIDLRaw();
		const keys = Object.keys(idlData);
		if (keys.length > 0) {
			expect(typeof idlData[keys[0]]).toBe('string');
		}
	});
});

describe('loadCSS', () => {
	it('should load CSS data', async () => {
		const cssData = await loadCSS();
		expect(cssData).toHaveProperty('properties');
		expect(cssData).toHaveProperty('functions');
		expect(cssData).toHaveProperty('types');
		expect(cssData).toHaveProperty('selectors');
		expect(cssData).toHaveProperty('atrules');
	});

	it('should have CSS properties', async () => {
		const cssData = await loadCSS();
		expect(Array.isArray(cssData.properties)).toBe(true);
		expect(cssData.properties.length).toBeGreaterThan(0);
	});

	it('should have property name for each CSS property', async () => {
		const cssData = await loadCSS();
		for (const prop of cssData.properties.slice(0, 10)) {
			expect(prop).toHaveProperty('name');
			expect(typeof prop.name).toBe('string');
		}
	});
});

describe('loadElements', () => {
	it('should load elements data', async () => {
		const elementsData = await loadElements();
		expect(typeof elementsData).toBe('object');
	});

	it('should contain element definitions', async () => {
		const elementsData = await loadElements();
		const keys = Object.keys(elementsData);
		expect(keys.length).toBeGreaterThan(0);
	});

	it('should have spec and elements for each entry', async () => {
		const elementsData = await loadElements();
		const keys = Object.keys(elementsData);
		if (keys.length > 0) {
			const firstSpec = elementsData[keys[0]];
			expect(firstSpec).toHaveProperty('spec');
			expect(firstSpec).toHaveProperty('elements');
			expect(Array.isArray(firstSpec.elements)).toBe(true);
		}
	});
});

describe('preloadAll', () => {
	it('should preload all data in parallel', async () => {
		clearCache();
		await preloadAll();

		// After preload, all data should be cached
		const specs = await loadSpecs();
		const idl = await loadWebIDLRaw();
		const css = await loadCSS();
		const elements = await loadElements();

		expect(specs.length).toBeGreaterThan(0);
		expect(Object.keys(idl).length).toBeGreaterThan(0);
		expect(css.properties.length).toBeGreaterThan(0);
		expect(Object.keys(elements).length).toBeGreaterThan(0);
	});
});

describe('clearCache', () => {
	it('should clear all cached data', async () => {
		// First load data
		await loadSpecs();

		// Clear cache
		clearCache();

		// After clearing, new load should create new promise
		const promise1 = loadSpecs();
		clearCache();
		const promise2 = loadSpecs();

		expect(promise1).not.toBe(promise2);
	});
});
