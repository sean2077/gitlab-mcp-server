import { z } from 'zod';
import { createGitLabServices } from '../utils/auth.js';
import type { ToolDefinition } from '../types/index.js';

export const listBranchesTool: ToolDefinition = {
  name: 'gitlab_list_branches',
  description: 'List branches in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    search: z.string().optional().describe('Search branches by name'),
    regex: z.string().optional().describe('Filter branches by regex pattern'),
    page: z.coerce.number().optional().describe('Page number (1-indexed)'),
    per_page: z.coerce.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await repositories.listBranches(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} branches (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const createBranchTool: ToolDefinition = {
  name: 'gitlab_create_branch',
  description: 'Create a new branch in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    branch: z.string().describe('New branch name'),
    ref: z.string().describe('Source branch/tag/commit SHA to create from'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const branch = await repositories.createBranch(
      params.project_id as string,
      params.branch as string,
      params.ref as string,
    );
    return { content: [{ type: 'text', text: JSON.stringify(branch, null, 2) }] };
  },
};

export const getFileTool: ToolDefinition = {
  name: 'gitlab_get_file',
  description: 'Get the contents of a file from a GitLab project repository',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    file_path: z.string().describe('Path to the file in the repository'),
    ref: z.string().optional().describe('Branch, tag, or commit SHA (defaults to default branch)'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const file = await repositories.getFile(
      params.project_id as string,
      params.file_path as string,
      params.ref as string | undefined,
    );
    return { content: [{ type: 'text', text: JSON.stringify(file, null, 2) }] };
  },
};

export const listRepositoryTreeTool: ToolDefinition = {
  name: 'gitlab_list_repository_tree',
  description: 'List files and directories in a GitLab project repository',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    path: z.string().optional().describe('Path inside the repository'),
    ref: z.string().optional().describe('Branch, tag, or commit SHA'),
    recursive: z.boolean().optional().describe('List recursively'),
    page: z.coerce.number().optional().describe('Page number (1-indexed)'),
    per_page: z.coerce.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await repositories.listTree(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} items (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const compareBranchesTool: ToolDefinition = {
  name: 'gitlab_compare_branches',
  description: 'Compare two branches, tags, or commits in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    from: z.string().describe('Base branch/tag/commit SHA'),
    to: z.string().describe('Target branch/tag/commit SHA'),
    straight: z.boolean().optional().describe('Use straight comparison instead of merge base'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const result = await repositories.compareBranches(
      params.project_id as string,
      params.from as string,
      params.to as string,
      params.straight as boolean | undefined,
    );
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
};

export const createOrUpdateFileTool: ToolDefinition = {
  name: 'gitlab_create_or_update_file',
  description: 'Create or update a single file in a GitLab project repository',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    file_path: z.string().describe('Path to the file in the repository'),
    branch: z.string().describe('Branch to commit to'),
    content: z.string().describe('File content'),
    commit_message: z.string().describe('Commit message'),
    previous_path: z.string().optional().describe('Previous path if renaming'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const result = await repositories.createOrUpdateFile(
      params.project_id as string,
      params.file_path as string,
      {
        branch: params.branch as string,
        content: params.content as string,
        commit_message: params.commit_message as string,
        previous_path: params.previous_path as string | undefined,
      },
    );
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
};

export const pushFilesTool: ToolDefinition = {
  name: 'gitlab_push_files',
  description: 'Push multiple files to a GitLab project in a single commit',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    branch: z.string().describe('Branch to commit to'),
    commit_message: z.string().describe('Commit message'),
    actions: z.array(z.object({
      action: z.enum(['create', 'delete', 'move', 'update', 'chmod']).describe('File action'),
      file_path: z.string().describe('Path to the file'),
      content: z.string().optional().describe('File content (required for create/update)'),
      previous_path: z.string().optional().describe('Previous path (for move)'),
      encoding: z.enum(['text', 'base64']).optional().describe('Content encoding'),
    })).describe('Array of file operations'),
    start_branch: z.string().optional().describe('Branch to start from (if different from target)'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const { project_id, ...data } = params;
    const result = await repositories.pushFiles(
      project_id as string,
      data as Parameters<typeof repositories.pushFiles>[1],
    );
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
};

export const deleteBranchTool: ToolDefinition = {
  name: 'gitlab_delete_branch',
  description: 'Delete a branch from a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    branch: z.string().describe('Branch name to delete'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    await repositories.deleteBranch(params.project_id as string, params.branch as string);
    return { content: [{ type: 'text', text: `Branch "${params.branch}" deleted successfully` }] };
  },
};

export const listCommitsTool: ToolDefinition = {
  name: 'gitlab_list_commits',
  description: 'Get commit history for a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    ref_name: z.string().optional().describe('Branch name, tag, or commit SHA'),
    since: z.string().optional().describe('Only commits after this date (ISO 8601)'),
    until: z.string().optional().describe('Only commits before this date (ISO 8601)'),
    path: z.string().optional().describe('Filter commits affecting this path'),
    all: z.boolean().optional().describe('Retrieve all commits from all branches'),
    with_stats: z.boolean().optional().describe('Include commit stats'),
    first_parent: z.boolean().optional().describe('Follow only first parent on merges'),
    page: z.coerce.number().optional().describe('Page number (1-indexed)'),
    per_page: z.coerce.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await repositories.listCommits(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} commits (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const listTagsTool: ToolDefinition = {
  name: 'gitlab_list_tags',
  description: 'List tags for a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    search: z.string().optional().describe('Search tags by name'),
    order_by: z.enum(['name', 'updated_at', 'version']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.coerce.number().optional().describe('Page number (1-indexed)'),
    per_page: z.coerce.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await repositories.listTags(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} tags (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const createTagTool: ToolDefinition = {
  name: 'gitlab_create_tag',
  description: 'Create a new tag in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    tag_name: z.string().describe('Tag name'),
    ref: z.string().describe('Source branch or commit SHA to tag'),
    message: z.string().optional().describe('Annotation message (creates annotated tag)'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const tag = await repositories.createTag(
      params.project_id as string,
      params.tag_name as string,
      params.ref as string,
      params.message as string | undefined,
    );
    return { content: [{ type: 'text', text: JSON.stringify(tag, null, 2) }] };
  },
};

export const listProtectedBranchesTool: ToolDefinition = {
  name: 'gitlab_list_protected_branches',
  description: 'List protected branches in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    search: z.string().optional().describe('Search by branch name'),
    page: z.coerce.number().optional().describe('Page number (1-indexed)'),
    per_page: z.coerce.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await repositories.listProtectedBranches(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} protected branches (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const protectBranchTool: ToolDefinition = {
  name: 'gitlab_protect_branch',
  description: 'Protect a branch in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    name: z.string().describe('Branch name or wildcard pattern to protect'),
    push_access_level: z.coerce.number().optional().describe('Access level for push (0=No access, 30=Developer, 40=Maintainer)'),
    merge_access_level: z.coerce.number().optional().describe('Access level for merge (0=No access, 30=Developer, 40=Maintainer)'),
    allow_force_push: z.boolean().optional().describe('Allow force push'),
    code_owner_approval_required: z.boolean().optional().describe('Require code owner approval'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const { project_id, name, ...options } = params;
    const branch = await repositories.protectBranch(project_id as string, name as string, options);
    return { content: [{ type: 'text', text: JSON.stringify(branch, null, 2) }] };
  },
};

export const unprotectBranchTool: ToolDefinition = {
  name: 'gitlab_unprotect_branch',
  description: 'Unprotect a branch in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    name: z.string().describe('Branch name to unprotect'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    await repositories.unprotectBranch(params.project_id as string, params.name as string);
    return { content: [{ type: 'text', text: `Branch "${params.name}" unprotected successfully` }] };
  },
};

export const listReleasesTool: ToolDefinition = {
  name: 'gitlab_list_releases',
  description: 'List releases for a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    order_by: z.enum(['released_at', 'created_at']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.coerce.number().optional().describe('Page number (1-indexed)'),
    per_page: z.coerce.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await repositories.listReleases(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total >= 0 ? result.total : result.items.length} releases (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const createReleaseTool: ToolDefinition = {
  name: 'gitlab_create_release',
  description: 'Create a new release for a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    tag_name: z.string().describe('Tag name for the release'),
    name: z.string().optional().describe('Release name'),
    description: z.string().optional().describe('Release description (supports Markdown)'),
    ref: z.string().optional().describe('Commit SHA or branch to create tag from (if tag does not exist)'),
    milestones: z.array(z.string()).optional().describe('Associated milestone titles'),
    released_at: z.string().optional().describe('Release date (ISO 8601)'),
  }),
  handler: async (params) => {
    const { repositories } = createGitLabServices();
    const { project_id, tag_name, ...options } = params;
    const release = await repositories.createRelease(project_id as string, tag_name as string, options);
    return { content: [{ type: 'text', text: JSON.stringify(release, null, 2) }] };
  },
};

export const repositoryTools: ToolDefinition[] = [
  listBranchesTool,
  createBranchTool,
  getFileTool,
  listRepositoryTreeTool,
  compareBranchesTool,
  createOrUpdateFileTool,
  pushFilesTool,
  deleteBranchTool,
  listCommitsTool,
  listTagsTool,
  createTagTool,
  listProtectedBranchesTool,
  protectBranchTool,
  unprotectBranchTool,
  listReleasesTool,
  createReleaseTool,
];
