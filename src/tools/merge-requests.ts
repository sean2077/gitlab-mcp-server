import { z } from 'zod';
import { createGitLabServices } from '../utils/auth.js';
import type { ToolDefinition } from '../types/index.js';

export const listMergeRequestsTool: ToolDefinition = {
  name: 'gitlab_list_merge_requests',
  description: 'List merge requests for a GitLab project with filtering options',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    state: z.enum(['opened', 'closed', 'merged', 'all']).optional().describe('Filter by state'),
    scope: z.enum(['created_by_me', 'assigned_to_me', 'all']).optional().describe('Filter scope'),
    assignee_id: z.number().optional().describe('Assignee user ID'),
    author_id: z.number().optional().describe('Author user ID'),
    reviewer_id: z.number().optional().describe('Reviewer user ID'),
    labels: z.string().optional().describe('Comma-separated label names'),
    milestone: z.string().optional().describe('Milestone title'),
    search: z.string().optional().describe('Search in title and description'),
    source_branch: z.string().optional().describe('Filter by source branch'),
    target_branch: z.string().optional().describe('Filter by target branch'),
    order_by: z.enum(['created_at', 'updated_at']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await mergeRequests.listMergeRequests(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : 'unknown'} merge requests (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const getMergeRequestTool: ToolDefinition = {
  name: 'gitlab_get_merge_request',
  description: 'Get a specific merge request from a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const mr = await mergeRequests.getMergeRequest(params.project_id as string, params.merge_request_iid as number);
    return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
  },
};

export const createMergeRequestTool: ToolDefinition = {
  name: 'gitlab_create_merge_request',
  description: 'Create a new merge request in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    title: z.string().describe('MR title'),
    description: z.string().optional().describe('MR description (Markdown)'),
    source_branch: z.string().describe('Source branch name'),
    target_branch: z.string().describe('Target branch name'),
    assignee_ids: z.array(z.number()).optional().describe('Assignee user IDs'),
    reviewer_ids: z.array(z.number()).optional().describe('Reviewer user IDs'),
    labels: z.array(z.string()).optional().describe('Label names'),
    milestone_id: z.number().optional().describe('Milestone ID'),
    remove_source_branch: z.boolean().optional().describe('Remove source branch after merge'),
    squash: z.boolean().optional().describe('Squash commits on merge'),
    draft: z.boolean().optional().describe('Mark as draft'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const { project_id, ...data } = params;
    const mr = await mergeRequests.createMergeRequest(
      project_id as string,
      data as Parameters<typeof mergeRequests.createMergeRequest>[1],
    );
    return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
  },
};

export const updateMergeRequestTool: ToolDefinition = {
  name: 'gitlab_update_merge_request',
  description: 'Update an existing merge request in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description'),
    target_branch: z.string().optional().describe('New target branch'),
    assignee_ids: z.array(z.number()).optional().describe('Assignee user IDs'),
    reviewer_ids: z.array(z.number()).optional().describe('Reviewer user IDs'),
    labels: z.array(z.string()).optional().describe('Label names'),
    milestone_id: z.number().nullable().optional().describe('Milestone ID'),
    state_event: z.enum(['close', 'reopen']).optional().describe('State transition'),
    remove_source_branch: z.boolean().optional().describe('Remove source branch after merge'),
    squash: z.boolean().optional().describe('Squash commits on merge'),
    draft: z.boolean().optional().describe('Mark as draft'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const { project_id, merge_request_iid, ...data } = params;
    const mr = await mergeRequests.updateMergeRequest(
      project_id as string,
      merge_request_iid as number,
      data as Parameters<typeof mergeRequests.updateMergeRequest>[2],
    );
    return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
  },
};

export const mergeMergeRequestTool: ToolDefinition = {
  name: 'gitlab_merge_merge_request',
  description: 'Merge a merge request',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    merge_commit_message: z.string().optional().describe('Custom merge commit message'),
    squash_commit_message: z.string().optional().describe('Custom squash commit message'),
    squash: z.boolean().optional().describe('Squash commits'),
    should_remove_source_branch: z.boolean().optional().describe('Remove source branch'),
    sha: z.string().optional().describe('Expected HEAD SHA of the MR'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const { project_id, merge_request_iid, ...options } = params;
    const mr = await mergeRequests.mergeMergeRequest(
      project_id as string,
      merge_request_iid as number,
      options,
    );
    return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
  },
};

export const getMergeRequestDiffsTool: ToolDefinition = {
  name: 'gitlab_get_merge_request_diffs',
  description: 'Get the diffs/changes of a merge request',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const { project_id, merge_request_iid, ...options } = params;
    const result = await mergeRequests.getMergeRequestDiffs(
      project_id as string,
      merge_request_iid as number,
      options,
    );
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : 'unknown'} diffs (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const listMRNotesTool: ToolDefinition = {
  name: 'gitlab_list_mr_notes',
  description: 'List comments/notes on a merge request',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    order_by: z.enum(['created_at', 'updated_at']).optional().describe('Order by field'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const { project_id, merge_request_iid, ...options } = params;
    const result = await mergeRequests.listMRNotes(
      project_id as string,
      merge_request_iid as number,
      options,
    );
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : 'unknown'} notes (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const createMRNoteTool: ToolDefinition = {
  name: 'gitlab_create_mr_note',
  description: 'Add a comment/note to a merge request',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    body: z.string().describe('Note content (Markdown)'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const note = await mergeRequests.createMRNote(
      params.project_id as string,
      params.merge_request_iid as number,
      params.body as string,
    );
    return { content: [{ type: 'text', text: JSON.stringify(note, null, 2) }] };
  },
};

export const getMergeRequestCommitsTool: ToolDefinition = {
  name: 'gitlab_get_merge_request_commits',
  description: 'Get the commits included in a merge request',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const { project_id, merge_request_iid, ...options } = params;
    const result = await mergeRequests.getMergeRequestCommits(
      project_id as string,
      merge_request_iid as number,
      options,
    );
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : 'unknown'} commits (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const approveMergeRequestTool: ToolDefinition = {
  name: 'gitlab_approve_merge_request',
  description: 'Approve a merge request',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    sha: z.string().optional().describe('Expected HEAD SHA to ensure MR has not changed'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const mr = await mergeRequests.approveMergeRequest(
      params.project_id as string,
      params.merge_request_iid as number,
      params.sha as string | undefined,
    );
    return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
  },
};

export const unapproveMergeRequestTool: ToolDefinition = {
  name: 'gitlab_unapprove_merge_request',
  description: 'Remove your approval from a merge request',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const mr = await mergeRequests.unapproveMergeRequest(
      params.project_id as string,
      params.merge_request_iid as number,
    );
    return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
  },
};

export const rebaseMergeRequestTool: ToolDefinition = {
  name: 'gitlab_rebase_merge_request',
  description: 'Rebase a merge request onto the target branch',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    skip_ci: z.boolean().optional().describe('Skip CI pipeline after rebase'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const result = await mergeRequests.rebaseMergeRequest(
      params.project_id as string,
      params.merge_request_iid as number,
      params.skip_ci as boolean | undefined,
    );
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
};

export const listMRDiscussionsTool: ToolDefinition = {
  name: 'gitlab_list_mr_discussions',
  description: 'List all discussions (threaded comments) on a merge request',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const { project_id, merge_request_iid, ...options } = params;
    const result = await mergeRequests.listMRDiscussions(
      project_id as string,
      merge_request_iid as number,
      options,
    );
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : 'unknown'} discussions (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const createMRDiscussionTool: ToolDefinition = {
  name: 'gitlab_create_mr_discussion',
  description: 'Create a new discussion (threaded comment) on a merge request, optionally on a specific line of code',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    body: z.string().describe('Discussion body (Markdown)'),
    position: z.object({
      base_sha: z.string().describe('Base commit SHA from diff_refs'),
      start_sha: z.string().describe('Start commit SHA from diff_refs'),
      head_sha: z.string().describe('Head commit SHA from diff_refs'),
      position_type: z.string().describe('Position type (usually "text")'),
      old_path: z.string().optional().describe('File path before change'),
      new_path: z.string().optional().describe('File path after change'),
      old_line: z.number().nullable().optional().describe('Line number in old file'),
      new_line: z.number().nullable().optional().describe('Line number in new file'),
    }).optional().describe('Position for inline discussions on diff'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const discussion = await mergeRequests.createMRDiscussion(
      params.project_id as string,
      params.merge_request_iid as number,
      params.body as string,
      params.position as Parameters<typeof mergeRequests.createMRDiscussion>[3],
    );
    return { content: [{ type: 'text', text: JSON.stringify(discussion, null, 2) }] };
  },
};

export const setAutoMergeTool: ToolDefinition = {
  name: 'gitlab_set_auto_merge',
  description: 'Set a merge request to merge automatically when the pipeline succeeds',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    merge_commit_message: z.string().optional().describe('Custom merge commit message'),
    squash_commit_message: z.string().optional().describe('Custom squash commit message'),
    squash: z.boolean().optional().describe('Squash commits'),
    should_remove_source_branch: z.boolean().optional().describe('Remove source branch'),
    sha: z.string().optional().describe('Expected HEAD SHA of the MR'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const { project_id, merge_request_iid, ...options } = params;
    const mr = await mergeRequests.setAutoMerge(project_id as string, merge_request_iid as number, options);
    return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
  },
};

export const cancelAutoMergeTool: ToolDefinition = {
  name: 'gitlab_cancel_auto_merge',
  description: 'Cancel auto-merge for a merge request',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const mr = await mergeRequests.cancelAutoMerge(params.project_id as string, params.merge_request_iid as number);
    return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
  },
};

export const updateMRNoteTool: ToolDefinition = {
  name: 'gitlab_update_mr_note',
  description: 'Edit an existing comment/note on a merge request',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    merge_request_iid: z.number().describe('Merge request internal ID'),
    note_id: z.number().describe('Note ID to update'),
    body: z.string().describe('Updated note content (Markdown)'),
  }),
  handler: async (params) => {
    const { mergeRequests } = createGitLabServices();
    const note = await mergeRequests.updateMRNote(
      params.project_id as string,
      params.merge_request_iid as number,
      params.note_id as number,
      params.body as string,
    );
    return { content: [{ type: 'text', text: JSON.stringify(note, null, 2) }] };
  },
};

export const mergeRequestTools: ToolDefinition[] = [
  listMergeRequestsTool,
  getMergeRequestTool,
  createMergeRequestTool,
  updateMergeRequestTool,
  mergeMergeRequestTool,
  getMergeRequestDiffsTool,
  listMRNotesTool,
  createMRNoteTool,
  getMergeRequestCommitsTool,
  approveMergeRequestTool,
  unapproveMergeRequestTool,
  rebaseMergeRequestTool,
  listMRDiscussionsTool,
  createMRDiscussionTool,
  setAutoMergeTool,
  cancelAutoMergeTool,
  updateMRNoteTool,
];
