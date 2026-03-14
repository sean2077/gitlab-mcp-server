import { BaseGitLabService, encodeProjectId } from './base.js';
import type { GitLabProject, GitLabProjectDetail, GitLabMember, GitLabLabel, GitLabMilestone, GitLabEvent, GitLabFork, PaginatedResponse } from '../types/index.js';

export class GitLabProjectsService extends BaseGitLabService {
  async listProjects(params: {
    search?: string;
    owned?: boolean;
    membership?: boolean;
    archived?: boolean;
    visibility?: string;
    order_by?: string;
    sort?: string;
    simple?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabProject>> {
    return this.fetchWithPagination<GitLabProject>('projects', params as Record<string, string | number | boolean | undefined>);
  }

  async getProject(projectId: string | number): Promise<GitLabProjectDetail> {
    return this.fetchJson<GitLabProjectDetail>(
      this.apiUrl(`projects/${encodeProjectId(projectId)}`),
    );
  }

  async searchProjects(query: string, params: {
    simple?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabProject>> {
    return this.fetchWithPagination<GitLabProject>('projects', {
      search: query,
      ...params,
    });
  }

  async listProjectMembers(projectId: string | number, params: {
    query?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabMember>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabMember>(
      `projects/${pid}/members/all`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async listLabels(projectId: string | number, params: {
    search?: string;
    include_ancestor_groups?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabLabel>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabLabel>(
      `projects/${pid}/labels`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async createLabel(projectId: string | number, data: {
    name: string;
    color: string;
    description?: string;
    priority?: number;
  }): Promise<GitLabLabel> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabLabel>(this.apiUrl(`projects/${pid}/labels`), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listMilestones(projectId: string | number, params: {
    state?: string;
    title?: string;
    search?: string;
    include_parent_milestones?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabMilestone>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabMilestone>(
      `projects/${pid}/milestones`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async createMilestone(projectId: string | number, data: {
    title: string;
    description?: string;
    due_date?: string;
    start_date?: string;
  }): Promise<GitLabMilestone> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabMilestone>(this.apiUrl(`projects/${pid}/milestones`), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(projectId: string | number, data: {
    name?: string;
    description?: string;
    default_branch?: string;
    visibility?: string;
    issues_enabled?: boolean;
    merge_requests_enabled?: boolean;
    wiki_enabled?: boolean;
    jobs_enabled?: boolean;
    archived?: boolean;
  }): Promise<GitLabProjectDetail> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabProjectDetail>(this.apiUrl(`projects/${pid}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createProject(data: {
    name: string;
    description?: string;
    visibility?: string;
    initialize_with_readme?: boolean;
    namespace_id?: number;
    default_branch?: string;
  }): Promise<GitLabProjectDetail> {
    return this.fetchJson<GitLabProjectDetail>(this.apiUrl('projects'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forkProject(projectId: string | number, namespace?: string): Promise<GitLabFork> {
    const pid = encodeProjectId(projectId);
    const body: Record<string, string> = {};
    if (namespace) body.namespace_path = namespace;
    return this.fetchJson<GitLabFork>(this.apiUrl(`projects/${pid}/fork`), {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getProjectEvents(projectId: string | number, params: {
    action?: string;
    target_type?: string;
    before?: string;
    after?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabEvent>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabEvent>(
      `projects/${pid}/events`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async updateLabel(projectId: string | number, labelId: number, data: {
    new_name?: string;
    color?: string;
    description?: string;
    priority?: number | null;
  }): Promise<GitLabLabel> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabLabel>(this.apiUrl(`projects/${pid}/labels/${labelId}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateMilestone(projectId: string | number, milestoneId: number, data: {
    title?: string;
    description?: string;
    due_date?: string | null;
    start_date?: string | null;
    state_event?: string;
  }): Promise<GitLabMilestone> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabMilestone>(this.apiUrl(`projects/${pid}/milestones/${milestoneId}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
