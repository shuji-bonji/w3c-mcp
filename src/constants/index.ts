/**
 * Constants for W3C MCP Server
 * Centralized configuration values to improve maintainability
 */

// ============================================
// Pagination & Limits
// ============================================

/** Default limit for listing specs */
export const DEFAULT_LIST_LIMIT = 50;

/** Maximum limit for listing specs */
export const MAX_LIST_LIMIT = 500;

/** Default limit for search results */
export const DEFAULT_SEARCH_LIMIT = 20;

/** Maximum limit for search results */
export const MAX_SEARCH_LIMIT = 100;

/** Maximum number of suggestions to show in error messages */
export const MAX_SUGGESTIONS = 5;

/** Maximum number of available specs to show in error messages */
export const MAX_AVAILABLE_SPECS_DISPLAY = 10;

// ============================================
// Search Scoring
// ============================================

export const SEARCH_SCORES = {
	/** Exact shortname match */
	EXACT_SHORTNAME: 100,
	/** Exact title match */
	EXACT_TITLE: 90,
	/** Shortname contains query */
	SHORTNAME_CONTAINS: 80,
	/** Query contains shortname */
	QUERY_CONTAINS_SHORTNAME: 70,
	/** Title contains query */
	TITLE_CONTAINS: 60,
	/** All query words match in title */
	ALL_WORDS_MATCH: 50,
	/** Some query words match - base score */
	PARTIAL_WORDS_BASE: 30,
	/** Partial words bonus multiplier */
	PARTIAL_WORDS_BONUS: 20,
	/** Abstract contains query */
	ABSTRACT_CONTAINS: 25,
	/** Abstract partial match - base score */
	ABSTRACT_PARTIAL_BASE: 15,
	/** Abstract partial bonus multiplier */
	ABSTRACT_PARTIAL_BONUS: 10,
} as const;

// ============================================
// String Matching
// ============================================

/** Minimum word length to include in search query splitting */
export const MIN_SEARCH_WORD_LENGTH = 2;

/** Minimum shortname length for reverse containment matching */
export const MIN_SHORTNAME_LENGTH_FOR_REVERSE_MATCH = 3;

/** Minimum ratio of words that must match for abstract partial matching */
export const MIN_ABSTRACT_WORD_MATCH_RATIO = 0.5;

// ============================================
// URL Patterns
// ============================================

/** Pattern to extract spec name from CSS Working Group URLs */
export const CSSWG_URL_PATTERN = /csswg\.org\/([^/]+)/;

/** Default spec name when unable to extract from URL */
export const UNKNOWN_SPEC = 'unknown';

// ============================================
// PWA Specifications
// ============================================

/** PWA-related specification shortnames */
export const PWA_SHORTNAMES = [
	'service-workers',
	'appmanifest',
	'push-api',
	'notifications',
	'background-fetch',
	'background-sync',
	'periodic-background-sync',
	'badging',
	'web-share',
	'web-share-target',
	'getinstalledrelatedapps',
	'payment-handler',
	'content-index',
	'window-controls-overlay',
	'file-handling',
	'file-system-access',
	'web-app-launch',
	'protocol-handler',
	'shortcuts',
	'scope-extensions',
] as const;

/** Core PWA specification shortnames */
export const CORE_PWA_SHORTNAMES = [
	'service-workers',
	'appmanifest',
	'push-api',
	'notifications',
] as const;

/** Keywords that might identify PWA-related specs */
export const PWA_KEYWORDS = [
	'manifest',
	'service worker',
	'offline',
	'install',
	'background',
	'push',
	'notification',
	'cache',
	'storage',
] as const;
