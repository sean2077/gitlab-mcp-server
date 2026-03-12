import { BaseGitLabService, encodeProjectId } from './base.js';
import type { GitLabWikiPage } from '../types/index.js';

export class GitLabWikisService extends BaseGitLabService {
  // =========================================================================
  // Project Wiki
  // =========================================================================

  async listProjectWikiPages(projectId: string | number, params: {
    with_content?: boolean;
  } = {}): Promise<GitLabWikiPage[]> {
    const pid = encodeProjectId(projectId);
    const query = params.with_content ? '?with_content=1' : '';
    return this.fetchJson<GitLabWikiPage[]>(this.apiUrl(`projects/${pid}/wikis`) + query);
  }

  async getProjectWikiPage(projectId: string | number, slug: string, params: {
    render_html?: boolean;
    version?: string;
  } = {}): Promise<GitLabWikiPage> {
    const pid = encodeProjectId(projectId);
    const searchParams = new URLSearchParams();
    if (params.render_html) searchParams.set('render_html', 'true');
    if (params.version) searchParams.set('version', params.version);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.fetchJson<GitLabWikiPage>(
      this.apiUrl(`projects/${pid}/wikis/${encodeURIComponent(slug)}`) + query,
    );
  }

  async createProjectWikiPage(projectId: string | number, data: {
    title: string;
    content: string;
    format?: string;
  }): Promise<GitLabWikiPage> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabWikiPage>(this.apiUrl(`projects/${pid}/wikis`), {
      method: 'POST',
      body: JSON.stringify({ ...data, format: data.format || 'markdown' }),
    });
  }

  async editProjectWikiPage(projectId: string | number, slug: string, data: {
    title?: string;
    content?: string;
    format?: string;
  }): Promise<GitLabWikiPage> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabWikiPage>(
      this.apiUrl(`projects/${pid}/wikis/${encodeURIComponent(slug)}`),
      { method: 'PUT', body: JSON.stringify(data) },
    );
  }

  async deleteProjectWikiPage(projectId: string | number, slug: string): Promise<void> {
    const pid = encodeProjectId(projectId);
    await this.fetchText(
      this.apiUrl(`projects/${pid}/wikis/${encodeURIComponent(slug)}`),
      { method: 'DELETE' },
    );
  }

  // =========================================================================
  // Group Wiki
  // =========================================================================

  async listGroupWikiPages(groupId: string | number, params: {
    with_content?: boolean;
  } = {}): Promise<GitLabWikiPage[]> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    const query = params.with_content ? '?with_content=1' : '';
    return this.fetchJson<GitLabWikiPage[]>(this.apiUrl(`groups/${gid}/wikis`) + query);
  }

  async getGroupWikiPage(groupId: string | number, slug: string, params: {
    render_html?: boolean;
    version?: string;
  } = {}): Promise<GitLabWikiPage> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    const searchParams = new URLSearchParams();
    if (params.render_html) searchParams.set('render_html', 'true');
    if (params.version) searchParams.set('version', params.version);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.fetchJson<GitLabWikiPage>(
      this.apiUrl(`groups/${gid}/wikis/${encodeURIComponent(slug)}`) + query,
    );
  }

  async createGroupWikiPage(groupId: string | number, data: {
    title: string;
    content: string;
    format?: string;
  }): Promise<GitLabWikiPage> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    return this.fetchJson<GitLabWikiPage>(this.apiUrl(`groups/${gid}/wikis`), {
      method: 'POST',
      body: JSON.stringify({ ...data, format: data.format || 'markdown' }),
    });
  }

  async editGroupWikiPage(groupId: string | number, slug: string, data: {
    title?: string;
    content?: string;
    format?: string;
  }): Promise<GitLabWikiPage> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    return this.fetchJson<GitLabWikiPage>(
      this.apiUrl(`groups/${gid}/wikis/${encodeURIComponent(slug)}`),
      { method: 'PUT', body: JSON.stringify(data) },
    );
  }

  async deleteGroupWikiPage(groupId: string | number, slug: string): Promise<void> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    await this.fetchText(
      this.apiUrl(`groups/${gid}/wikis/${encodeURIComponent(slug)}`),
      { method: 'DELETE' },
    );
  }
}
