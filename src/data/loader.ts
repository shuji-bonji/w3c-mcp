/**
 * Data loader for web-specs and webref packages
 *
 * Performance improvements:
 * - Lazy loading with singleton pattern
 * - Promise-based caching to prevent duplicate loads
 * - Parallel loading support
 * - Memory-efficient data structures
 */

import { createRequire } from 'module';
import type { SpecDetail } from '../types/index.js';

const require = createRequire(import.meta.url);

// ============================================
// Singleton cache with Promise-based loading
// Prevents duplicate loads when multiple requests come in simultaneously
// ============================================

let specsPromise: Promise<SpecDetail[]> | null = null;
let idlPromise: Promise<Record<string, string>> | null = null;
let cssPromise: Promise<CSSData> | null = null;
let elementsPromise: Promise<Record<string, ElementSpecData>> | null = null;

// Shortname index for O(1) lookup
let specsIndex: Map<string, SpecDetail> | null = null;
let seriesIndex: Map<string, SpecDetail> | null = null;

/**
 * Load specs with singleton promise pattern
 * Multiple simultaneous calls share the same loading promise
 */
export async function loadSpecs(): Promise<SpecDetail[]> {
  if (!specsPromise) {
    specsPromise = Promise.resolve().then(() => {
      const specs = require('web-specs') as SpecDetail[];
      // Build indices for faster lookup
      buildSpecIndices(specs);
      return specs;
    });
  }
  return specsPromise;
}

/**
 * Build indices for O(1) spec lookup by shortname
 */
function buildSpecIndices(specs: SpecDetail[]): void {
  specsIndex = new Map();
  seriesIndex = new Map();

  for (const spec of specs) {
    specsIndex.set(spec.shortname, spec);
    if (spec.series?.shortname) {
      // Only set if not already set (prefer exact match)
      if (!seriesIndex.has(spec.series.shortname)) {
        seriesIndex.set(spec.series.shortname, spec);
      }
    }
  }
}

/**
 * Find a spec by shortname - O(1) with index
 */
export async function findSpec(shortname: string): Promise<SpecDetail | undefined> {
  await loadSpecs(); // Ensure indices are built

  // Try exact match first (O(1))
  if (specsIndex?.has(shortname)) {
    return specsIndex.get(shortname);
  }

  // Try series shortname (O(1))
  if (seriesIndex?.has(shortname)) {
    return seriesIndex.get(shortname);
  }

  // Fallback to partial match (O(n) - only when necessary)
  const specs = await loadSpecs();
  return specs.find(s =>
    s.shortname.includes(shortname) ||
    shortname.includes(s.shortname)
  );
}

/**
 * Load WebIDL with singleton promise pattern
 */
export async function loadWebIDLRaw(): Promise<Record<string, string>> {
  if (!idlPromise) {
    idlPromise = (async () => {
      try {
        const { readFileSync } = await import('fs');
        const webrefIdl = require('@webref/idl');
        const idlFiles = await webrefIdl.listAll();

        const result: Record<string, string> = {};
        for (const [shortname, file] of Object.entries(idlFiles)) {
          try {
            result[shortname] = readFileSync((file as any).path, 'utf8');
          } catch {
            // Skip files that can't be read
          }
        }
        return result;
      } catch (error) {
        console.error('Error loading raw WebIDL:', error);
        return {};
      }
    })();
  }
  return idlPromise;
}

// ============================================
// CSS Data Types
// ============================================

export interface CSSPropertyDef {
  name: string;
  href?: string;
  syntax?: string;
  initial?: string;
  inherited?: string;
  animationType?: string;
  values?: Array<{ name: string; href?: string; value?: string }>;
  styleDeclaration?: string[];
  [key: string]: unknown;
}

export interface CSSData {
  properties: CSSPropertyDef[];
  functions: Array<{ name: string; href?: string; value?: string }>;
  types: Array<{ name: string; href?: string; value?: string }>;
  selectors: Array<{ name: string; href?: string }>;
  atrules: Array<{ name: string; href?: string; value?: string }>;
}

/**
 * Load CSS data with singleton promise pattern
 */
export async function loadCSS(): Promise<CSSData> {
  if (!cssPromise) {
    cssPromise = (async () => {
      try {
        const webrefCss = require('@webref/css');
        const data: CSSData = await webrefCss.listAll();
        return data;
      } catch (error) {
        console.error('Error loading CSS data:', error);
        return { properties: [], functions: [], types: [], selectors: [], atrules: [] };
      }
    })();
  }
  return cssPromise;
}

// ============================================
// Elements Data Types
// ============================================

export interface ElementDef {
  name: string;
  href?: string;
  interface?: string;
  [key: string]: unknown;
}

export interface ElementSpecData {
  spec: {
    title: string;
    url: string;
  };
  elements: ElementDef[];
}

/**
 * Load elements data with singleton promise pattern
 */
export async function loadElements(): Promise<Record<string, ElementSpecData>> {
  if (!elementsPromise) {
    elementsPromise = (async () => {
      try {
        const webrefElements = require('@webref/elements');
        const data: Record<string, ElementSpecData> = await webrefElements.listAll();
        return data;
      } catch (error) {
        console.error('Error loading elements data:', error);
        return {};
      }
    })();
  }
  return elementsPromise;
}

// ============================================
// Preload function for warming up cache
// ============================================

/**
 * Preload all data in parallel
 * Call this at server startup for better first-request performance
 */
export async function preloadAll(): Promise<void> {
  await Promise.all([
    loadSpecs(),
    loadWebIDLRaw(),
    loadCSS(),
    loadElements()
  ]);
}

// ============================================
// Cache invalidation (for testing/development)
// ============================================

export function clearCache(): void {
  specsPromise = null;
  idlPromise = null;
  cssPromise = null;
  elementsPromise = null;
  specsIndex = null;
  seriesIndex = null;
}
