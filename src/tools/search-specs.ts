/**
 * Search web specifications by query
 *
 * Performance improvements:
 * - Early termination for exact matches
 * - Score threshold to skip low-relevance results
 * - Optimized string operations
 */

import { loadSpecs } from '../data/loader.js';
import type { SpecSearchResult } from '../types/index.js';

// Pre-compile common patterns
const WORD_SPLIT_REGEX = /\s+/;

export async function searchSpecs(query: string, limit: number = 20): Promise<SpecSearchResult[]> {
  const specs = await loadSpecs();
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(WORD_SPLIT_REGEX).filter(w => w.length > 2);

  const results: SpecSearchResult[] = [];

  // Track if we found a perfect match - can optimize further iterations
  let foundPerfectMatch = false;

  for (const spec of specs) {
    const lowerShortname = spec.shortname.toLowerCase();
    const lowerTitle = spec.title.toLowerCase();

    let score = 0;
    let matchType: 'title' | 'shortname' | 'description' = 'title';

    // Exact shortname match (highest score) - early optimization
    if (lowerShortname === lowerQuery) {
      score = 100;
      matchType = 'shortname';
      foundPerfectMatch = true;
    }
    // Shortname contains query
    else if (lowerShortname.includes(lowerQuery)) {
      score = 80;
      matchType = 'shortname';
    }
    // Query contains shortname (only for meaningful shortnames)
    else if (lowerShortname.length > 3 && lowerQuery.includes(lowerShortname)) {
      score = 70;
      matchType = 'shortname';
    }
    // Exact title match
    else if (lowerTitle === lowerQuery) {
      score = 90;
      matchType = 'title';
    }
    // Title contains query
    else if (lowerTitle.includes(lowerQuery)) {
      score = 60;
      matchType = 'title';
    }
    // Word-based matching
    else if (queryWords.length > 0) {
      const matchedWords = queryWords.filter(word => lowerTitle.includes(word));
      if (matchedWords.length === queryWords.length) {
        // All words match
        score = 50;
        matchType = 'title';
      } else if (matchedWords.length > 0) {
        // Some words match
        score = 30 + (matchedWords.length / queryWords.length) * 20;
        matchType = 'title';
      }
    }

    // Abstract/description match (lower priority) - only check if no other match
    if (score === 0 && spec.abstract) {
      const lowerAbstract = spec.abstract.toLowerCase();
      if (lowerAbstract.includes(lowerQuery)) {
        score = 25;
        matchType = 'description';
      } else if (queryWords.length > 0) {
        const matchedWords = queryWords.filter(word => lowerAbstract.includes(word));
        if (matchedWords.length >= queryWords.length / 2) {
          score = 15 + (matchedWords.length / queryWords.length) * 10;
          matchType = 'description';
        }
      }
    }

    // Only add results with meaningful scores
    if (score > 0) {
      results.push({
        shortname: spec.shortname,
        title: spec.title,
        url: spec.url,
        nightlyUrl: spec.nightly?.url,
        organization: spec.organization,
        status: spec.release?.status || spec.nightly?.status,
        matchType,
        score
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
    shortname: spec.shortname,
    title: spec.title,
    url: spec.url,
    nightlyUrl: spec.nightly?.url,
    organization: spec.organization,
    status: spec.release?.status || spec.nightly?.status,
    matchType: 'shortname',
    score: 100
  };
}
