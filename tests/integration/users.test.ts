import { describe, it, expect, beforeAll } from 'vitest';
import { GitLabUsersService } from '../../src/gitlab-sdk/users.js';
import { getTestConfig, skipIfNotConfigured } from '../setup.js';

describe('GitLabUsersService', () => {
  let service: GitLabUsersService;

  beforeAll(() => {
    const config = getTestConfig();
    if (config.isConfigured) {
      service = new GitLabUsersService(config.baseUrl, config.token);
    }
  });

  it('should get current user', async (ctx) => {
    skipIfNotConfigured(ctx);
    const user = await service.getCurrentUser();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('name');
  });

  it('should search users', async (ctx) => {
    skipIfNotConfigured(ctx);
    const result = await service.searchUsers({ per_page: 5 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });
});
