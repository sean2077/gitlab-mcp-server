import { BaseGitLabService, encodeProjectId } from './base.js';
import type { GitLabMergeRequest, GitLabMergeRequestChanges, GitLabNote, GitLabCommit, GitLabDiscussion, PaginatedResponse } from '../types/index.js';

export class GitLabMergeRequestsService extends BaseGitLabService {
  async listMergeRequests(projectId: string | number, params: {
    state?: string;
    scope?: string;
    assignee_id?: number;
    author_id?: number;
    reviewer_id?: number;
    labels?: string;
    milestone?: string;
    search?: string;
    source_branch?: string;
    target_branch?: string;
    order_by?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabMergeRequest>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabMergeRequest>(
      `projects/${pid}/merge_requests`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async getMergeRequest(projectId: string | number, mrIid: number): Promise<GitLabMergeRequest> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabMergeRequest>(this.apiUrl(`projects/${pid}/merge_requests/${mrIid}`));
  }

  async createMergeRequest(projectId: string | number, data: {
    title: string;
    description?: string;
    source_branch: string;
    target_branch: string;
    assignee_ids?: number[];
    reviewer_ids?: number[];
    labels?: string[];
    milestone_id?: number;
    remove_source_branch?: boolean;
    squash?: boolean;
    draft?: boolean;
  }): Promise<GitLabMergeRequest> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabMergeRequest>(this.apiUrl(`projects/${pid}/merge_requests`), {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        labels: data.labels?.join(','),
      }),
    });
  }

  async updateMergeRequest(projectId: string | number, mrIid: number, data: {
    title?: string;
    description?: string;
    target_branch?: string;
    assignee_ids?: number[];
    reviewer_ids?: number[];
    labels?: string[];
    milestone_id?: number | null;
    state_event?: string;
    remove_source_branch?: boolean;
    squash?: boolean;
    draft?: boolean;
  }): Promise<GitLabMergeRequest> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabMergeRequest>(this.apiUrl(`projects/${pid}/merge_requests/${mrIid}`), {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        labels: data.labels?.join(','),
      }),
    });
  }

  async mergeMergeRequest(projectId: string | number, mrIid: number, params: {
    merge_commit_message?: string;
    squash_commit_message?: string;
    squash?: boolean;
    should_remove_source_branch?: boolean;
    sha?: string;
  } = {}): Promise<GitLabMergeRequest> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabMergeRequest>(this.apiUrl(`projects/${pid}/merge_requests/${mrIid}/merge`), {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  async getMergeRequestDiffs(projectId: string | number, mrIid: number, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabMergeRequestChanges['changes'][0]>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabMergeRequestChanges['changes'][0]>(
      `projects/${pid}/merge_requests/${mrIid}/diffs`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async listMRNotes(projectId: string | number, mrIid: number, params: {
    sort?: string;
    order_by?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabNote>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabNote>(
      `projects/${pid}/merge_requests/${mrIid}/notes`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async createMRNote(projectId: string | number, mrIid: number, body: string): Promise<GitLabNote> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabNote>(this.apiUrl(`projects/${pid}/merge_requests/${mrIid}/notes`), {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  async getMergeRequestCommits(projectId: string | number, mrIid: number, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabCommit>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabCommit>(
      `projects/${pid}/merge_requests/${mrIid}/commits`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async approveMergeRequest(projectId: string | number, mrIid: number, sha?: string): Promise<GitLabMergeRequest> {
    const pid = encodeProjectId(projectId);
    const body: Record<string, string> = {};
    if (sha) body.sha = sha;
    return this.fetchJson<GitLabMergeRequest>(this.apiUrl(`projects/${pid}/merge_requests/${mrIid}/approve`), {
      method: 'POST',
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });
  }

  async unapproveMergeRequest(projectId: string | number, mrIid: number): Promise<GitLabMergeRequest> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabMergeRequest>(this.apiUrl(`projects/${pid}/merge_requests/${mrIid}/unapprove`), {
      method: 'POST',
    });
  }

  async rebaseMergeRequest(projectId: string | number, mrIid: number, skipCi?: boolean): Promise<{ rebase_in_progress: boolean }> {
    const pid = encodeProjectId(projectId);
    const body: Record<string, unknown> = {};
    if (skipCi !== undefined) body.skip_ci = skipCi;
    return this.fetchJson<{ rebase_in_progress: boolean }>(this.apiUrl(`projects/${pid}/merge_requests/${mrIid}/rebase`), {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async listMRDiscussions(projectId: string | number, mrIid: number, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabDiscussion>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabDiscussion>(
      `projects/${pid}/merge_requests/${mrIid}/discussions`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async createMRDiscussion(projectId: string | number, mrIid: number, body: string, position?: {
    base_sha: string;
    start_sha: string;
    head_sha: string;
    position_type: string;
    old_path?: string;
    new_path?: string;
    old_line?: number | null;
    new_line?: number | null;
  }): Promise<GitLabDiscussion> {
    const pid = encodeProjectId(projectId);
    const requestBody: Record<string, unknown> = { body };
    if (position) requestBody.position = position;
    return this.fetchJson<GitLabDiscussion>(this.apiUrl(`projects/${pid}/merge_requests/${mrIid}/discussions`), {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  async setAutoMerge(projectId: string | number, mrIid: number, params: {
    merge_commit_message?: string;
    squash_commit_message?: string;
    squash?: boolean;
    should_remove_source_branch?: boolean;
    sha?: string;
  } = {}): Promise<GitLabMergeRequest> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabMergeRequest>(this.apiUrl(`projects/${pid}/merge_requests/${mrIid}/merge`), {
      method: 'PUT',
      body: JSON.stringify({ ...params, merge_when_pipeline_succeeds: true }),
    });
  }

  async cancelAutoMerge(projectId: string | number, mrIid: number): Promise<GitLabMergeRequest> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabMergeRequest>(
      this.apiUrl(`projects/${pid}/merge_requests/${mrIid}/cancel_merge_when_pipeline_succeeds`),
      { method: 'POST' },
    );
  }

  async updateMRNote(projectId: string | number, mrIid: number, noteId: number, body: string): Promise<GitLabNote> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabNote>(this.apiUrl(`projects/${pid}/merge_requests/${mrIid}/notes/${noteId}`), {
      method: 'PUT',
      body: JSON.stringify({ body }),
    });
  }
}
