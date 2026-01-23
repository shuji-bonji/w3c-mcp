/**
 * Get WebIDL definitions for a specification
 */

import { loadWebIDLRaw, findSpec, loadSpecs } from '../data/loader.js';

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
  const matchingKeys = Object.keys(idlData).filter(key =>
    key.includes(shortname) || shortname.includes(key)
  );

  if (matchingKeys.length === 1) {
    return idlData[matchingKeys[0]];
  }

  if (matchingKeys.length > 1) {
    throw new Error(
      `Multiple WebIDL matches found for "${shortname}": ${matchingKeys.join(', ')}. ` +
      'Please specify the exact shortname.'
    );
  }

  // No match found
  const specs = await loadSpecs();
  const suggestions = specs
    .filter(s => idlData[s.shortname])
    .filter(s =>
      s.shortname.includes(shortname) ||
      shortname.includes(s.shortname) ||
      s.title.toLowerCase().includes(shortname.toLowerCase())
    )
    .slice(0, 5)
    .map(s => s.shortname);

  throw new Error(
    `WebIDL not found for "${shortname}".` +
    (suggestions.length > 0
      ? ` Specs with WebIDL that might match: ${suggestions.join(', ')}`
      : ' This specification might not have WebIDL definitions.')
  );
}

/**
 * List all specifications that have WebIDL definitions
 */
export async function listWebIDLSpecs(): Promise<string[]> {
  const idlData = await loadWebIDLRaw();
  return Object.keys(idlData).sort();
}
