/**
 * Custom error classes for W3C MCP Server
 */

import type { z } from 'zod';

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
 * WebIDL not found error
 */
export class WebIDLNotFoundError extends W3CMCPError {
	public suggestions?: string[];

	constructor(shortname: string, suggestions?: string[]) {
		const message = suggestions?.length
			? `WebIDL not found for "${shortname}". Specs with WebIDL that might match: ${suggestions.join(', ')}`
			: `WebIDL not found for "${shortname}". This specification might not have WebIDL definitions.`;
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
		const message = availableSpecs?.length
			? `CSS data not found for "${spec}". Available CSS specs: ${availableSpecs.slice(0, 10).join(', ')}...`
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
		const message = availableSpecs?.length
			? `Elements data not found for "${spec}". Available specs: ${availableSpecs.slice(0, 10).join(', ')}${availableSpecs.length > 10 ? '...' : ''}`
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
 * Format error response for MCP
 */
export function formatErrorResponse(error: unknown): { text: string; errorType: string } {
	if (error instanceof ValidationError) {
		return {
			text: JSON.stringify(
				{
					error: 'ValidationError',
					message: error.message,
					issues: error.zodError.issues,
				},
				null,
				2,
			),
			errorType: 'ValidationError',
		};
	}

	if (error instanceof SpecNotFoundError) {
		return {
			text: JSON.stringify(
				{
					error: 'SpecNotFoundError',
					message: error.message,
					suggestions: error.suggestions,
				},
				null,
				2,
			),
			errorType: 'SpecNotFoundError',
		};
	}

	if (error instanceof W3CMCPError) {
		return {
			text: JSON.stringify(
				{
					error: error.name,
					message: error.message,
				},
				null,
				2,
			),
			errorType: error.name,
		};
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
