/**
 * Get all PWA-related specifications
 */

import { loadSpecs } from '../data/loader.js';
import type { SpecSummary } from '../types/index.js';

/**
 * List of PWA-related specification shortnames and keywords
 */
const PWA_SHORTNAMES = [
	'service-workers',
	'appmanifest',
	'push-api',
	'notifications',
	'background-fetch',
	'background-sync',
	'periodic-background-sync',
	'badging',
	'web-share',
	'web-share-target',
	'getinstalledrelatedapps',
	'payment-handler',
	'content-index',
	'window-controls-overlay',
	'file-handling',
	'file-system-access',
	'web-app-launch',
	'protocol-handler',
	'shortcuts',
	'scope-extensions',
];

/**
 * Additional keywords that might identify PWA-related specs
 */
const PWA_KEYWORDS = [
	'manifest',
	'service worker',
	'offline',
	'install',
	'background',
	'push',
	'notification',
	'cache',
	'storage',
];

export async function getPwaSpecs(): Promise<SpecSummary[]> {
	const allSpecs = await loadSpecs();

	const pwaSpecs = allSpecs.filter((spec) => {
		// Check if shortname matches known PWA specs
		const matchesShortname = PWA_SHORTNAMES.some(
			(name) => spec.shortname.includes(name) || spec.series?.shortname?.includes(name),
		);

		if (matchesShortname) return true;

		// Check if title contains PWA-related keywords
		const lowerTitle = spec.title.toLowerCase();
		const matchesKeyword = PWA_KEYWORDS.some((keyword) => lowerTitle.includes(keyword));

		return matchesKeyword;
	});

	// Sort by relevance (exact shortname matches first, then alphabetically)
	pwaSpecs.sort((a, b) => {
		const aExact =
			PWA_SHORTNAMES.includes(a.shortname) || PWA_SHORTNAMES.includes(a.series?.shortname || '');
		const bExact =
			PWA_SHORTNAMES.includes(b.shortname) || PWA_SHORTNAMES.includes(b.series?.shortname || '');

		if (aExact && !bExact) return -1;
		if (!aExact && bExact) return 1;
		return a.title.localeCompare(b.title);
	});

	return pwaSpecs.map((spec) => ({
		shortname: spec.shortname,
		title: spec.title,
		url: spec.url,
		nightlyUrl: spec.nightly?.url,
		organization: spec.organization,
		status: spec.release?.status || spec.nightly?.status,
		categories: spec.categories,
	}));
}

/**
 * Get the core PWA specifications (the most essential ones)
 */
export async function getCorePwaSpecs(): Promise<SpecSummary[]> {
	const coreShortnames = ['service-workers', 'appmanifest', 'push-api', 'notifications'];

	const allSpecs = await loadSpecs();

	const coreSpecs = allSpecs.filter((spec) =>
		coreShortnames.some(
			(name) => spec.shortname.includes(name) || spec.series?.shortname?.includes(name),
		),
	);

	return coreSpecs.map((spec) => ({
		shortname: spec.shortname,
		title: spec.title,
		url: spec.url,
		nightlyUrl: spec.nightly?.url,
		organization: spec.organization,
		status: spec.release?.status || spec.nightly?.status,
		categories: spec.categories,
	}));
}
