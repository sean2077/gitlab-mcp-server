import { describe, it, expect, beforeAll } from 'vitest';
import { GitLabProjectsService } from '../../src/gitlab-sdk/projects.js';
import { getTestConfig, skipIfNotConfigured } from '../setup.js';

describe('GitLabProjectsService', () => {
  let service: GitLabProjectsService;

  beforeAll(() => {
    const config = getTestConfig();
    if (config.isConfigured) {
      service = new GitLabProjectsService(config.baseUrl, config.token);
    }
  });

  it('should list projects', async () => {
    if (skipIfNotConfigured()) return;
    const result = await service.listProjects({ per_page: 5 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should get project by ID', async () => {
    const config = getTestConfig();
    if (skipIfNotConfigured() || !config.testProjectId) return;
    const project = await service.getProject(config.testProjectId);
    expect(project).toHaveProperty('id');
    expect(project).toHaveProperty('name');
    expect(project).toHaveProperty('web_url');
  });

  it('should search projects', async () => {
    if (skipIfNotConfigured()) return;
    const result = await service.searchProjects('test', { per_page: 5 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });
});
