/**
 * Get PWA-related specifications
 */

import { CORE_PWA_SHORTNAMES, PWA_KEYWORDS, PWA_SHORTNAMES } from '../constants/index.js';
import { loadSpecs } from '../data/loader.js';
import type { SpecSummary } from '../types/index.js';
import { toSpecSummaries } from '../utils/mapper.js';

export interface GetPwaSpecsOptions {
	/**
	 * Also include specs whose title contains one of `PWA_KEYWORDS`
	 * (storage, caching, offline, ...). These are not PWA specs themselves
	 * but are commonly needed alongside them. Defaults to `false`.
	 */
	includeRelated?: boolean;
}

/**
 * Check if a spec's shortname (or its series shortname) is one of the given shortnames.
 * Matching is exact: `web-share` does not match `web-share-target`.
 */
function isListed(
	spec: { shortname: string; series?: { shortname?: string } },
	shortnames: readonly string[],
): boolean {
	return (
		shortnames.includes(spec.shortname) ||
		(spec.series?.shortname !== undefined && shortnames.includes(spec.series.shortname))
	);
}

/**
 * Check if a spec's title contains one of the PWA keywords
 */
function matchesKeyword(spec: { title: string }): boolean {
	const lowerTitle = spec.title.toLowerCase();
	return PWA_KEYWORDS.some((keyword) => lowerTitle.includes(keyword));
}

/**
 * Get PWA specifications.
 *
 * By default only the specs listed in `PWA_SHORTNAMES` are returned.
 * With `includeRelated: true`, specs whose title matches `PWA_KEYWORDS`
 * are appended after the listed ones.
 */
export async function getPwaSpecs(options: GetPwaSpecsOptions = {}): Promise<SpecSummary[]> {
	const { includeRelated = false } = options;
	const allSpecs = await loadSpecs();

	const listed = allSpecs.filter((spec) => isListed(spec, PWA_SHORTNAMES));
	listed.sort((a, b) => a.title.localeCompare(b.title));

	if (!includeRelated) {
		return toSpecSummaries(listed);
	}

	const listedShortnames = new Set(listed.map((spec) => spec.shortname));
	const related = allSpecs.filter(
		(spec) => !listedShortnames.has(spec.shortname) && matchesKeyword(spec),
	);
	related.sort((a, b) => a.title.localeCompare(b.title));

	return toSpecSummaries([...listed, ...related]);
}

/**
 * Get the core PWA specifications (the most essential ones)
 */
export async function getCorePwaSpecs(): Promise<SpecSummary[]> {
	const allSpecs = await loadSpecs();

	const coreSpecs = allSpecs.filter((spec) => isListed(spec, CORE_PWA_SHORTNAMES));

	return toSpecSummaries(coreSpecs);
}
