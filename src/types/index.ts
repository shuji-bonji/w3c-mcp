/**
 * Type definitions for W3C MCP Server
 */

export interface SpecSummary {
	shortname: string;
	title: string;
	url: string;
	nightlyUrl?: string;
	organization?: string;
	status?: string;
	categories?: string[];
}

export interface SpecDetail extends SpecSummary {
	abstract?: string;
	repository?: string;
	tests?: {
		repository?: string;
		testPaths?: string[];
	};
	release?: {
		url: string;
		status?: string;
	};
	nightly?: {
		url: string;
		status?: string;
	};
	series?: {
		shortname: string;
		currentSpecification?: string;
	};
	source?: string;
	standing?: string;
}

export interface SpecSearchResult extends SpecSummary {
	matchType: 'title' | 'shortname' | 'description';
	score: number;
}

export interface CSSProperty {
	name: string;
	value?: string;
	initial?: string;
	appliesTo?: string;
	inherited?: string;
	percentages?: string;
	computedValue?: string;
	animationType?: string;
	spec: string;
}

export interface CSSValue {
	name: string;
	value?: string;
	type?: string;
	spec: string;
}

export interface ElementDefinition {
	name: string;
	interface?: string;
	categories?: string[];
	contentModel?: string;
	attributes?: AttributeDefinition[];
	spec: string;
}

export interface AttributeDefinition {
	name: string;
	type?: string;
	description?: string;
}

export interface DependencyInfo {
	shortname: string;
	title: string;
	dependencies: string[];
	dependents: string[];
}

export interface ListSpecsOptions {
	organization?: 'W3C' | 'WHATWG' | 'IETF' | 'all';
	keyword?: string;
	category?: string;
	limit?: number;
}

export interface WebIDLResult {
	shortname: string;
	idl: string;
}
