/**
 * List W3C/WHATWG/IETF web specifications
 */

import { loadSpecs } from '../data/loader.js';
import type { ListSpecsOptions, SpecSummary } from '../types/index.js';
import { toSpecSummaries } from '../utils/mapper.js';

export async function listSpecs(options: ListSpecsOptions = {}): Promise<SpecSummary[]> {
	const { organization, keyword, category, limit = 50 } = options;

	let specs = await loadSpecs();

	// Filter by organization
	if (organization && organization !== 'all') {
		specs = specs.filter((spec) => {
			const specOrg = spec.organization?.toUpperCase();
			return specOrg === organization.toUpperCase();
		});
	}

	// Filter by keyword in title or shortname
	if (keyword) {
		const lowerKeyword = keyword.toLowerCase();
		specs = specs.filter(
			(spec) =>
				spec.title.toLowerCase().includes(lowerKeyword) ||
				spec.shortname.toLowerCase().includes(lowerKeyword),
		);
	}

	// Filter by category (if available in spec data)
	if (category) {
		specs = specs.filter((spec) =>
			spec.categories?.some((cat) => cat.toLowerCase().includes(category.toLowerCase())),
		);
	}

	// Limit results and map to summary format
	return toSpecSummaries(specs.slice(0, limit));
}
