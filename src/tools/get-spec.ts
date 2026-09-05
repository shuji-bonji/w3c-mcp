/**
 * Get detailed information about a specific web specification
 */

import { findSpec, loadSpecs } from '../data/loader.js';
import { SpecNotFoundError } from '../errors/index.js';
import type { SpecDetail } from '../types/index.js';
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
