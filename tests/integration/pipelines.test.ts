import { describe, it, expect, beforeAll } from 'vitest';
import { GitLabPipelinesService } from '../../src/gitlab-sdk/pipelines.js';
import { getTestConfig, skipIfNotConfigured } from '../setup.js';

describe('GitLabPipelinesService', () => {
  let service: GitLabPipelinesService;
  let testProjectId: string;

  beforeAll(() => {
    const config = getTestConfig();
    if (config.isConfigured) {
      service = new GitLabPipelinesService(config.baseUrl, config.token);
      testProjectId = config.testProjectId;
    }
  });

  it('should list pipelines', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    const result = await service.listPipelines(testProjectId, { per_page: 5 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
    if (result.items.length > 0) {
      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0]).toHaveProperty('status');
      expect(result.items[0]).toHaveProperty('ref');
    }
  });

  it('should get a specific pipeline', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    const list = await service.listPipelines(testProjectId, { per_page: 1 });
    if (list.items.length === 0) return;

    const pipeline = await service.getPipeline(testProjectId, list.items[0].id);
    expect(pipeline).toHaveProperty('id');
    expect(pipeline).toHaveProperty('status');
    expect(pipeline).toHaveProperty('sha');
    expect(pipeline.id).toBe(list.items[0].id);
  });

  it('should list pipeline jobs', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    const list = await service.listPipelines(testProjectId, { per_page: 1 });
    if (list.items.length === 0) return;

    const result = await service.listPipelineJobs(testProjectId, list.items[0].id, { per_page: 5 });
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
    if (result.items.length > 0) {
      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0]).toHaveProperty('name');
      expect(result.items[0]).toHaveProperty('status');
      expect(result.items[0]).toHaveProperty('stage');
    }
  });

  it('should get job log', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    const pipelineList = await service.listPipelines(testProjectId, { per_page: 1 });
    if (pipelineList.items.length === 0) return;

    const jobList = await service.listPipelineJobs(testProjectId, pipelineList.items[0].id, { per_page: 1 });
    if (jobList.items.length === 0) return;

    const log = await service.getJobLog(testProjectId, jobList.items[0].id);
    expect(typeof log).toBe('string');
  });

  it('should truncate job log with tail_lines', async () => {
    if (skipIfNotConfigured() || !testProjectId) return;
    const pipelineList = await service.listPipelines(testProjectId, { per_page: 1 });
    if (pipelineList.items.length === 0) return;

    const jobList = await service.listPipelineJobs(testProjectId, pipelineList.items[0].id, { per_page: 1 });
    if (jobList.items.length === 0) return;

    const log = await service.getJobLog(testProjectId, jobList.items[0].id, 10);
    expect(typeof log).toBe('string');
    // If truncated, should contain truncation notice
    const lines = log.split('\n');
    expect(lines.length).toBeLessThanOrEqual(12); // 10 lines + truncation notice + possible trailing newline
  });
});
