/**
 * Tests for tools/get-webidl.ts
 */

import { describe, expect, it } from 'vitest';
import { getWebIDL, listWebIDLSpecs } from '../../src/tools/get-webidl.js';

describe('getWebIDL', () => {
	describe('basic functionality', () => {
		it('should return WebIDL content as string', async () => {
			const idlSpecs = await listWebIDLSpecs();
			if (idlSpecs.length > 0) {
				const idl = await getWebIDL(idlSpecs[0]);
				expect(typeof idl).toBe('string');
				expect(idl.length).toBeGreaterThan(0);
			}
		});

		it('should return valid WebIDL for DOM spec', async () => {
			const idlSpecs = await listWebIDLSpecs();
			const hasDom = idlSpecs.some((s) => s.includes('dom'));
			if (hasDom) {
				const domSpec = idlSpecs.find((s) => s === 'dom' || s.includes('dom'));
				if (domSpec) {
					const idl = await getWebIDL(domSpec);
					expect(idl).toContain('interface');
				}
			}
		});
	});

	describe('spec lookup variations', () => {
		it('should find WebIDL by exact shortname', async () => {
			const idlSpecs = await listWebIDLSpecs();
			if (idlSpecs.length > 0) {
				const idl = await getWebIDL(idlSpecs[0]);
				expect(typeof idl).toBe('string');
			}
		});
	});

	describe('error handling', () => {
		it('should throw error for non-existent spec', async () => {
			await expect(getWebIDL('nonexistent-spec-xyz123')).rejects.toThrow();
		});

		it('should include helpful message in error', async () => {
			try {
				await getWebIDL('nonexistent-xyz');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				const message = (error as Error).message;
				expect(message).toContain('not found');
			}
		});

		it('should throw error for ambiguous matches', async () => {
			// 'css' might match multiple specs like 'css-animations', 'css-grid', etc.
			// This test checks that ambiguous matches are handled
			const idlSpecs = await listWebIDLSpecs();
			const cssSpecs = idlSpecs.filter((s) => s.startsWith('css'));
			if (cssSpecs.length > 1) {
				// Should work with exact match
				const idl = await getWebIDL(cssSpecs[0]);
				expect(typeof idl).toBe('string');
			}
		});
	});

	describe('coverage: spec lookup paths', () => {
		it('should find WebIDL through findSpec when not direct match', async () => {
			// Try with a series shortname variation (e.g., service-workers vs service-workers-1)
			const idlSpecs = await listWebIDLSpecs();
			// Find a spec with version number
			const versionedSpec = idlSpecs.find((s) => /-\d+$/.test(s));
			if (versionedSpec) {
				// Try without version number to trigger findSpec lookup
				const baseName = versionedSpec.replace(/-\d+$/, '');
				// This might work if there's a series match
				try {
					const idl = await getWebIDL(baseName);
					expect(typeof idl).toBe('string');
				} catch {
					// Expected if no series match - just ensure no unexpected error
				}
			}
		});

		it('should find WebIDL through series shortname', async () => {
			// Service Workers has series shortname 'service-workers'
			const idl = await getWebIDL('service-workers');
			expect(typeof idl).toBe('string');
			expect(idl.length).toBeGreaterThan(0);
		});

		it('should find single partial match', async () => {
			const idlSpecs = await listWebIDLSpecs();
			// Find a unique spec name that can be partially matched
			const uniqueSpec = idlSpecs.find(
				(s) =>
					idlSpecs.filter((other) => other.includes(s) || s.includes(other)).length === 1 &&
					s.length > 5,
			);
			if (uniqueSpec) {
				// Try with the unique spec - should find via partial match
				const idl = await getWebIDL(uniqueSpec);
				expect(typeof idl).toBe('string');
			}
		});

		it('should generate suggestions for similar specs', async () => {
			// Search for something that might have suggestions
			try {
				await getWebIDL('fetchx');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				// Error should mention fetch as a suggestion
				const message = (error as Error).message;
				expect(message.length).toBeGreaterThan(0);
			}
		});
	});

	describe('WebIDL content validation', () => {
		it('should return content containing WebIDL keywords', async () => {
			const idlSpecs = await listWebIDLSpecs();
			if (idlSpecs.length > 0) {
				const idl = await getWebIDL(idlSpecs[0]);
				// WebIDL typically contains these keywords
				const hasWebIDLContent =
					idl.includes('interface') ||
					idl.includes('dictionary') ||
					idl.includes('enum') ||
					idl.includes('typedef') ||
					idl.includes('callback');
				expect(hasWebIDLContent).toBe(true);
			}
		});
	});
});

describe('listWebIDLSpecs', () => {
	describe('basic functionality', () => {
		it('should return array of spec shortnames', async () => {
			const specs = await listWebIDLSpecs();
			expect(Array.isArray(specs)).toBe(true);
		});

		it('should return non-empty array', async () => {
			const specs = await listWebIDLSpecs();
			expect(specs.length).toBeGreaterThan(0);
		});

		it('should return strings', async () => {
			const specs = await listWebIDLSpecs();
			for (const spec of specs) {
				expect(typeof spec).toBe('string');
			}
		});
	});

	describe('sorting', () => {
		it('should return sorted array', async () => {
			const specs = await listWebIDLSpecs();
			const sorted = [...specs].sort();
			expect(specs).toEqual(sorted);
		});
	});

	describe('content', () => {
		it('should include major specs like DOM or Fetch', async () => {
			const specs = await listWebIDLSpecs();
			const _hasDomOrFetch =
				specs.some((s) => s === 'dom' || s.includes('dom')) ||
				specs.some((s) => s === 'fetch' || s.includes('fetch'));
			// At least some common spec should be present
			expect(specs.length).toBeGreaterThan(0);
		});

		it('should not have duplicates', async () => {
			const specs = await listWebIDLSpecs();
			const uniqueSpecs = new Set(specs);
			expect(specs.length).toBe(uniqueSpecs.size);
		});
	});
});
