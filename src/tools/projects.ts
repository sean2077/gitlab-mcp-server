import { z } from 'zod';
import { createGitLabServices } from '../utils/auth.js';
import type { ToolDefinition } from '../types/index.js';

export const listProjectsTool: ToolDefinition = {
  name: 'gitlab_list_projects',
  description: 'List GitLab projects accessible to the authenticated user',
  parameters: z.object({
    search: z.string().optional().describe('Search query'),
    owned: z.boolean().optional().describe('Filter to owned projects'),
    membership: z.boolean().optional().describe('Filter to member projects'),
    archived: z.boolean().optional().describe('Filter by archived status'),
    visibility: z.enum(['public', 'internal', 'private']).optional().describe('Filter by visibility'),
    order_by: z.enum(['id', 'name', 'path', 'created_at', 'updated_at', 'last_activity_at']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const result = await projects.listProjects(params);
    return {
      content: [
        { type: 'text', text: `Found ${result.total} projects (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const getProjectTool: ToolDefinition = {
  name: 'gitlab_get_project',
  description: 'Get detailed information about a specific GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path (e.g. "group/project")'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const project = await projects.getProject(params.project_id as string);
    return { content: [{ type: 'text', text: JSON.stringify(project, null, 2) }] };
  },
};

export const searchProjectsTool: ToolDefinition = {
  name: 'gitlab_search_projects',
  description: 'Search for GitLab projects by name',
  parameters: z.object({
    search: z.string().describe('Search query'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const result = await projects.searchProjects(params.search as string, {
      page: params.page as number | undefined,
      per_page: params.per_page as number | undefined,
    });
    return {
      content: [
        { type: 'text', text: `Found ${result.total} projects (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const listProjectMembersTool: ToolDefinition = {
  name: 'gitlab_list_project_members',
  description: 'List all members of a GitLab project (including inherited members)',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    query: z.string().optional().describe('Search members by name or username'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await projects.listProjectMembers(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total} members (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const listLabelsTool: ToolDefinition = {
  name: 'gitlab_list_labels',
  description: 'List labels for a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    search: z.string().optional().describe('Search labels by name'),
    include_ancestor_groups: z.boolean().optional().describe('Include labels from ancestor groups'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await projects.listLabels(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total} labels (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const createLabelTool: ToolDefinition = {
  name: 'gitlab_create_label',
  description: 'Create a new label in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    name: z.string().describe('Label name'),
    color: z.string().describe('Label color (hex code, e.g. "#FF0000")'),
    description: z.string().optional().describe('Label description'),
    priority: z.number().optional().describe('Label priority'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const { project_id, ...data } = params;
    const label = await projects.createLabel(
      project_id as string,
      data as Parameters<typeof projects.createLabel>[1],
    );
    return { content: [{ type: 'text', text: JSON.stringify(label, null, 2) }] };
  },
};

export const listMilestonesTool: ToolDefinition = {
  name: 'gitlab_list_milestones',
  description: 'List milestones for a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    state: z.enum(['active', 'closed']).optional().describe('Filter by state'),
    title: z.string().optional().describe('Filter by exact title'),
    search: z.string().optional().describe('Search milestones by title or description'),
    include_parent_milestones: z.boolean().optional().describe('Include milestones from parent groups'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await projects.listMilestones(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total} milestones (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const createMilestoneTool: ToolDefinition = {
  name: 'gitlab_create_milestone',
  description: 'Create a new milestone in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    title: z.string().describe('Milestone title'),
    description: z.string().optional().describe('Milestone description'),
    due_date: z.string().optional().describe('Due date (YYYY-MM-DD)'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const { project_id, ...data } = params;
    const milestone = await projects.createMilestone(
      project_id as string,
      data as Parameters<typeof projects.createMilestone>[1],
    );
    return { content: [{ type: 'text', text: JSON.stringify(milestone, null, 2) }] };
  },
};

export const updateProjectTool: ToolDefinition = {
  name: 'gitlab_update_project',
  description: "Update a GitLab project's settings",
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    name: z.string().optional().describe('New project name'),
    description: z.string().optional().describe('New description'),
    default_branch: z.string().optional().describe('Default branch name'),
    visibility: z.enum(['private', 'internal', 'public']).optional().describe('Visibility level'),
    issues_enabled: z.boolean().optional().describe('Enable issues'),
    merge_requests_enabled: z.boolean().optional().describe('Enable merge requests'),
    wiki_enabled: z.boolean().optional().describe('Enable wiki'),
    jobs_enabled: z.boolean().optional().describe('Enable CI/CD jobs'),
    archived: z.boolean().optional().describe('Archive/unarchive project'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const { project_id, ...data } = params;
    const project = await projects.updateProject(
      project_id as string,
      data as Parameters<typeof projects.updateProject>[1],
    );
    return { content: [{ type: 'text', text: JSON.stringify(project, null, 2) }] };
  },
};

export const createProjectTool: ToolDefinition = {
  name: 'gitlab_create_project',
  description: 'Create a new GitLab project',
  parameters: z.object({
    name: z.string().describe('Project name'),
    description: z.string().optional().describe('Project description'),
    visibility: z.enum(['private', 'internal', 'public']).optional().describe('Visibility level'),
    initialize_with_readme: z.boolean().optional().describe('Initialize with a README file'),
    namespace_id: z.number().optional().describe('Namespace/group ID to create project in'),
    default_branch: z.string().optional().describe('Default branch name'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const project = await projects.createProject(
      params as Parameters<typeof projects.createProject>[0],
    );
    return { content: [{ type: 'text', text: JSON.stringify(project, null, 2) }] };
  },
};

export const forkProjectTool: ToolDefinition = {
  name: 'gitlab_fork_project',
  description: 'Fork a GitLab project to your account or a specified namespace',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path to fork'),
    namespace: z.string().optional().describe('Namespace/group path to fork into'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const fork = await projects.forkProject(
      params.project_id as string,
      params.namespace as string | undefined,
    );
    return { content: [{ type: 'text', text: JSON.stringify(fork, null, 2) }] };
  },
};

export const getProjectEventsTool: ToolDefinition = {
  name: 'gitlab_get_project_events',
  description: 'Get recent events/activities for a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    action: z.string().optional().describe('Filter by action type (e.g. pushed, commented, merged)'),
    target_type: z.string().optional().describe('Filter by target type (e.g. issue, merge_request)'),
    before: z.string().optional().describe('Events before this date (ISO 8601)'),
    after: z.string().optional().describe('Events after this date (ISO 8601)'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await projects.getProjectEvents(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total} events (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const updateLabelTool: ToolDefinition = {
  name: 'gitlab_update_label',
  description: 'Update an existing label in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    label_id: z.number().describe('Label ID'),
    new_name: z.string().optional().describe('New label name'),
    color: z.string().optional().describe('New color (hex code)'),
    description: z.string().optional().describe('New description'),
    priority: z.number().nullable().optional().describe('New priority (null to remove)'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const { project_id, label_id, ...data } = params;
    const label = await projects.updateLabel(
      project_id as string,
      label_id as number,
      data as Parameters<typeof projects.updateLabel>[2],
    );
    return { content: [{ type: 'text', text: JSON.stringify(label, null, 2) }] };
  },
};

export const updateMilestoneTool: ToolDefinition = {
  name: 'gitlab_update_milestone',
  description: 'Update an existing milestone in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    milestone_id: z.number().describe('Milestone ID'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description'),
    due_date: z.string().nullable().optional().describe('Due date (YYYY-MM-DD, null to clear)'),
    start_date: z.string().nullable().optional().describe('Start date (YYYY-MM-DD, null to clear)'),
    state_event: z.enum(['close', 'activate']).optional().describe('State transition'),
  }),
  handler: async (params) => {
    const { projects } = createGitLabServices();
    const { project_id, milestone_id, ...data } = params;
    const milestone = await projects.updateMilestone(
      project_id as string,
      milestone_id as number,
      data as Parameters<typeof projects.updateMilestone>[2],
    );
    return { content: [{ type: 'text', text: JSON.stringify(milestone, null, 2) }] };
  },
};

export const projectTools: ToolDefinition[] = [
  listProjectsTool,
  getProjectTool,
  searchProjectsTool,
  listProjectMembersTool,
  listLabelsTool,
  createLabelTool,
  listMilestonesTool,
  createMilestoneTool,
  updateProjectTool,
  createProjectTool,
  forkProjectTool,
  getProjectEventsTool,
  updateLabelTool,
  updateMilestoneTool,
];
