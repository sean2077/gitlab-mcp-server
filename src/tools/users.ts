import { z } from 'zod';
import { createGitLabServices } from '../utils/auth.js';
import { coercedBoolean, pageParam, perPageParam } from '../utils/zod.js';
import { jsonResult, paginatedResult } from '../utils/response.js';
import type { ToolDefinition } from '../types/index.js';

export const getCurrentUserTool: ToolDefinition = {
  name: 'gitlab_get_current_user',
  description: 'Get the currently authenticated GitLab user',
  parameters: z.object({}),
  handler: async () => {
    const { users } = createGitLabServices();
    const user = await users.getCurrentUser();
    return jsonResult(user);
  },
};

export const searchUsersTool: ToolDefinition = {
  name: 'gitlab_search_users',
  description: 'Search for GitLab users',
  parameters: z.object({
    search: z.string().optional().describe('Search query'),
    username: z.string().optional().describe('Filter by exact username'),
    active: coercedBoolean().optional().describe('Filter by active state'),
    blocked: coercedBoolean().optional().describe('Filter by blocked state'),
    order_by: z.enum(['id', 'name', 'username', 'created_at', 'updated_at']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: pageParam(),
    per_page: perPageParam(),
  }),
  handler: async (params) => {
    const { users } = createGitLabServices();
    const result = await users.searchUsers(params);
    return paginatedResult('users', result);
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
    return jsonResult(user);
  },
};

export const userTools: ToolDefinition[] = [getCurrentUserTool, searchUsersTool, getUserTool];
