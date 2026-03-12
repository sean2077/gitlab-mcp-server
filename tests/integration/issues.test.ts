import { describe, it, expect, beforeAll } from 'vitest';
import { GitLabIssuesService } from '../../src/gitlab-sdk/issues.js';
import { getTestConfig, skipIfNotConfigured } from '../setup.js';

describe('GitLabIssuesService', () => {
  let service: GitLabIssuesService;
  let testProjectId: string;
  let testIssueIid: number;

  beforeAll(() => {
    const config = getTestConfig();
    if (config.isConfigured) {
      service = new GitLabIssuesService(config.baseUrl, config.token);
      testProjectId = config.testProjectId;
      testIssueIid = config.testIssueIid;
    }
  });

  it('should list issues', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    const result = await service.listIssues(testProjectId, { per_page: 5 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should list issues with state filter', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    const result = await service.listIssues(testProjectId, { state: 'opened', per_page: 5 });
    expect(result).toHaveProperty('items');
    for (const issue of result.items) {
      expect(issue.state).toBe('opened');
    }
  });

  it('should get a specific issue', async () => {
    if (skipIfNotConfigured() || !testProjectId || !testIssueIid) return;
    const issue = await service.getIssue(testProjectId, testIssueIid);
    expect(issue).toHaveProperty('id');
    expect(issue).toHaveProperty('iid');
    expect(issue).toHaveProperty('title');
    expect(issue.iid).toBe(testIssueIid);
  });

  it('should list issue notes', async () => {
    if (skipIfNotConfigured() || !testProjectId || !testIssueIid) return;
    const result = await service.listIssueNotes(testProjectId, testIssueIid, { per_page: 5 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });
});
