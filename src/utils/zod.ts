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
