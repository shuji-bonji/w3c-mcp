/**
 * Get WebIDL definitions for a specification
 */

import { findSpec, loadSpecs, loadWebIDLRaw } from '../data/loader.js';
import { WebIDLNotFoundError } from '../errors/index.js';
import { generateWebIDLSuggestions, toOptionalSuggestions } from '../utils/suggestions.js';

export async function getWebIDL(shortname: string): Promise<string> {
	const idlData = await loadWebIDLRaw();

	// Try exact match first
	if (idlData[shortname]) {
		return idlData[shortname];
	}

	// Try finding the spec to get its proper shortname
	const spec = await findSpec(shortname);
	if (spec && idlData[spec.shortname]) {
		return idlData[spec.shortname];
	}

	// Try series shortname
	if (spec?.series?.shortname && idlData[spec.series.shortname]) {
		return idlData[spec.series.shortname];
	}

	// Try partial match
	const matchingKeys = Object.keys(idlData).filter(
		(key) => key.includes(shortname) || shortname.includes(key),
	);

	if (matchingKeys.length === 1) {
		return idlData[matchingKeys[0]];
	}

	if (matchingKeys.length > 1) {
		throw new WebIDLNotFoundError(shortname, matchingKeys, true);
	}

	// No match found - generate suggestions
	const specs = await loadSpecs();
	const suggestions = generateWebIDLSuggestions(shortname, specs, idlData);
	throw new WebIDLNotFoundError(shortname, toOptionalSuggestions(suggestions));
}

/**
 * List all specifications that have WebIDL definitions
 */
export async function listWebIDLSpecs(): Promise<string[]> {
	const idlData = await loadWebIDLRaw();
	return Object.keys(idlData).sort();
}
