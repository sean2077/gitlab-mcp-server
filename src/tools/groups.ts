import { z } from 'zod';
import { createGitLabServices } from '../utils/auth.js';
import type { ToolDefinition } from '../types/index.js';

export const listGroupsTool: ToolDefinition = {
  name: 'gitlab_list_groups',
  description: 'List GitLab groups accessible to the authenticated user',
  parameters: z.object({
    search: z.string().optional().describe('Search groups by name'),
    owned: z.boolean().optional().describe('Filter to owned groups'),
    min_access_level: z.number().optional().describe('Minimum access level (10=Guest, 20=Reporter, 30=Developer, 40=Maintainer, 50=Owner)'),
    top_level_only: z.boolean().optional().describe('Only top-level groups'),
    order_by: z.enum(['name', 'path', 'id']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { groups } = createGitLabServices();
    const result = await groups.listGroups(params);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} groups (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const getGroupTool: ToolDefinition = {
  name: 'gitlab_get_group',
  description: 'Get details of a specific GitLab group',
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
  }),
  handler: async (params) => {
    const { groups } = createGitLabServices();
    const group = await groups.getGroup(params.group_id as string);
    return { content: [{ type: 'text', text: JSON.stringify(group, null, 2) }] };
  },
};

export const listGroupProjectsTool: ToolDefinition = {
  name: 'gitlab_list_group_projects',
  description: 'List all projects within a specific GitLab group',
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
    search: z.string().optional().describe('Search projects by name'),
    archived: z.boolean().optional().describe('Filter by archived status'),
    visibility: z.enum(['public', 'internal', 'private']).optional().describe('Filter by visibility'),
    order_by: z.enum(['id', 'name', 'path', 'created_at', 'updated_at', 'last_activity_at']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    include_subgroups: z.boolean().optional().describe('Include projects from subgroups'),
    simple: z.boolean().optional().default(true).describe('Return only limited fields. Set to false for full details'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { groups } = createGitLabServices();
    const { group_id, ...options } = params;
    const result = await groups.listGroupProjects(group_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} projects (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const listGroupMembersTool: ToolDefinition = {
  name: 'gitlab_list_group_members',
  description: 'List all members of a GitLab group (including inherited members)',
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
    query: z.string().optional().describe('Search members by name or username'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { groups } = createGitLabServices();
    const { group_id, ...options } = params;
    const result = await groups.listGroupMembers(group_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} members (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const listGroupSubgroupsTool: ToolDefinition = {
  name: 'gitlab_list_group_subgroups',
  description: 'List subgroups of a GitLab group',
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
    search: z.string().optional().describe('Search subgroups by name'),
    owned: z.boolean().optional().describe('Filter to owned groups'),
    min_access_level: z.number().optional().describe('Minimum access level'),
    order_by: z.enum(['name', 'path', 'id']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { groups } = createGitLabServices();
    const { group_id, ...options } = params;
    const result = await groups.listGroupSubgroups(group_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} subgroups (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const createGroupTool: ToolDefinition = {
  name: 'gitlab_create_group',
  description: 'Create a new GitLab group',
  parameters: z.object({
    name: z.string().describe('Group name'),
    path: z.string().describe('Group URL path'),
    description: z.string().optional().describe('Group description'),
    visibility: z.enum(['private', 'internal', 'public']).optional().describe('Visibility level'),
    parent_id: z.number().optional().describe('Parent group ID (for creating subgroups)'),
    project_creation_level: z.enum(['noone', 'maintainer', 'developer']).optional().describe('Who can create projects'),
    subgroup_creation_level: z.enum(['owner', 'maintainer']).optional().describe('Who can create subgroups'),
  }),
  handler: async (params) => {
    const { groups } = createGitLabServices();
    const group = await groups.createGroup(
      params as Parameters<typeof groups.createGroup>[0],
    );
    return { content: [{ type: 'text', text: JSON.stringify(group, null, 2) }] };
  },
};

export const updateGroupTool: ToolDefinition = {
  name: 'gitlab_update_group',
  description: "Update a GitLab group's settings",
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
    name: z.string().optional().describe('New group name'),
    path: z.string().optional().describe('New group path'),
    description: z.string().optional().describe('New description'),
    visibility: z.enum(['private', 'internal', 'public']).optional().describe('Visibility level'),
    project_creation_level: z.enum(['noone', 'maintainer', 'developer']).optional().describe('Who can create projects'),
    subgroup_creation_level: z.enum(['owner', 'maintainer']).optional().describe('Who can create subgroups'),
  }),
  handler: async (params) => {
    const { groups } = createGitLabServices();
    const { group_id, ...data } = params;
    const group = await groups.updateGroup(
      group_id as string,
      data as Parameters<typeof groups.updateGroup>[1],
    );
    return { content: [{ type: 'text', text: JSON.stringify(group, null, 2) }] };
  },
};

export const deleteGroupTool: ToolDefinition = {
  name: 'gitlab_delete_group',
  description: 'Delete a GitLab group (cascading deletion of all subgroups and projects)',
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
  }),
  handler: async (params) => {
    const { groups } = createGitLabServices();
    await groups.deleteGroup(params.group_id as string);
    return { content: [{ type: 'text', text: `Group "${params.group_id}" scheduled for deletion` }] };
  },
};

export const groupTools: ToolDefinition[] = [
  listGroupsTool,
  getGroupTool,
  listGroupProjectsTool,
  listGroupMembersTool,
  listGroupSubgroupsTool,
  createGroupTool,
  updateGroupTool,
  deleteGroupTool,
];
