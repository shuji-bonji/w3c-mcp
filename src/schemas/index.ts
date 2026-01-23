/**
 * Zod schemas for input validation
 */

import { z } from 'zod';

// List specs schema
export const ListSpecsSchema = z.object({
  organization: z.enum(['W3C', 'WHATWG', 'IETF', 'all']).optional(),
  keyword: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().min(1).max(500).optional().default(50)
});

export type ListSpecsInput = z.infer<typeof ListSpecsSchema>;

// Get spec schema
export const GetSpecSchema = z.object({
  shortname: z.string().min(1, 'shortname is required')
});

export type GetSpecInput = z.infer<typeof GetSpecSchema>;

// Search specs schema
export const SearchSpecsSchema = z.object({
  query: z.string().min(1, 'query is required'),
  limit: z.number().min(1).max(100).optional().default(20)
});

export type SearchSpecsInput = z.infer<typeof SearchSpecsSchema>;

// Get WebIDL schema
export const GetWebIDLSchema = z.object({
  shortname: z.string().min(1, 'shortname is required')
});

export type GetWebIDLInput = z.infer<typeof GetWebIDLSchema>;

// Get CSS properties schema
export const GetCSSPropertiesSchema = z.object({
  spec: z.string().optional(),
  property: z.string().optional()
});

export type GetCSSPropertiesInput = z.infer<typeof GetCSSPropertiesSchema>;

// Get elements schema
export const GetElementsSchema = z.object({
  spec: z.string().optional(),
  element: z.string().optional()
});

export type GetElementsInput = z.infer<typeof GetElementsSchema>;

// Get PWA specs schema
export const GetPwaSpecsSchema = z.object({
  coreOnly: z.boolean().optional().default(false)
});

export type GetPwaSpecsInput = z.infer<typeof GetPwaSpecsSchema>;

// Get spec dependencies schema
export const GetSpecDependenciesSchema = z.object({
  shortname: z.string().min(1, 'shortname is required')
});

export type GetSpecDependenciesInput = z.infer<typeof GetSpecDependenciesSchema>;

/**
 * Validate input against a schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
