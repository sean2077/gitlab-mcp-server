import { BaseGitLabService, encodeProjectId } from './base.js';
import type { GitLabBranch, GitLabTreeItem, GitLabFileContent, GitLabCompareResult, GitLabCommit, GitLabTag, GitLabProtectedBranch, GitLabRelease, PaginatedResponse, FileOperation } from '../types/index.js';

export class GitLabRepositoriesService extends BaseGitLabService {
  async listBranches(projectId: string | number, params: {
    search?: string;
    regex?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabBranch>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabBranch>(
      `projects/${pid}/repository/branches`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async createBranch(projectId: string | number, branch: string, ref: string): Promise<GitLabBranch> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabBranch>(this.apiUrl(`projects/${pid}/repository/branches`), {
      method: 'POST',
      body: JSON.stringify({ branch, ref }),
    });
  }

  async getFile(projectId: string | number, filePath: string, ref?: string): Promise<GitLabFileContent> {
    const pid = encodeProjectId(projectId);
    const encodedPath = encodeURIComponent(filePath);
    const refParam = ref ? `?ref=${encodeURIComponent(ref)}` : '';
    const data = await this.fetchJson<GitLabFileContent>(
      this.apiUrl(`projects/${pid}/repository/files/${encodedPath}${refParam}`),
    );

    // Decode base64 content
    if (data.content && data.encoding === 'base64') {
      data.content = Buffer.from(data.content, 'base64').toString('utf8');
    }

    return data;
  }

  async listTree(projectId: string | number, params: {
    path?: string;
    ref?: string;
    recursive?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabTreeItem>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabTreeItem>(
      `projects/${pid}/repository/tree`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async compareBranches(projectId: string | number, from: string, to: string, straight?: boolean): Promise<GitLabCompareResult> {
    const pid = encodeProjectId(projectId);
    const params = new URLSearchParams({ from, to });
    if (straight !== undefined) params.set('straight', String(straight));
    return this.fetchJson<GitLabCompareResult>(
      `${this.apiUrl(`projects/${pid}/repository/compare`)}?${params.toString()}`,
    );
  }

  async createOrUpdateFile(projectId: string | number, filePath: string, data: {
    branch: string;
    content: string;
    commit_message: string;
    previous_path?: string;
  }): Promise<{ file_path: string; branch: string; commit_id: string }> {
    const pid = encodeProjectId(projectId);
    const encodedPath = encodeURIComponent(filePath);
    const url = this.apiUrl(`projects/${pid}/repository/files/${encodedPath}`);

    // Check if file exists to decide POST vs PUT
    let method = 'POST';
    try {
      await this.getFile(projectId, filePath, data.branch);
      method = 'PUT';
    } catch {
      // File doesn't exist, use POST
    }

    return this.fetchJson<{ file_path: string; branch: string; commit_id: string }>(url, {
      method,
      body: JSON.stringify(data),
    });
  }

  async pushFiles(projectId: string | number, data: {
    branch: string;
    commit_message: string;
    actions: FileOperation[];
    start_branch?: string;
  }): Promise<GitLabCommit> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabCommit>(this.apiUrl(`projects/${pid}/repository/commits`), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteBranch(projectId: string | number, branch: string): Promise<void> {
    const pid = encodeProjectId(projectId);
    await this.fetchText(
      this.apiUrl(`projects/${pid}/repository/branches/${encodeURIComponent(branch)}`),
      { method: 'DELETE' },
    );
  }

  async listCommits(projectId: string | number, params: {
    ref_name?: string;
    since?: string;
    until?: string;
    path?: string;
    all?: boolean;
    with_stats?: boolean;
    first_parent?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabCommit>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabCommit>(
      `projects/${pid}/repository/commits`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async listTags(projectId: string | number, params: {
    search?: string;
    order_by?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabTag>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabTag>(
      `projects/${pid}/repository/tags`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async createTag(projectId: string | number, tagName: string, ref: string, message?: string): Promise<GitLabTag> {
    const pid = encodeProjectId(projectId);
    const body: Record<string, string> = { tag_name: tagName, ref };
    if (message) body.message = message;
    return this.fetchJson<GitLabTag>(this.apiUrl(`projects/${pid}/repository/tags`), {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async listProtectedBranches(projectId: string | number, params: {
    search?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabProtectedBranch>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabProtectedBranch>(
      `projects/${pid}/protected_branches`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async protectBranch(projectId: string | number, name: string, params: {
    push_access_level?: number;
    merge_access_level?: number;
    allow_force_push?: boolean;
    code_owner_approval_required?: boolean;
  } = {}): Promise<GitLabProtectedBranch> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabProtectedBranch>(this.apiUrl(`projects/${pid}/protected_branches`), {
      method: 'POST',
      body: JSON.stringify({ name, ...params }),
    });
  }

  async unprotectBranch(projectId: string | number, name: string): Promise<void> {
    const pid = encodeProjectId(projectId);
    await this.fetchText(
      this.apiUrl(`projects/${pid}/protected_branches/${encodeURIComponent(name)}`),
      { method: 'DELETE' },
    );
  }

  async listReleases(projectId: string | number, params: {
    order_by?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabRelease>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabRelease>(
      `projects/${pid}/releases`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async createRelease(projectId: string | number, tagName: string, params: {
    name?: string;
    description?: string;
    ref?: string;
    milestones?: string[];
    released_at?: string;
  } = {}): Promise<GitLabRelease> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabRelease>(this.apiUrl(`projects/${pid}/releases`), {
      method: 'POST',
      body: JSON.stringify({ tag_name: tagName, ...params }),
    });
  }
}
