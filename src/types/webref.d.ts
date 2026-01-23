/**
 * Type declarations for @webref packages
 */

declare module '@webref/idl' {
  interface IDLModule {
    parseAll(): Promise<Record<string, unknown>>;
    listAll(): Promise<Record<string, string>>;
  }

  const idl: IDLModule;
  export default idl;
}

declare module '@webref/css' {
  interface CSSSpec {
    properties?: Record<string, CSSProperty>;
    values?: Record<string, CSSValue>;
    atrules?: Record<string, unknown>;
    selectors?: Record<string, unknown>;
  }

  interface CSSProperty {
    name: string;
    value?: string;
    initial?: string;
    appliesTo?: string;
    inherited?: string;
    percentages?: string;
    computedValue?: string;
    animationType?: string;
    [key: string]: unknown;
  }

  interface CSSValue {
    name: string;
    value?: string;
    type?: string;
    [key: string]: unknown;
  }

  interface CSSModule {
    listAll(): Promise<Record<string, CSSSpec>>;
  }

  const css: CSSModule;
  export default css;
}

declare module '@webref/elements' {
  interface ElementSpec {
    elements?: Record<string, ElementDefinition>;
  }

  interface ElementDefinition {
    interface?: string;
    categories?: string[];
    contentModel?: string;
    attributes?: Record<string, AttributeDefinition>;
    [key: string]: unknown;
  }

  interface AttributeDefinition {
    type?: string;
    description?: string;
  }

  interface ElementsModule {
    listAll(): Promise<Record<string, ElementSpec>>;
  }

  const elements: ElementsModule;
  export default elements;
}

declare module 'web-specs' {
  interface Spec {
    shortname: string;
    title: string;
    url: string;
    abstract?: string;
    repository?: string;
    organization?: string;
    categories?: string[];
    standing?: string;
    source?: string;
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
    tests?: {
      repository?: string;
      testPaths?: string[];
    };
    [key: string]: unknown;
  }

  const specs: Spec[];
  export default specs;
}
