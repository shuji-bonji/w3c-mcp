/**
 * Utility functions for mapping spec data
 */

import type { SpecDetail, SpecSummary } from '../types/index.js';

/**
 * Map a SpecDetail to a SpecSummary
 */
export function toSpecSummary(spec: SpecDetail): SpecSummary {
	return {
		shortname: spec.shortname,
		title: spec.title,
		url: spec.url,
		nightlyUrl: spec.nightly?.url,
		organization: spec.organization,
		status: spec.release?.status || spec.nightly?.status,
		categories: spec.categories,
	};
}

/**
 * Map an array of SpecDetail to SpecSummary array
 */
export function toSpecSummaries(specs: SpecDetail[]): SpecSummary[] {
	return specs.map(toSpecSummary);
}
