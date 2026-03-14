import { z } from 'zod';

/**
 * Wraps a Zod array schema to accept JSON-string-encoded arrays from MCP clients.
 * Some MCP clients serialize array parameters as JSON strings instead of native arrays.
 */
export function coerceArray<T extends z.ZodTypeAny>(schema: z.ZodArray<T, z.ArrayCardinality>) {
  return z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  }, schema);
}

/**
 * Boolean schema that accepts string "true"/"false" from MCP clients.
 * Unlike z.coerce.boolean(), this correctly handles "false" → false.
 */
export const coercedBoolean = () =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
    }
    return val;
  }, z.boolean());
