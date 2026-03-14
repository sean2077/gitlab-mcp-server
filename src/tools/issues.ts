import { z } from 'zod';
import { createGitLabServices } from '../utils/auth.js';
import type { ToolDefinition } from '../types/index.js';

export const listIssuesTool: ToolDefinition = {
  name: 'gitlab_list_issues',
  description: 'List issues for a GitLab project with filtering options',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    state: z.enum(['opened', 'closed', 'all']).optional().describe('Filter by state'),
    labels: z.string().optional().describe('Comma-separated label names'),
    milestone: z.string().optional().describe('Milestone title'),
    scope: z.enum(['created_by_me', 'assigned_to_me', 'all']).optional().describe('Filter scope'),
    assignee_id: z.number().optional().describe('Assignee user ID'),
    author_id: z.number().optional().describe('Author user ID'),
    search: z.string().optional().describe('Search in title and description'),
    order_by: z.enum(['created_at', 'updated_at', 'priority', 'due_date', 'label_priority']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { issues } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await issues.listIssues(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} issues (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const getIssueTool: ToolDefinition = {
  name: 'gitlab_get_issue',
  description: 'Get a specific issue from a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    issue_iid: z.number().describe('Issue internal ID'),
  }),
  handler: async (params) => {
    const { issues } = createGitLabServices();
    const issue = await issues.getIssue(params.project_id as string, params.issue_iid as number);
    return { content: [{ type: 'text', text: JSON.stringify(issue, null, 2) }] };
  },
};

export const createIssueTool: ToolDefinition = {
  name: 'gitlab_create_issue',
  description: 'Create a new issue in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    title: z.string().describe('Issue title'),
    description: z.string().optional().describe('Issue description (Markdown)'),
    assignee_ids: z.array(z.number()).optional().describe('Assignee user IDs'),
    milestone_id: z.number().optional().describe('Milestone ID'),
    labels: z.array(z.string()).optional().describe('Label names'),
    due_date: z.string().optional().describe('Due date (YYYY-MM-DD)'),
    confidential: z.boolean().optional().describe('Mark as confidential'),
  }),
  handler: async (params) => {
    const { issues } = createGitLabServices();
    const { project_id, ...data } = params;
    const issue = await issues.createIssue(project_id as string, data as Parameters<typeof issues.createIssue>[1]);
    return { content: [{ type: 'text', text: JSON.stringify(issue, null, 2) }] };
  },
};

export const updateIssueTool: ToolDefinition = {
  name: 'gitlab_update_issue',
  description: 'Update an existing issue in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    issue_iid: z.number().describe('Issue internal ID'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description'),
    assignee_ids: z.array(z.number()).optional().describe('Assignee user IDs'),
    milestone_id: z.number().nullable().optional().describe('Milestone ID'),
    labels: z.array(z.string()).optional().describe('Label names'),
    state_event: z.enum(['close', 'reopen']).optional().describe('State transition'),
    due_date: z.string().nullable().optional().describe('Due date (YYYY-MM-DD)'),
    confidential: z.boolean().optional().describe('Mark as confidential'),
  }),
  handler: async (params) => {
    const { issues } = createGitLabServices();
    const { project_id, issue_iid, ...data } = params;
    const issue = await issues.updateIssue(
      project_id as string,
      issue_iid as number,
      data as Parameters<typeof issues.updateIssue>[2],
    );
    return { content: [{ type: 'text', text: JSON.stringify(issue, null, 2) }] };
  },
};

export const listIssueNotesTool: ToolDefinition = {
  name: 'gitlab_list_issue_notes',
  description: 'List comments/notes on a GitLab issue',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    issue_iid: z.number().describe('Issue internal ID'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    order_by: z.enum(['created_at', 'updated_at']).optional().describe('Order by field'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { issues } = createGitLabServices();
    const { project_id, issue_iid, ...options } = params;
    const result = await issues.listIssueNotes(project_id as string, issue_iid as number, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} notes (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const createIssueNoteTool: ToolDefinition = {
  name: 'gitlab_create_issue_note',
  description: 'Add a comment/note to a GitLab issue',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    issue_iid: z.number().describe('Issue internal ID'),
    body: z.string().describe('Note content (Markdown)'),
    internal: z.boolean().optional().describe('Create as internal note'),
  }),
  handler: async (params) => {
    const { issues } = createGitLabServices();
    const note = await issues.createIssueNote(
      params.project_id as string,
      params.issue_iid as number,
      params.body as string,
      params.internal as boolean | undefined,
    );
    return { content: [{ type: 'text', text: JSON.stringify(note, null, 2) }] };
  },
};

export const listIssueDiscussionsTool: ToolDefinition = {
  name: 'gitlab_list_issue_discussions',
  description: 'List all discussions (threaded comments) on a GitLab issue',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    issue_iid: z.number().describe('Issue internal ID'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { issues } = createGitLabServices();
    const { project_id, issue_iid, ...options } = params;
    const result = await issues.listIssueDiscussions(project_id as string, issue_iid as number, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} discussions (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const issueTools: ToolDefinition[] = [
  listIssuesTool,
  getIssueTool,
  createIssueTool,
  updateIssueTool,
  listIssueNotesTool,
  createIssueNoteTool,
  listIssueDiscussionsTool,
];
