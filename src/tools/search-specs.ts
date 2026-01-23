/**
 * Search web specifications by query
 */

import { loadSpecs } from '../data/loader.js';
import type { SpecSearchResult } from '../types/index.js';

export async function searchSpecs(query: string, limit: number = 20): Promise<SpecSearchResult[]> {
  const specs = await loadSpecs();
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

  const results: SpecSearchResult[] = [];

  for (const spec of specs) {
    let score = 0;
    let matchType: 'title' | 'shortname' | 'description' = 'title';

    const lowerShortname = spec.shortname.toLowerCase();
    const lowerTitle = spec.title.toLowerCase();
    const lowerAbstract = spec.abstract?.toLowerCase() || '';

    // Exact shortname match (highest score)
    if (lowerShortname === lowerQuery) {
      score = 100;
      matchType = 'shortname';
    }
    // Shortname contains query
    else if (lowerShortname.includes(lowerQuery)) {
      score = 80;
      matchType = 'shortname';
    }
    // Query contains shortname
    else if (lowerQuery.includes(lowerShortname) && lowerShortname.length > 3) {
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
    // All query words in title
    else if (queryWords.length > 0 && queryWords.every(word => lowerTitle.includes(word))) {
      score = 50;
      matchType = 'title';
    }
    // Some query words in title
    else if (queryWords.length > 0) {
      const matchedWords = queryWords.filter(word => lowerTitle.includes(word));
      if (matchedWords.length > 0) {
        score = 30 + (matchedWords.length / queryWords.length) * 20;
        matchType = 'title';
      }
    }

    // Abstract/description match (lower priority)
    if (score === 0 && lowerAbstract.includes(lowerQuery)) {
      score = 25;
      matchType = 'description';
    } else if (score === 0 && queryWords.length > 0) {
      const matchedWords = queryWords.filter(word => lowerAbstract.includes(word));
      if (matchedWords.length >= queryWords.length / 2) {
        score = 15 + (matchedWords.length / queryWords.length) * 10;
        matchType = 'description';
      }
    }

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
