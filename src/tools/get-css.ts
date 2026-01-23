/**
 * Get CSS property and value definitions
 */

import { loadCSS, type CSSPropertyDef } from '../data/loader.js';
import type { CSSProperty, CSSValue } from '../types/index.js';

/**
 * Extract spec shortname from href URL
 */
function extractSpecFromHref(href?: string): string {
  if (!href) return 'unknown';
  // Extract spec name from URLs like https://drafts.csswg.org/css-grid-2/#propdef-grid
  const match = href.match(/csswg\.org\/([^\/]+)/);
  return match ? match[1] : 'unknown';
}

export async function getCSSProperties(specShortname?: string): Promise<CSSProperty[]> {
  const cssData = await loadCSS();
  let properties: CSSProperty[] = [];

  for (const prop of cssData.properties) {
    const spec = extractSpecFromHref(prop.href);

    // Filter by spec shortname if provided
    if (specShortname && !spec.includes(specShortname)) {
      continue;
    }

    properties.push({
      name: prop.name,
      value: prop.syntax,
      initial: prop.initial,
      inherited: prop.inherited,
      animationType: prop.animationType,
      spec
    });
  }

  // Sort by property name
  properties.sort((a, b) => a.name.localeCompare(b.name));

  return properties;
}

export async function getCSSValues(specShortname?: string): Promise<CSSValue[]> {
  const cssData = await loadCSS();
  const values: CSSValue[] = [];

  // Combine types and functions as "values"
  for (const item of [...cssData.types, ...cssData.functions]) {
    const spec = extractSpecFromHref(item.href);

    if (specShortname && !spec.includes(specShortname)) {
      continue;
    }

    values.push({
      name: item.name,
      value: item.value,
      spec
    });
  }

  values.sort((a, b) => a.name.localeCompare(b.name));

  return values;
}

/**
 * Search for a specific CSS property by name
 */
export async function searchCSSProperty(propertyName: string): Promise<CSSProperty[]> {
  const allProperties = await getCSSProperties();
  const lowerName = propertyName.toLowerCase();

  return allProperties.filter(prop =>
    prop.name.toLowerCase() === lowerName ||
    prop.name.toLowerCase().includes(lowerName)
  );
}

/**
 * Get CSS at-rules
 */
export async function getCSSAtRules(): Promise<Array<{ name: string; value?: string; spec: string }>> {
  const cssData = await loadCSS();

  return cssData.atrules.map(rule => ({
    name: rule.name,
    value: rule.value,
    spec: extractSpecFromHref(rule.href)
  }));
}

/**
 * Get CSS selectors
 */
export async function getCSSSelectors(): Promise<Array<{ name: string; spec: string }>> {
  const cssData = await loadCSS();

  return cssData.selectors.map(sel => ({
    name: sel.name,
    spec: extractSpecFromHref(sel.href)
  }));
}

/**
 * List all CSS specs available (extracted from property hrefs)
 */
export async function listCSSSpecs(): Promise<string[]> {
  const cssData = await loadCSS();
  const specs = new Set<string>();

  for (const prop of cssData.properties) {
    const spec = extractSpecFromHref(prop.href);
    if (spec !== 'unknown') {
      specs.add(spec);
    }
  }

  return Array.from(specs).sort();
}
