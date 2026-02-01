/**
 * Get WebIDL definitions for a specification
 */

import { findSpec, loadSpecs, loadWebIDLRaw } from '../data/loader.js';
import { WebIDLNotFoundError } from '../errors/index.js';

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

	// No match found
	const specs = await loadSpecs();
	const suggestions = specs
		.filter((s) => idlData[s.shortname])
		.filter(
			(s) =>
				s.shortname.includes(shortname) ||
				shortname.includes(s.shortname) ||
				s.title.toLowerCase().includes(shortname.toLowerCase()),
		)
		.slice(0, 5)
		.map((s) => s.shortname);

	throw new WebIDLNotFoundError(shortname, suggestions.length > 0 ? suggestions : undefined);
}

/**
 * List all specifications that have WebIDL definitions
 */
export async function listWebIDLSpecs(): Promise<string[]> {
	const idlData = await loadWebIDLRaw();
	return Object.keys(idlData).sort();
}
