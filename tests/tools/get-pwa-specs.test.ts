/**
 * Tests for tools/get-pwa-specs.ts
 */

import { describe, expect, it } from 'vitest';
import { PWA_SHORTNAMES } from '../../src/constants/index.js';
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

	describe('strict matching (default)', () => {
		it('should only return specs listed in PWA_SHORTNAMES', async () => {
			const specs = await getPwaSpecs();
			const allowed = new Set<string>(PWA_SHORTNAMES);
			for (const spec of specs) {
				expect(allowed.has(spec.shortname)).toBe(true);
			}
		});

		it('should not include specs that merely contain a keyword in the title', async () => {
			const specs = await getPwaSpecs();
			const shortnames = specs.map((s) => s.shortname);
			// "CSS Backgrounds", "Publication Manifest", "HTTP Cache-Control ..." are not PWA specs
			expect(shortnames).not.toContain('css-backgrounds-3');
			expect(shortnames).not.toContain('pub-manifest');
			expect(shortnames).not.toContain('rfc5861');
		});

		it('should sort listed specs by title', async () => {
			const specs = await getPwaSpecs();
			const titles = specs.map((s) => s.title);
			const sorted = [...titles].sort((a, b) => a.localeCompare(b));
			expect(titles).toEqual(sorted);
		});
	});

	describe('includeRelated', () => {
		it('should return a superset of the default result', async () => {
			const strict = await getPwaSpecs();
			const related = await getPwaSpecs({ includeRelated: true });
			expect(related.length).toBeGreaterThan(strict.length);
			const relatedShortnames = new Set(related.map((s) => s.shortname));
			for (const spec of strict) {
				expect(relatedShortnames.has(spec.shortname)).toBe(true);
			}
		});

		it('should list PWA specs first, then related specs', async () => {
			const strict = await getPwaSpecs();
			const related = await getPwaSpecs({ includeRelated: true });
			expect(related.slice(0, strict.length).map((s) => s.shortname)).toEqual(
				strict.map((s) => s.shortname),
			);
		});

		it('should include storage specs as related', async () => {
			const related = await getPwaSpecs({ includeRelated: true });
			expect(related.map((s) => s.shortname)).toContain('storage');
		});

		it('should not contain duplicates', async () => {
			const related = await getPwaSpecs({ includeRelated: true });
			const shortnames = related.map((s) => s.shortname);
			expect(new Set(shortnames).size).toBe(shortnames.length);
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
