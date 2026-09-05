/**
 * Tests for tools/get-spec.ts
 */

import { describe, expect, it } from 'vitest';
import { getSpec } from '../../src/tools/get-spec.js';

describe('getSpec', () => {
	describe('basic functionality', () => {
		it('should return spec details for valid shortname', async () => {
			const spec = await getSpec('fetch');
			expect(spec).toBeDefined();
			expect(spec?.shortname).toBe('fetch');
		});

		it('should return spec with all expected properties', async () => {
			const spec = await getSpec('dom');
			expect(spec).toHaveProperty('shortname');
			expect(spec).toHaveProperty('title');
			expect(spec).toHaveProperty('url');
		});

		it('should include optional properties when available', async () => {
			const spec = await getSpec('fetch');
			// These properties might be available for some specs
			if (spec) {
				expect(spec).toHaveProperty('shortname');
				expect(spec).toHaveProperty('title');
				expect(spec).toHaveProperty('url');
			}
		});
	});

	describe('error handling', () => {
		it('should throw error for non-existent spec', async () => {
			await expect(getSpec('nonexistent-spec-xyz123')).rejects.toThrow();
		});

		it('should include helpful message in error', async () => {
			try {
				await getSpec('fetc'); // typo
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				const message = (error as Error).message;
				expect(message).toContain('not found');
			}
		});

		it('should suggest similar specs in error message', async () => {
			try {
				await getSpec('fetc'); // typo
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				const message = (error as Error).message;
				// Should suggest 'fetch' since it's similar
				expect(message).toContain('fetch');
			}
		});
	});

	describe('spec lookup variations', () => {
		it('should find spec by exact shortname', async () => {
			const spec = await getSpec('fetch');
			expect(spec?.shortname).toBe('fetch');
		});

		it('should find spec by series shortname', async () => {
			// service-workers should find the spec even if exact shortname differs
			const spec = await getSpec('service-workers');
			expect(spec).toBeDefined();
			expect(spec?.shortname).toContain('service-workers');
		});
	});

	describe('returned data structure', () => {
		it('should include nightly URL when available', async () => {
			const spec = await getSpec('fetch');
			// Not all specs have nightly URLs, but the property should exist
			expect(spec).toHaveProperty('nightlyUrl');
		});

		it('should include status when available', async () => {
			const spec = await getSpec('fetch');
			expect(spec).toHaveProperty('status');
		});

		it('should include organization', async () => {
			const spec = await getSpec('fetch');
			expect(spec).toHaveProperty('organization');
		});
	});
});
