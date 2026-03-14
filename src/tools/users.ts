import { z } from 'zod';
import { createGitLabServices } from '../utils/auth.js';
import { coercedBoolean } from '../utils/zod.js';
import type { ToolDefinition } from '../types/index.js';

export const getCurrentUserTool: ToolDefinition = {
  name: 'gitlab_get_current_user',
  description: 'Get the currently authenticated GitLab user',
  parameters: z.object({}),
  handler: async () => {
    const { users } = createGitLabServices();
    const user = await users.getCurrentUser();
    return { content: [{ type: 'text', text: JSON.stringify(user, null, 2) }] };
  },
};

export const searchUsersTool: ToolDefinition = {
  name: 'gitlab_search_users',
  description: 'Search for GitLab users',
  parameters: z.object({
    search: z.string().optional().describe('Search query'),
    username: z.string().optional().describe('Filter by exact username'),
    active: z.boolean().optional().describe('Filter by active state'),
    blocked: z.boolean().optional().describe('Filter by blocked state'),
    order_by: z.enum(['id', 'name', 'username', 'created_at', 'updated_at']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.coerce.number().optional().describe('Page number (1-indexed)'),
    per_page: z.coerce.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { users } = createGitLabServices();
    const result = await users.searchUsers(params);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} users (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const getUserTool: ToolDefinition = {
  name: 'gitlab_get_user',
  description: 'Get details of a specific GitLab user by ID',
  parameters: z.object({
    user_id: z.coerce.number().describe('User ID'),
  }),
  handler: async (params) => {
    const { users } = createGitLabServices();
    const user = await users.getUser(params.user_id as number);
    return { content: [{ type: 'text', text: JSON.stringify(user, null, 2) }] };
  },
};

export const userTools: ToolDefinition[] = [getCurrentUserTool, searchUsersTool, getUserTool];
