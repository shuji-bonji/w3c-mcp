/**
 * Get detailed information about a specific web specification
 */

import { findSpec, loadSpecs } from '../data/loader.js';
import { SpecNotFoundError } from '../errors/index.js';
import type { DependencyInfo, SpecDetail } from '../types/index.js';
import { generateSpecSuggestions, toOptionalSuggestions } from '../utils/suggestions.js';

export async function getSpec(shortname: string): Promise<SpecDetail | null> {
	const spec = await findSpec(shortname);

	if (!spec) {
		const specs = await loadSpecs();
		const suggestions = generateSpecSuggestions(shortname, specs);
		throw new SpecNotFoundError(shortname, toOptionalSuggestions(suggestions));
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
 * Get dependency information for a specification.
 *
 * @deprecated Upstream `web-specs` does not expose dependency graph data.
 * This tool currently returns empty `dependencies` / `dependents` arrays and is
 * scheduled for removal in the next major release. Use `get_w3c_spec` for
 * basic spec metadata instead.
 */
export async function getSpecDependencies(shortname: string): Promise<DependencyInfo> {
	const specs = await loadSpecs();
	const spec = specs.find((s) => s.shortname === shortname);

	if (!spec) {
		const suggestions = generateSpecSuggestions(shortname, specs);
		throw new SpecNotFoundError(shortname, toOptionalSuggestions(suggestions));
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
