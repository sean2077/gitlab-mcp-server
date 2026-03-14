import { BaseGitLabService } from './base.js';
import type { GitLabGroup, GitLabProject, GitLabMember, PaginatedResponse } from '../types/index.js';

export class GitLabGroupsService extends BaseGitLabService {
  async listGroups(params: {
    search?: string;
    owned?: boolean;
    min_access_level?: number;
    top_level_only?: boolean;
    order_by?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabGroup>> {
    return this.fetchWithPagination<GitLabGroup>(
      'groups',
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async getGroup(groupId: string | number): Promise<GitLabGroup> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    return this.fetchJson<GitLabGroup>(this.apiUrl(`groups/${gid}`));
  }

  async listGroupProjects(groupId: string | number, params: {
    search?: string;
    archived?: boolean;
    visibility?: string;
    order_by?: string;
    sort?: string;
    include_subgroups?: boolean;
    simple?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabProject>> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    return this.fetchWithPagination<GitLabProject>(
      `groups/${gid}/projects`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async listGroupMembers(groupId: string | number, params: {
    query?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabMember>> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    return this.fetchWithPagination<GitLabMember>(
      `groups/${gid}/members/all`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async createGroup(data: {
    name: string;
    path: string;
    description?: string;
    visibility?: string;
    parent_id?: number;
    project_creation_level?: string;
    subgroup_creation_level?: string;
  }): Promise<GitLabGroup> {
    return this.fetchJson<GitLabGroup>(this.apiUrl('groups'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGroup(groupId: string | number, data: {
    name?: string;
    path?: string;
    description?: string;
    visibility?: string;
    project_creation_level?: string;
    subgroup_creation_level?: string;
  }): Promise<GitLabGroup> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    return this.fetchJson<GitLabGroup>(this.apiUrl(`groups/${gid}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(groupId: string | number): Promise<void> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    await this.fetchText(this.apiUrl(`groups/${gid}`), { method: 'DELETE' });
  }

  async listGroupSubgroups(groupId: string | number, params: {
    search?: string;
    owned?: boolean;
    min_access_level?: number;
    order_by?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabGroup>> {
    const gid = typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId);
    return this.fetchWithPagination<GitLabGroup>(
      `groups/${gid}/subgroups`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }
}
