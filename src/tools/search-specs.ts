/**
 * Search web specifications by query
 *
 * Performance improvements:
 * - Early termination for exact matches
 * - Score threshold to skip low-relevance results
 * - Optimized string operations
 */

import {
	DEFAULT_SEARCH_LIMIT,
	MIN_ABSTRACT_WORD_MATCH_RATIO,
	MIN_SEARCH_WORD_LENGTH,
	MIN_SHORTNAME_LENGTH_FOR_REVERSE_MATCH,
	SEARCH_SCORES,
} from '../constants/index.js';
import { loadSpecs } from '../data/loader.js';
import type { SpecSearchResult } from '../types/index.js';
import { toSpecSummary } from '../utils/mapper.js';

// Pre-compile common patterns
const WORD_SPLIT_REGEX = /\s+/;

export async function searchSpecs(
	query: string,
	limit: number = DEFAULT_SEARCH_LIMIT,
): Promise<SpecSearchResult[]> {
	const specs = await loadSpecs();
	const lowerQuery = query.toLowerCase();
	const queryWords = lowerQuery
		.split(WORD_SPLIT_REGEX)
		.filter((w) => w.length > MIN_SEARCH_WORD_LENGTH);

	const results: SpecSearchResult[] = [];

	for (const spec of specs) {
		const lowerShortname = spec.shortname.toLowerCase();
		const lowerTitle = spec.title.toLowerCase();

		let score = 0;
		let matchType: 'title' | 'shortname' | 'description' = 'title';

		// Exact shortname match (highest score)
		if (lowerShortname === lowerQuery) {
			score = SEARCH_SCORES.EXACT_SHORTNAME;
			matchType = 'shortname';
		}
		// Shortname contains query
		else if (lowerShortname.includes(lowerQuery)) {
			score = SEARCH_SCORES.SHORTNAME_CONTAINS;
			matchType = 'shortname';
		}
		// Query contains shortname (only for meaningful shortnames)
		else if (
			lowerShortname.length > MIN_SHORTNAME_LENGTH_FOR_REVERSE_MATCH &&
			lowerQuery.includes(lowerShortname)
		) {
			score = SEARCH_SCORES.QUERY_CONTAINS_SHORTNAME;
			matchType = 'shortname';
		}
		// Exact title match
		else if (lowerTitle === lowerQuery) {
			score = SEARCH_SCORES.EXACT_TITLE;
			matchType = 'title';
		}
		// Title contains query
		else if (lowerTitle.includes(lowerQuery)) {
			score = SEARCH_SCORES.TITLE_CONTAINS;
			matchType = 'title';
		}
		// Word-based matching
		else if (queryWords.length > 0) {
			const matchedWords = queryWords.filter((word) => lowerTitle.includes(word));
			if (matchedWords.length === queryWords.length) {
				// All words match
				score = SEARCH_SCORES.ALL_WORDS_MATCH;
				matchType = 'title';
			} else if (matchedWords.length > 0) {
				// Some words match
				score =
					SEARCH_SCORES.PARTIAL_WORDS_BASE +
					(matchedWords.length / queryWords.length) * SEARCH_SCORES.PARTIAL_WORDS_BONUS;
				matchType = 'title';
			}
		}

		// Abstract/description match (lower priority) - only check if no other match
		if (score === 0 && spec.abstract) {
			const lowerAbstract = spec.abstract.toLowerCase();
			if (lowerAbstract.includes(lowerQuery)) {
				score = SEARCH_SCORES.ABSTRACT_CONTAINS;
				matchType = 'description';
			} else if (queryWords.length > 0) {
				const matchedWords = queryWords.filter((word) => lowerAbstract.includes(word));
				if (matchedWords.length >= queryWords.length * MIN_ABSTRACT_WORD_MATCH_RATIO) {
					score =
						SEARCH_SCORES.ABSTRACT_PARTIAL_BASE +
						(matchedWords.length / queryWords.length) * SEARCH_SCORES.ABSTRACT_PARTIAL_BONUS;
					matchType = 'description';
				}
			}
		}

		// Only add results with meaningful scores
		if (score > 0) {
			results.push({
				...toSpecSummary(spec),
				matchType,
				score,
			});
		}
	}

	// Sort by score descending
	results.sort((a, b) => b.score - a.score);

	return results.slice(0, limit);
}

/**
 * Quick search for exact shortname match
 * O(1) with index - use when you know exact shortname
 */
export async function quickFindByShortname(shortname: string): Promise<SpecSearchResult | null> {
	const { findSpec } = await import('../data/loader.js');
	const spec = await findSpec(shortname);

	if (!spec) return null;

	return {
		...toSpecSummary(spec),
		matchType: 'shortname' as const,
		score: SEARCH_SCORES.EXACT_SHORTNAME,
	};
}
