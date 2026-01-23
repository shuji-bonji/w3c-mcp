/**
 * Data loader for web-specs and webref packages
 */

import { createRequire } from 'module';
import type { SpecDetail } from '../types/index.js';

const require = createRequire(import.meta.url);

// web-specs package provides a JSON array of all specs
let specsCache: SpecDetail[] | null = null;

export async function loadSpecs(): Promise<SpecDetail[]> {
  if (specsCache) {
    return specsCache;
  }

  // Use require for JSON module (web-specs exports index.json)
  specsCache = require('web-specs') as SpecDetail[];
  return specsCache;
}

// Cache for WebIDL data
let idlCache: Map<string, string> | null = null;

export async function loadWebIDL(): Promise<Map<string, string>> {
  if (idlCache) {
    return idlCache;
  }

  idlCache = new Map();

  try {
    // @webref/idl exports a function that returns parsed IDL
    const webrefIdl = await import('@webref/idl');
    const idlData = await webrefIdl.default.parseAll();

    for (const [shortname, parsed] of Object.entries(idlData)) {
      // parsed contains the IDL as a string or parsed object
      if (typeof parsed === 'string') {
        idlCache.set(shortname, parsed);
      } else if (parsed && typeof parsed === 'object') {
        // If it's parsed, we might need to get the raw IDL
        const rawIdl = await webrefIdl.default.listAll();
        if (rawIdl[shortname]) {
          idlCache.set(shortname, rawIdl[shortname]);
        }
      }
    }
  } catch (error) {
    console.error('Error loading WebIDL:', error);
  }

  return idlCache;
}

interface IDLFile {
  filename: string;
  shortname: string;
  path: string;
}

export async function loadWebIDLRaw(): Promise<Record<string, string>> {
  try {
    const { readFileSync } = await import('fs');
    const webrefIdl = require('@webref/idl');
    const idlFiles: Record<string, IDLFile> = await webrefIdl.listAll();

    const result: Record<string, string> = {};
    for (const [shortname, file] of Object.entries(idlFiles)) {
      try {
        result[shortname] = readFileSync(file.path, 'utf8');
      } catch {
        // Skip files that can't be read
      }
    }
    return result;
  } catch (error) {
    console.error('Error loading raw WebIDL:', error);
    return {};
  }
}

// Cache for CSS data
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

let cssCache: CSSData | null = null;

export async function loadCSS(): Promise<CSSData> {
  if (cssCache) {
    return cssCache;
  }

  try {
    const webrefCss = require('@webref/css');
    const data: CSSData = await webrefCss.listAll();
    cssCache = data;
    return data;
  } catch (error) {
    console.error('Error loading CSS data:', error);
    return { properties: [], functions: [], types: [], selectors: [], atrules: [] };
  }
}

// Cache for elements data
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

let elementsCache: Record<string, ElementSpecData> | null = null;

export async function loadElements(): Promise<Record<string, ElementSpecData>> {
  if (elementsCache) {
    return elementsCache;
  }

  try {
    const webrefElements = require('@webref/elements');
    const data: Record<string, ElementSpecData> = await webrefElements.listAll();
    elementsCache = data;
    return data;
  } catch (error) {
    console.error('Error loading elements data:', error);
    return {};
  }
}

/**
 * Find a spec by shortname
 */
export async function findSpec(shortname: string): Promise<SpecDetail | undefined> {
  const specs = await loadSpecs();

  // Try exact match first
  let spec = specs.find(s => s.shortname === shortname);

  if (!spec) {
    // Try series shortname match
    spec = specs.find(s => s.series?.shortname === shortname);
  }

  if (!spec) {
    // Try partial match
    spec = specs.find(s =>
      s.shortname.includes(shortname) ||
      shortname.includes(s.shortname)
    );
  }

  return spec;
}
