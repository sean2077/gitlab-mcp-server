import { z } from 'zod';
import { createGitLabServices } from '../utils/auth.js';
import type { ToolDefinition } from '../types/index.js';

// ============================================================================
// Project Wiki Tools
// ============================================================================

export const listProjectWikiPagesTool: ToolDefinition = {
  name: 'gitlab_list_project_wiki_pages',
  description: 'List all wiki pages for a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    with_content: z.boolean().optional().describe('Include page content in response'),
  }),
  handler: async (params) => {
    const { wikis } = createGitLabServices();
    const pages = await wikis.listProjectWikiPages(
      params.project_id as string,
      { with_content: params.with_content as boolean | undefined },
    );
    return {
      content: [
        { type: 'text', text: `Found ${pages.length} wiki pages` },
        { type: 'text', text: JSON.stringify(pages, null, 2) },
      ],
    };
  },
};

export const getProjectWikiPageTool: ToolDefinition = {
  name: 'gitlab_get_project_wiki_page',
  description: 'Get a specific wiki page from a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    slug: z.string().describe('URL-encoded slug of the wiki page (e.g. "my-page")'),
    render_html: z.boolean().optional().describe('Return rendered HTML content'),
    version: z.string().optional().describe('Wiki page version SHA'),
  }),
  handler: async (params) => {
    const { wikis } = createGitLabServices();
    const page = await wikis.getProjectWikiPage(
      params.project_id as string,
      params.slug as string,
      {
        render_html: params.render_html as boolean | undefined,
        version: params.version as string | undefined,
      },
    );
    return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
  },
};

export const createProjectWikiPageTool: ToolDefinition = {
  name: 'gitlab_create_project_wiki_page',
  description: 'Create a new wiki page in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    title: z.string().describe('Wiki page title'),
    content: z.string().describe('Wiki page content'),
    format: z.enum(['markdown', 'rdoc', 'asciidoc', 'org']).optional().describe('Content format (default: markdown)'),
  }),
  handler: async (params) => {
    const { wikis } = createGitLabServices();
    const page = await wikis.createProjectWikiPage(
      params.project_id as string,
      {
        title: params.title as string,
        content: params.content as string,
        format: params.format as string | undefined,
      },
    );
    return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
  },
};

export const editProjectWikiPageTool: ToolDefinition = {
  name: 'gitlab_edit_project_wiki_page',
  description: 'Edit an existing wiki page in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    slug: z.string().describe('URL-encoded slug of the wiki page'),
    title: z.string().optional().describe('New title'),
    content: z.string().optional().describe('New content'),
    format: z.enum(['markdown', 'rdoc', 'asciidoc', 'org']).optional().describe('Content format'),
  }),
  handler: async (params) => {
    const { wikis } = createGitLabServices();
    const { project_id, slug, ...data } = params;
    const page = await wikis.editProjectWikiPage(
      project_id as string,
      slug as string,
      data as Parameters<typeof wikis.editProjectWikiPage>[2],
    );
    return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
  },
};

export const deleteProjectWikiPageTool: ToolDefinition = {
  name: 'gitlab_delete_project_wiki_page',
  description: 'Delete a wiki page from a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    slug: z.string().describe('URL-encoded slug of the wiki page'),
  }),
  handler: async (params) => {
    const { wikis } = createGitLabServices();
    await wikis.deleteProjectWikiPage(params.project_id as string, params.slug as string);
    return { content: [{ type: 'text', text: `Wiki page "${params.slug}" deleted successfully` }] };
  },
};

// ============================================================================
// Group Wiki Tools
// ============================================================================

export const listGroupWikiPagesTool: ToolDefinition = {
  name: 'gitlab_list_group_wiki_pages',
  description: 'List all wiki pages for a GitLab group',
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
    with_content: z.boolean().optional().describe('Include page content in response'),
  }),
  handler: async (params) => {
    const { wikis } = createGitLabServices();
    const pages = await wikis.listGroupWikiPages(
      params.group_id as string,
      { with_content: params.with_content as boolean | undefined },
    );
    return {
      content: [
        { type: 'text', text: `Found ${pages.length} wiki pages` },
        { type: 'text', text: JSON.stringify(pages, null, 2) },
      ],
    };
  },
};

export const getGroupWikiPageTool: ToolDefinition = {
  name: 'gitlab_get_group_wiki_page',
  description: 'Get a specific wiki page from a GitLab group',
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
    slug: z.string().describe('URL-encoded slug of the wiki page'),
    render_html: z.boolean().optional().describe('Return rendered HTML content'),
    version: z.string().optional().describe('Wiki page version SHA'),
  }),
  handler: async (params) => {
    const { wikis } = createGitLabServices();
    const page = await wikis.getGroupWikiPage(
      params.group_id as string,
      params.slug as string,
      {
        render_html: params.render_html as boolean | undefined,
        version: params.version as string | undefined,
      },
    );
    return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
  },
};

export const createGroupWikiPageTool: ToolDefinition = {
  name: 'gitlab_create_group_wiki_page',
  description: 'Create a new wiki page in a GitLab group',
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
    title: z.string().describe('Wiki page title'),
    content: z.string().describe('Wiki page content'),
    format: z.enum(['markdown', 'rdoc', 'asciidoc', 'org']).optional().describe('Content format (default: markdown)'),
  }),
  handler: async (params) => {
    const { wikis } = createGitLabServices();
    const page = await wikis.createGroupWikiPage(
      params.group_id as string,
      {
        title: params.title as string,
        content: params.content as string,
        format: params.format as string | undefined,
      },
    );
    return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
  },
};

export const editGroupWikiPageTool: ToolDefinition = {
  name: 'gitlab_edit_group_wiki_page',
  description: 'Edit an existing wiki page in a GitLab group',
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
    slug: z.string().describe('URL-encoded slug of the wiki page'),
    title: z.string().optional().describe('New title'),
    content: z.string().optional().describe('New content'),
    format: z.enum(['markdown', 'rdoc', 'asciidoc', 'org']).optional().describe('Content format'),
  }),
  handler: async (params) => {
    const { wikis } = createGitLabServices();
    const { group_id, slug, ...data } = params;
    const page = await wikis.editGroupWikiPage(
      group_id as string,
      slug as string,
      data as Parameters<typeof wikis.editGroupWikiPage>[2],
    );
    return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
  },
};

export const deleteGroupWikiPageTool: ToolDefinition = {
  name: 'gitlab_delete_group_wiki_page',
  description: 'Delete a wiki page from a GitLab group',
  parameters: z.object({
    group_id: z.string().describe('Group ID or URL-encoded path'),
    slug: z.string().describe('URL-encoded slug of the wiki page'),
  }),
  handler: async (params) => {
    const { wikis } = createGitLabServices();
    await wikis.deleteGroupWikiPage(params.group_id as string, params.slug as string);
    return { content: [{ type: 'text', text: `Wiki page "${params.slug}" deleted successfully` }] };
  },
};

export const wikiTools: ToolDefinition[] = [
  listProjectWikiPagesTool,
  getProjectWikiPageTool,
  createProjectWikiPageTool,
  editProjectWikiPageTool,
  deleteProjectWikiPageTool,
  listGroupWikiPagesTool,
  getGroupWikiPageTool,
  createGroupWikiPageTool,
  editGroupWikiPageTool,
  deleteGroupWikiPageTool,
];
