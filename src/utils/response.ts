import type { PaginatedResponse } from '../types/index.js';

export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/** A single block of plain text. */
export function textResult(text: string): ToolResult {
  return { content: [{ type: 'text', text }] };
}

/** Pretty-printed JSON of a single object/value. */
export function jsonResult(data: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

/**
 * Standard two-block result for paginated list tools: a human-readable summary
 * line followed by the JSON array of items. `label` is the plural noun for the
 * items (e.g. "projects", "merge requests").
 */
export function paginatedResult<T>(label: string, result: PaginatedResponse<T>): ToolResult {
  const count = result.total >= 0 ? result.total : result.items.length;
  return {
    content: [
      { type: 'text', text: `Found ${count} ${label} (page ${result.page}/${result.totalPages})` },
      { type: 'text', text: JSON.stringify(result.items, null, 2) },
    ],
  };
}
