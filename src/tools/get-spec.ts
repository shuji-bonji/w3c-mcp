/**
 * Get detailed information about a specific web specification
 */

import { findSpec, loadSpecs } from '../data/loader.js';
import type { DependencyInfo, SpecDetail } from '../types/index.js';

export async function getSpec(shortname: string): Promise<SpecDetail | null> {
	const spec = await findSpec(shortname);

	if (!spec) {
		// Return suggestions for similar specs
		const specs = await loadSpecs();
		const suggestions = specs
			.filter(
				(s) =>
					s.shortname.includes(shortname) ||
					shortname.includes(s.shortname) ||
					s.title.toLowerCase().includes(shortname.toLowerCase()),
			)
			.slice(0, 5)
			.map((s) => s.shortname);

		throw new Error(
			`Specification "${shortname}" not found.` +
				(suggestions.length > 0
					? ` Did you mean: ${suggestions.join(', ')}?`
					: ' Please check the shortname and try again.'),
		);
	}

	return {
		shortname: spec.shortname,
		title: spec.title,
		url: spec.url,
		nightlyUrl: spec.nightly?.url,
		organization: spec.organization,
		status: spec.release?.status || spec.nightly?.status,
		categories: spec.categories,
		abstract: spec.abstract,
		repository: spec.repository,
		tests: spec.tests,
		release: spec.release,
		nightly: spec.nightly,
		series: spec.series,
		source: spec.source,
		standing: spec.standing,
	};
}

/**
 * Get dependency information for a specification
 */
export async function getSpecDependencies(shortname: string): Promise<DependencyInfo> {
	const specs = await loadSpecs();
	const spec = specs.find((s) => s.shortname === shortname);

	if (!spec) {
		throw new Error(`Specification "${shortname}" not found.`);
	}

	// Note: web-specs doesn't include explicit dependency data
	// We would need to analyze IDL or spec content for this
	// For now, return basic info
	return {
		shortname: spec.shortname,
		title: spec.title,
		dependencies: [],
		dependents: [],
	};
}
