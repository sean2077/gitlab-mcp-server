import { BaseGitLabService, encodeProjectId } from './base.js';
import type { GitLabPipeline, GitLabJob, GitLabEnvironment, PaginatedResponse } from '../types/index.js';

export class GitLabPipelinesService extends BaseGitLabService {
  async listPipelines(projectId: string | number, params: {
    status?: string;
    ref?: string;
    sha?: string;
    username?: string;
    order_by?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabPipeline>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabPipeline>(
      `projects/${pid}/pipelines`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async getPipeline(projectId: string | number, pipelineId: number): Promise<GitLabPipeline> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabPipeline>(this.apiUrl(`projects/${pid}/pipelines/${pipelineId}`));
  }

  async listPipelineJobs(projectId: string | number, pipelineId: number, params: {
    scope?: string[];
    include_retried?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabJob>> {
    const pid = encodeProjectId(projectId);
    const { scope, ...rest } = params;
    // fetchWithPagination expands array values (scope) into repeated scope[]= params.
    return this.fetchWithPagination<GitLabJob>(
      `projects/${pid}/pipelines/${pipelineId}/jobs`,
      { ...rest, scope },
    );
  }

  async getJobLog(projectId: string | number, jobId: number, tailLines?: number): Promise<string> {
    const pid = encodeProjectId(projectId);
    let log = await this.fetchText(this.apiUrl(`projects/${pid}/jobs/${jobId}/trace`));

    if (tailLines && tailLines > 0) {
      const lines = log.split('\n');
      if (lines.length > tailLines) {
        log = `... (${lines.length - tailLines} lines truncated)\n` + lines.slice(-tailLines).join('\n');
      }
    }

    return log;
  }

  async triggerPipeline(projectId: string | number, ref: string, variables?: Array<{
    key: string;
    value: string;
    variable_type?: string;
  }>): Promise<GitLabPipeline> {
    const pid = encodeProjectId(projectId);
    const body: Record<string, unknown> = { ref };
    if (variables) body.variables = variables;
    return this.fetchJson<GitLabPipeline>(this.apiUrl(`projects/${pid}/pipeline`), {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async retryPipeline(projectId: string | number, pipelineId: number): Promise<GitLabPipeline> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabPipeline>(this.apiUrl(`projects/${pid}/pipelines/${pipelineId}/retry`), {
      method: 'POST',
    });
  }

  async cancelPipeline(projectId: string | number, pipelineId: number): Promise<GitLabPipeline> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabPipeline>(this.apiUrl(`projects/${pid}/pipelines/${pipelineId}/cancel`), {
      method: 'POST',
    });
  }

  async getJob(projectId: string | number, jobId: number): Promise<GitLabJob> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabJob>(this.apiUrl(`projects/${pid}/jobs/${jobId}`));
  }

  async retryJob(projectId: string | number, jobId: number): Promise<GitLabJob> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabJob>(this.apiUrl(`projects/${pid}/jobs/${jobId}/retry`), {
      method: 'POST',
    });
  }

  async cancelJob(projectId: string | number, jobId: number): Promise<GitLabJob> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabJob>(this.apiUrl(`projects/${pid}/jobs/${jobId}/cancel`), {
      method: 'POST',
    });
  }

  async listEnvironments(projectId: string | number, params: {
    name?: string;
    search?: string;
    states?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<GitLabEnvironment>> {
    const pid = encodeProjectId(projectId);
    return this.fetchWithPagination<GitLabEnvironment>(
      `projects/${pid}/environments`,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async getEnvironment(projectId: string | number, environmentId: number): Promise<GitLabEnvironment> {
    const pid = encodeProjectId(projectId);
    return this.fetchJson<GitLabEnvironment>(this.apiUrl(`projects/${pid}/environments/${environmentId}`));
  }
}
