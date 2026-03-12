import { BaseGitLabService, encodeProjectId } from './base.js';
import type { GitLabIssue, GitLabNote, GitLabDiscussion, PaginatedResponse } from '../types/index.js';

export class GitLabIssuesService extends BaseGitLabService {
  async listIssues(projectId: string | number, params: {
    state?: string;
    labels?: string;
    milestone?: string;
    scope?: string;
    assignee_id?: number;
    author_id?: number;
    search?: string;
    order_by?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabIssue>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabIssue>(
      `projects/${pid}/issues`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async getIssue(projectId: string | number, issueIid: number): Promise<GitLabIssue> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabIssue>(this.apiUrl(`projects/${pid}/issues/${issueIid}`));
  }

  async createIssue(projectId: string | number, data: {
    title: string;
    description?: string;
    assignee_ids?: number[];
    milestone_id?: number;
    labels?: string[];
    due_date?: string;
    confidential?: boolean;
  }): Promise<GitLabIssue> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabIssue>(this.apiUrl(`projects/${pid}/issues`), {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        labels: data.labels?.join(','),
      }),
    });
  }

  async updateIssue(projectId: string | number, issueIid: number, data: {
    title?: string;
    description?: string;
    assignee_ids?: number[];
    milestone_id?: number | null;
    labels?: string[];
    state_event?: string;
    due_date?: string | null;
    confidential?: boolean;
  }): Promise<GitLabIssue> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabIssue>(this.apiUrl(`projects/${pid}/issues/${issueIid}`), {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        labels: data.labels?.join(','),
      }),
    });
  }

  async listIssueNotes(projectId: string | number, issueIid: number, params: {
    sort?: string;
    order_by?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabNote>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabNote>(
      `projects/${pid}/issues/${issueIid}/notes`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async createIssueNote(projectId: string | number, issueIid: number, body: string, internal?: boolean): Promise<GitLabNote> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabNote>(this.apiUrl(`projects/${pid}/issues/${issueIid}/notes`), {
      method: 'POST',
      body: JSON.stringify({ body, internal }),
    });
  }

  async listIssueDiscussions(projectId: string | number, issueIid: number, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabDiscussion>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabDiscussion>(
      `projects/${pid}/issues/${issueIid}/discussions`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }
}
