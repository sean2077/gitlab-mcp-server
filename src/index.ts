#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SERVER_CONFIG } from './config/api.js';
import type { ToolDefinition } from './types/index.js';

// Import all tool definitions
import { userTools } from './tools/users.js';
import { projectTools } from './tools/projects.js';
import { issueTools } from './tools/issues.js';
import { mergeRequestTools } from './tools/merge-requests.js';
import { repositoryTools } from './tools/repositories.js';
import { pipelineTools } from './tools/pipelines.js';
import { groupTools } from './tools/groups.js';
import { wikiTools } from './tools/wikis.js';

// Collect all tools
const allTools: ToolDefinition[] = [
  ...userTools,
  ...projectTools,
  ...issueTools,
  ...mergeRequestTools,
  ...repositoryTools,
  ...pipelineTools,
  ...groupTools,
  ...wikiTools,
];

// Create MCP server
const server = new McpServer(SERVER_CONFIG);

// Register all tools using registerTool (non-deprecated API)
for (const tool of allTools) {
  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: tool.parameters,
    },
    async (params) => {
      try {
        return await tool.handler(params as Record<string, unknown>);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Failed to start GitLab MCP server:', error);
  process.exit(1);
});
