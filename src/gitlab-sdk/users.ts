import { BaseGitLabService } from './base.js';
import type { GitLabUserDetail, PaginatedResponse } from '../types/index.js';

export class GitLabUsersService extends BaseGitLabService {
  async getCurrentUser(): Promise<GitLabUserDetail> {
    return this.fetchJson<GitLabUserDetail>(this.apiUrl('user'));
  }

  async searchUsers(params: {
    search?: string;
    username?: string;
    active?: boolean;
    blocked?: boolean;
    order_by?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabUserDetail>> {
    return this.fetchWithPagination<GitLabUserDetail>('users', params as Record<string, string | number | boolean | undefined>);
  }

  async getUser(userId: number): Promise<GitLabUserDetail> {
    return this.fetchJson<GitLabUserDetail>(this.apiUrl(`users/${userId}`));
  }
}
