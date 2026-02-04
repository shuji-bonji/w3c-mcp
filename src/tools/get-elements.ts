/**
 * Get HTML element definitions
 */

import { loadElements } from '../data/loader.js';
import { ElementsNotFoundError } from '../errors/index.js';
import type { ElementDefinition } from '../types/index.js';
import { filterByName, normalizeElementName } from '../utils/search.js';

export async function getElements(specShortname?: string): Promise<ElementDefinition[]> {
	const elementsData = await loadElements();
	const elements: ElementDefinition[] = [];

	if (specShortname) {
		// Get elements for a specific spec
		const specData = elementsData[specShortname];

		if (!specData) {
			const availableSpecs = Object.keys(elementsData);
			throw new ElementsNotFoundError(specShortname, availableSpecs);
		}

		for (const elem of specData.elements) {
			elements.push({
				name: elem.name,
				interface: elem.interface,
				spec: specShortname,
			});
		}
	} else {
		// Get all elements from all specs
		for (const [spec, data] of Object.entries(elementsData)) {
			for (const elem of data.elements) {
				elements.push({
					name: elem.name,
					interface: elem.interface,
					spec,
				});
			}
		}
	}

	// Sort by element name
	elements.sort((a, b) => a.name.localeCompare(b.name));

	return elements;
}

/**
 * Search for a specific HTML element by name
 */
export async function searchElement(elementName: string): Promise<ElementDefinition[]> {
	const allElements = await getElements();
	const normalizedName = normalizeElementName(elementName);
	return filterByName(allElements, normalizedName);
}

/**
 * List all specs that have element definitions
 */
export async function listElementSpecs(): Promise<string[]> {
	const elementsData = await loadElements();
	return Object.keys(elementsData).sort();
}
