import { describe, it, expect, beforeAll } from 'vitest';
import { GitLabMergeRequestsService } from '../../src/gitlab-sdk/merge-requests.js';
import { getTestConfig, skipIfNotConfigured } from '../setup.js';

describe('GitLabMergeRequestsService', () => {
  let service: GitLabMergeRequestsService;
  let testProjectId: string;
  let testMrIid: number;

  beforeAll(() => {
    const config = getTestConfig();
    if (config.isConfigured) {
      service = new GitLabMergeRequestsService(config.baseUrl, config.token);
      testProjectId = config.testProjectId;
      testMrIid = config.testMrIid;
    }
  });

  it('should list merge requests', async (ctx) => {
    skipIfNotConfigured(ctx, !testProjectId);
    const result = await service.listMergeRequests(testProjectId, { per_page: 5 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should list merge requests with state filter', async (ctx) => {
    skipIfNotConfigured(ctx, !testProjectId);
    const result = await service.listMergeRequests(testProjectId, { state: 'merged', per_page: 5 });
    expect(result).toHaveProperty('items');
    for (const mr of result.items) {
      expect(mr.state).toBe('merged');
    }
  });

  it('should get a specific merge request', async (ctx) => {
    skipIfNotConfigured(ctx, !testProjectId, !testMrIid);
    const mr = await service.getMergeRequest(testProjectId, testMrIid);
    expect(mr).toHaveProperty('id');
    expect(mr).toHaveProperty('iid');
    expect(mr).toHaveProperty('title');
    expect(mr).toHaveProperty('source_branch');
    expect(mr).toHaveProperty('target_branch');
    expect(mr.iid).toBe(testMrIid);
  });

  it('should get merge request diffs', async (ctx) => {
    skipIfNotConfigured(ctx, !testProjectId, !testMrIid);
    const result = await service.getMergeRequestDiffs(testProjectId, testMrIid);
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should list MR notes', async (ctx) => {
    skipIfNotConfigured(ctx, !testProjectId, !testMrIid);
    const result = await service.listMRNotes(testProjectId, testMrIid, { per_page: 5 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });
});
