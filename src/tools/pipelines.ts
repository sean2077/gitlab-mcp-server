import { z } from 'zod';
import { createGitLabServices } from '../utils/auth.js';
import type { ToolDefinition } from '../types/index.js';

export const listPipelinesTool: ToolDefinition = {
  name: 'gitlab_list_pipelines',
  description: 'List CI/CD pipelines for a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    status: z.enum(['created', 'waiting_for_resource', 'preparing', 'pending', 'running', 'success', 'failed', 'canceled', 'skipped', 'manual', 'scheduled']).optional().describe('Filter by status'),
    ref: z.string().optional().describe('Filter by branch or tag name'),
    sha: z.string().optional().describe('Filter by commit SHA'),
    username: z.string().optional().describe('Filter by username who triggered'),
    order_by: z.enum(['id', 'status', 'ref', 'updated_at', 'user_id']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await pipelines.listPipelines(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total} pipelines (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const getPipelineTool: ToolDefinition = {
  name: 'gitlab_get_pipeline',
  description: 'Get details of a specific CI/CD pipeline',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    pipeline_id: z.number().describe('Pipeline ID'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const pipeline = await pipelines.getPipeline(
      params.project_id as string,
      params.pipeline_id as number,
    );
    return { content: [{ type: 'text', text: JSON.stringify(pipeline, null, 2) }] };
  },
};

export const listPipelineJobsTool: ToolDefinition = {
  name: 'gitlab_list_pipeline_jobs',
  description: 'List jobs in a CI/CD pipeline',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    pipeline_id: z.number().describe('Pipeline ID'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const { project_id, pipeline_id, ...options } = params;
    const result = await pipelines.listPipelineJobs(
      project_id as string,
      pipeline_id as number,
      options,
    );
    return {
      content: [
        { type: 'text', text: `Found ${result.total} jobs (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const getJobLogTool: ToolDefinition = {
  name: 'gitlab_get_job_log',
  description: 'Get the log/trace output of a CI/CD job',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    job_id: z.number().describe('Job ID'),
    tail_lines: z.number().optional().describe('Only return the last N lines of the log'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const log = await pipelines.getJobLog(
      params.project_id as string,
      params.job_id as number,
      params.tail_lines as number | undefined,
    );
    return { content: [{ type: 'text', text: log }] };
  },
};

export const triggerPipelineTool: ToolDefinition = {
  name: 'gitlab_trigger_pipeline',
  description: 'Trigger a new CI/CD pipeline for a branch or tag',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    ref: z.string().describe('Branch name or tag to run the pipeline for'),
    variables: z.array(z.object({
      key: z.string().describe('Variable name'),
      value: z.string().describe('Variable value'),
      variable_type: z.string().optional().describe('Variable type (env_var or file)'),
    })).optional().describe('Pipeline variables'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const pipeline = await pipelines.triggerPipeline(
      params.project_id as string,
      params.ref as string,
      params.variables as Array<{ key: string; value: string; variable_type?: string }> | undefined,
    );
    return { content: [{ type: 'text', text: JSON.stringify(pipeline, null, 2) }] };
  },
};

export const retryPipelineTool: ToolDefinition = {
  name: 'gitlab_retry_pipeline',
  description: 'Retry failed jobs in a CI/CD pipeline',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    pipeline_id: z.number().describe('Pipeline ID'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const pipeline = await pipelines.retryPipeline(
      params.project_id as string,
      params.pipeline_id as number,
    );
    return { content: [{ type: 'text', text: JSON.stringify(pipeline, null, 2) }] };
  },
};

export const cancelPipelineTool: ToolDefinition = {
  name: 'gitlab_cancel_pipeline',
  description: 'Cancel a running CI/CD pipeline',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    pipeline_id: z.number().describe('Pipeline ID'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const pipeline = await pipelines.cancelPipeline(
      params.project_id as string,
      params.pipeline_id as number,
    );
    return { content: [{ type: 'text', text: JSON.stringify(pipeline, null, 2) }] };
  },
};

export const getJobTool: ToolDefinition = {
  name: 'gitlab_get_job',
  description: 'Get details of a specific CI/CD job',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    job_id: z.number().describe('Job ID'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const job = await pipelines.getJob(
      params.project_id as string,
      params.job_id as number,
    );
    return { content: [{ type: 'text', text: JSON.stringify(job, null, 2) }] };
  },
};

export const retryJobTool: ToolDefinition = {
  name: 'gitlab_retry_job',
  description: 'Retry a failed CI/CD job',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    job_id: z.number().describe('Job ID'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const job = await pipelines.retryJob(
      params.project_id as string,
      params.job_id as number,
    );
    return { content: [{ type: 'text', text: JSON.stringify(job, null, 2) }] };
  },
};

export const cancelJobTool: ToolDefinition = {
  name: 'gitlab_cancel_job',
  description: 'Cancel a running CI/CD job',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    job_id: z.number().describe('Job ID'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const job = await pipelines.cancelJob(
      params.project_id as string,
      params.job_id as number,
    );
    return { content: [{ type: 'text', text: JSON.stringify(job, null, 2) }] };
  },
};

export const listEnvironmentsTool: ToolDefinition = {
  name: 'gitlab_list_environments',
  description: 'List environments for a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    name: z.string().optional().describe('Filter by exact environment name'),
    search: z.string().optional().describe('Search environments by name'),
    states: z.enum(['available', 'stopping', 'stopped']).optional().describe('Filter by state'),
    page: z.number().optional().describe('Page number (1-indexed)'),
    per_page: z.number().optional().describe('Results per page (1-100)'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const { project_id, ...options } = params;
    const result = await pipelines.listEnvironments(project_id as string, options);
    return {
      content: [
        { type: 'text', text: `Found ${result.total} environments (page ${result.page}/${result.totalPages})` },
        { type: 'text', text: JSON.stringify(result.items, null, 2) },
      ],
    };
  },
};

export const getEnvironmentTool: ToolDefinition = {
  name: 'gitlab_get_environment',
  description: 'Get details of a specific environment in a GitLab project',
  parameters: z.object({
    project_id: z.string().describe('Project ID or URL-encoded path'),
    environment_id: z.number().describe('Environment ID'),
  }),
  handler: async (params) => {
    const { pipelines } = createGitLabServices();
    const env = await pipelines.getEnvironment(
      params.project_id as string,
      params.environment_id as number,
    );
    return { content: [{ type: 'text', text: JSON.stringify(env, null, 2) }] };
  },
};

export const pipelineTools: ToolDefinition[] = [
  listPipelinesTool,
  getPipelineTool,
  listPipelineJobsTool,
  getJobLogTool,
  triggerPipelineTool,
  retryPipelineTool,
  cancelPipelineTool,
  getJobTool,
  retryJobTool,
  cancelJobTool,
  listEnvironmentsTool,
  getEnvironmentTool,
];
