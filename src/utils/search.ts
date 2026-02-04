/**
 * Generic search utilities
 */

/**
 * Filter items by name matching (case-insensitive)
 * Matches exact name or name containing the search term
 */
export function filterByName<T extends { name: string }>(items: T[], searchTerm: string): T[] {
	const lowerTerm = searchTerm.toLowerCase();

	return items.filter(
		(item) => item.name.toLowerCase() === lowerTerm || item.name.toLowerCase().includes(lowerTerm),
	);
}

/**
 * Strip angle brackets from element names (e.g., "<video>" -> "video")
 */
export function normalizeElementName(name: string): string {
	return name.toLowerCase().replace(/^<|>$/g, '');
}
