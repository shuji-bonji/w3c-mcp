/**
 * List W3C/WHATWG/IETF web specifications
 */

import { loadSpecs } from '../data/loader.js';
import type { ListSpecsOptions, SpecSummary } from '../types/index.js';

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

	// Limit results
	specs = specs.slice(0, limit);

	// Map to summary format
	return specs.map((spec) => ({
		shortname: spec.shortname,
		title: spec.title,
		url: spec.url,
		nightlyUrl: spec.nightly?.url,
		organization: spec.organization,
		status: spec.release?.status || spec.nightly?.status,
		categories: spec.categories,
	}));
}
