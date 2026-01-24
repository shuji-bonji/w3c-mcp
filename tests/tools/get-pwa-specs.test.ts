/**
 * Tests for tools/get-pwa-specs.ts
 */

import { describe, expect, it } from 'vitest';
import { getCorePwaSpecs, getPwaSpecs } from '../../src/tools/get-pwa-specs.js';

describe('getPwaSpecs', () => {
	describe('basic functionality', () => {
		it('should return array of PWA specs', async () => {
			const specs = await getPwaSpecs();
			expect(Array.isArray(specs)).toBe(true);
			expect(specs.length).toBeGreaterThan(0);
		});

		it('should return specs with required properties', async () => {
			const specs = await getPwaSpecs();
			for (const spec of specs) {
				expect(spec).toHaveProperty('shortname');
				expect(spec).toHaveProperty('title');
				expect(spec).toHaveProperty('url');
			}
		});
	});

	describe('PWA-related content', () => {
		it('should include service workers spec', async () => {
			const specs = await getPwaSpecs();
			const hasServiceWorkers = specs.some(
				(s) =>
					s.shortname.includes('service-workers') ||
					s.title.toLowerCase().includes('service worker'),
			);
			expect(hasServiceWorkers).toBe(true);
		});

		it('should include app manifest spec', async () => {
			const specs = await getPwaSpecs();
			const hasManifest = specs.some(
				(s) =>
					s.shortname.includes('appmanifest') ||
					s.shortname.includes('manifest') ||
					s.title.toLowerCase().includes('manifest'),
			);
			expect(hasManifest).toBe(true);
		});

		it('should include push API spec', async () => {
			const specs = await getPwaSpecs();
			const hasPush = specs.some(
				(s) => s.shortname.includes('push') || s.title.toLowerCase().includes('push'),
			);
			expect(hasPush).toBe(true);
		});

		it('should include notifications spec', async () => {
			const specs = await getPwaSpecs();
			const hasNotifications = specs.some(
				(s) =>
					s.shortname.includes('notification') || s.title.toLowerCase().includes('notification'),
			);
			expect(hasNotifications).toBe(true);
		});
	});

	describe('sorting', () => {
		it('should prioritize exact PWA shortname matches', async () => {
			const specs = await getPwaSpecs();
			// First few specs should be core PWA specs
			const coreShortnames = ['service-workers', 'appmanifest', 'push-api', 'notifications'];
			const firstFewSpecs = specs.slice(0, 10);
			const hasCoreSpecs = firstFewSpecs.some((s) =>
				coreShortnames.some(
					(name) =>
						s.shortname.includes(name) || s.title.toLowerCase().includes(name.replace('-', ' ')),
				),
			);
			expect(hasCoreSpecs).toBe(true);
		});
	});
});

describe('getCorePwaSpecs', () => {
	describe('basic functionality', () => {
		it('should return array of core PWA specs', async () => {
			const specs = await getCorePwaSpecs();
			expect(Array.isArray(specs)).toBe(true);
		});

		it('should return specs with required properties', async () => {
			const specs = await getCorePwaSpecs();
			for (const spec of specs) {
				expect(spec).toHaveProperty('shortname');
				expect(spec).toHaveProperty('title');
				expect(spec).toHaveProperty('url');
			}
		});
	});

	describe('core specs content', () => {
		it('should return fewer specs than getPwaSpecs', async () => {
			const allPwa = await getPwaSpecs();
			const corePwa = await getCorePwaSpecs();
			expect(corePwa.length).toBeLessThanOrEqual(allPwa.length);
		});

		it('should include essential PWA specs', async () => {
			const specs = await getCorePwaSpecs();
			const shortnames = specs.map((s) => s.shortname.toLowerCase());
			const _titles = specs.map((s) => s.title.toLowerCase());

			// Check for core specs (at least one should match)
			const hasServiceWorkers = shortnames.some((s) => s.includes('service-workers'));
			const hasManifest = shortnames.some(
				(s) => s.includes('appmanifest') || s.includes('manifest'),
			);

			// At least one core spec should be present
			expect(hasServiceWorkers || hasManifest).toBe(true);
		});
	});

	describe('comparison with getPwaSpecs', () => {
		it('core specs should be subset of all PWA specs', async () => {
			const allPwa = await getPwaSpecs();
			const corePwa = await getCorePwaSpecs();

			const allShortnames = new Set(allPwa.map((s) => s.shortname));
			for (const spec of corePwa) {
				expect(allShortnames.has(spec.shortname)).toBe(true);
			}
		});
	});
});
