/**
 * Utility functions for generating suggestions
 */

import { MAX_SUGGESTIONS } from '../constants/index.js';
import type { SpecDetail } from '../types/index.js';

/**
 * Generate suggestions for similar specs based on shortname
 */
export function generateSpecSuggestions(
	shortname: string,
	specs: SpecDetail[],
	maxSuggestions: number = MAX_SUGGESTIONS,
): string[] {
	const lowerShortname = shortname.toLowerCase();

	return specs
		.filter(
			(s) =>
				s.shortname.toLowerCase().includes(lowerShortname) ||
				lowerShortname.includes(s.shortname.toLowerCase()) ||
				s.title.toLowerCase().includes(lowerShortname),
		)
		.slice(0, maxSuggestions)
		.map((s) => s.shortname);
}

/**
 * Generate suggestions for WebIDL specs
 */
export function generateWebIDLSuggestions(
	shortname: string,
	specs: SpecDetail[],
	idlData: Record<string, string>,
	maxSuggestions: number = MAX_SUGGESTIONS,
): string[] {
	const lowerShortname = shortname.toLowerCase();

	return specs
		.filter((s) => idlData[s.shortname])
		.filter(
			(s) =>
				s.shortname.toLowerCase().includes(lowerShortname) ||
				lowerShortname.includes(s.shortname.toLowerCase()) ||
				s.title.toLowerCase().includes(lowerShortname),
		)
		.slice(0, maxSuggestions)
		.map((s) => s.shortname);
}

/**
 * Convert suggestions array to optional format (undefined if empty)
 */
export function toOptionalSuggestions(suggestions: string[]): string[] | undefined {
	return suggestions.length > 0 ? suggestions : undefined;
}
