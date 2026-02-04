/**
 * Custom error classes for W3C MCP Server
 */

import type { z } from 'zod';
import { MAX_AVAILABLE_SPECS_DISPLAY } from '../constants/index.js';

/**
 * Base class for W3C MCP errors
 */
export class W3CMCPError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'W3CMCPError';
	}
}

/**
 * Spec not found error with suggestions
 */
export class SpecNotFoundError extends W3CMCPError {
	public suggestions?: string[];

	constructor(shortname: string, suggestions?: string[]) {
		const message = suggestions?.length
			? `Specification "${shortname}" not found. Did you mean: ${suggestions.join(', ')}?`
			: `Specification "${shortname}" not found.`;
		super(message);
		this.name = 'SpecNotFoundError';
		this.suggestions = suggestions;
	}
}

/**
 * WebIDL not found error (also used for multiple matches)
 */
export class WebIDLNotFoundError extends W3CMCPError {
	public suggestions?: string[];

	constructor(shortname: string, suggestions?: string[], multipleMatch?: boolean) {
		let message: string;
		if (multipleMatch && suggestions?.length) {
			message = `Multiple WebIDL matches found for "${shortname}": ${suggestions.join(', ')}. Please specify the exact shortname.`;
		} else if (suggestions?.length) {
			message = `WebIDL not found for "${shortname}". Specs with WebIDL that might match: ${suggestions.join(', ')}`;
		} else {
			message = `WebIDL not found for "${shortname}". This specification might not have WebIDL definitions.`;
		}
		super(message);
		this.name = 'WebIDLNotFoundError';
		this.suggestions = suggestions;
	}
}

/**
 * CSS data not found error
 */
export class CSSNotFoundError extends W3CMCPError {
	constructor(spec: string, availableSpecs?: string[]) {
		const displaySpecs = availableSpecs?.slice(0, MAX_AVAILABLE_SPECS_DISPLAY);
		const message = displaySpecs?.length
			? `CSS data not found for "${spec}". Available CSS specs: ${displaySpecs.join(', ')}...`
			: `CSS data not found for "${spec}".`;
		super(message);
		this.name = 'CSSNotFoundError';
	}
}

/**
 * Elements data not found error
 */
export class ElementsNotFoundError extends W3CMCPError {
	constructor(spec: string, availableSpecs?: string[]) {
		const displaySpecs = availableSpecs?.slice(0, MAX_AVAILABLE_SPECS_DISPLAY);
		const hasMore = availableSpecs && availableSpecs.length > MAX_AVAILABLE_SPECS_DISPLAY;
		const message = displaySpecs?.length
			? `Elements data not found for "${spec}". Available specs: ${displaySpecs.join(', ')}${hasMore ? '...' : ''}`
			: `Elements data not found for "${spec}".`;
		super(message);
		this.name = 'ElementsNotFoundError';
	}
}

/**
 * Validation error wrapper
 */
export class ValidationError extends W3CMCPError {
	public zodError: z.ZodError;

	constructor(zodError: z.ZodError) {
		const issues = zodError.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
		super(`Validation error: ${issues}`);
		this.name = 'ValidationError';
		this.zodError = zodError;
	}
}

/**
 * Structured error response for MCP protocol
 */
export interface ErrorResponse {
	/** JSON-formatted error text */
	text: string;
	/** Error type identifier */
	errorType: string;
}

/**
 * Helper to create formatted JSON error response
 */
function toJsonResponse(errorType: string, payload: Record<string, unknown>): ErrorResponse {
	return {
		text: JSON.stringify(payload, null, 2),
		errorType,
	};
}

/**
 * Format error response for MCP
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
	if (error instanceof ValidationError) {
		return toJsonResponse('ValidationError', {
			error: 'ValidationError',
			message: error.message,
			issues: error.zodError.issues,
		});
	}

	if (error instanceof SpecNotFoundError) {
		return toJsonResponse('SpecNotFoundError', {
			error: 'SpecNotFoundError',
			message: error.message,
			suggestions: error.suggestions,
		});
	}

	if (error instanceof WebIDLNotFoundError) {
		return toJsonResponse('WebIDLNotFoundError', {
			error: 'WebIDLNotFoundError',
			message: error.message,
			suggestions: error.suggestions,
		});
	}

	if (error instanceof W3CMCPError) {
		return toJsonResponse(error.name, {
			error: error.name,
			message: error.message,
		});
	}

	if (error instanceof Error) {
		return {
			text: `Error: ${error.message}`,
			errorType: 'Error',
		};
	}

	return {
		text: 'An unknown error occurred',
		errorType: 'UnknownError',
	};
}
