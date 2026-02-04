/**
 * Get all PWA-related specifications
 */

import { CORE_PWA_SHORTNAMES, PWA_KEYWORDS, PWA_SHORTNAMES } from '../constants/index.js';
import { loadSpecs } from '../data/loader.js';
import type { SpecSummary } from '../types/index.js';
import { toSpecSummaries } from '../utils/mapper.js';

/**
 * Check if a spec matches any of the given shortnames
 */
function matchesShortnames(
	spec: { shortname: string; series?: { shortname?: string } },
	shortnames: readonly string[],
): boolean {
	return shortnames.some(
		(name) => spec.shortname.includes(name) || spec.series?.shortname?.includes(name),
	);
}

/**
 * Check if a spec is an exact match for any of the given shortnames
 */
function isExactMatch(
	spec: { shortname: string; series?: { shortname?: string } },
	shortnames: readonly string[],
): boolean {
	return (
		shortnames.includes(spec.shortname) ||
		(spec.series?.shortname !== undefined &&
			shortnames.includes(spec.series.shortname as (typeof shortnames)[number]))
	);
}

export async function getPwaSpecs(): Promise<SpecSummary[]> {
	const allSpecs = await loadSpecs();

	const pwaSpecs = allSpecs.filter((spec) => {
		// Check if shortname matches known PWA specs
		if (matchesShortnames(spec, PWA_SHORTNAMES)) {
			return true;
		}

		// Check if title contains PWA-related keywords
		const lowerTitle = spec.title.toLowerCase();
		return PWA_KEYWORDS.some((keyword) => lowerTitle.includes(keyword));
	});

	// Sort by relevance (exact shortname matches first, then alphabetically)
	pwaSpecs.sort((a, b) => {
		const aExact = isExactMatch(a, PWA_SHORTNAMES);
		const bExact = isExactMatch(b, PWA_SHORTNAMES);

		if (aExact && !bExact) return -1;
		if (!aExact && bExact) return 1;
		return a.title.localeCompare(b.title);
	});

	return toSpecSummaries(pwaSpecs);
}

/**
 * Get the core PWA specifications (the most essential ones)
 */
export async function getCorePwaSpecs(): Promise<SpecSummary[]> {
	const allSpecs = await loadSpecs();

	const coreSpecs = allSpecs.filter((spec) => matchesShortnames(spec, CORE_PWA_SHORTNAMES));

	return toSpecSummaries(coreSpecs);
}
