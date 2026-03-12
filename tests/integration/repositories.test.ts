import { describe, it, expect, beforeAll } from 'vitest';
import { GitLabRepositoriesService } from '../../src/gitlab-sdk/repositories.js';
import { getTestConfig, skipIfNotConfigured } from '../setup.js';

describe('GitLabRepositoriesService', () => {
  let service: GitLabRepositoriesService;
  let testProjectId: string;

  beforeAll(() => {
    const config = getTestConfig();
    if (config.isConfigured) {
      service = new GitLabRepositoriesService(config.baseUrl, config.token);
      testProjectId = config.testProjectId;
    }
  });

  it('should list branches', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    const result = await service.listBranches(testProjectId, { per_page: 5 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
    if (result.items.length > 0) {
      expect(result.items[0]).toHaveProperty('name');
      expect(result.items[0]).toHaveProperty('commit');
    }
  });

  it('should list repository tree', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    const result = await service.listTree(testProjectId, { per_page: 10 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
    if (result.items.length > 0) {
      expect(result.items[0]).toHaveProperty('name');
      expect(result.items[0]).toHaveProperty('type');
      expect(result.items[0]).toHaveProperty('path');
    }
  });

  it('should get file content', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    try {
      const file = await service.getFile(testProjectId, 'README.md');
      expect(file).toHaveProperty('file_name');
      expect(file).toHaveProperty('content');
      expect(file.file_name).toBe('README.md');
    } catch (error) {
      // README.md may not exist in the test project
      if (error instanceof Error && error.message.includes('404')) {
        return;
      }
      throw error;
    }
  });

  it('should compare branches', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    try {
      // Compare default branch with itself as a basic test
      const result = await service.compareBranches(testProjectId, 'main', 'main');
      expect(result).toHaveProperty('commits');
      expect(result).toHaveProperty('diffs');
    } catch (error) {
      // main branch may not exist
      if (error instanceof Error && error.message.includes('404')) {
        return;
      }
      throw error;
    }
  });
});
