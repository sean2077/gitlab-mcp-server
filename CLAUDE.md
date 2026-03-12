# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitLab MCP Server — a Model Context Protocol server for self-hosted GitLab (v18.2.0+). Provides 87 tools across 8 domains: users, projects, issues, merge requests, repositories, pipelines, groups, wikis.

## Commands

```bash
npm run build          # tsc → dist/
npm run dev            # tsx src/index.ts (stdio mode)
npm start              # node dist/index.js
npm test               # vitest run (all tests)
npm run test:watch     # vitest watch mode
npx vitest run tests/integration/users.test.ts  # single test file
```

No linter configured — `npm run build` is the primary verification step. Always run it after changes.

Tests are integration tests against a real GitLab API. Without `tests/.env.test` credentials, all tests skip gracefully. Test env vars: `GITLAB_URL`, `GITLAB_TOKEN`, `TEST_PROJECT_ID`, `TEST_ISSUE_IID`, `TEST_MR_IID`.

## Architecture

Three layers: **config** → **gitlab-sdk** → **tools**, wired together in `index.ts`.

```
config/index.ts    getConfig() reads env vars → { baseUrl, token, timeout, perPage }
config/api.ts      getGitLabApiUrl(), createHeaders(), encodeProjectId()
       ↓
gitlab-sdk/base.ts  BaseGitLabService — fetchJson(), fetchText(), fetchWithPagination()
                    handles 429 retry (Retry-After header), unified error parsing, timeouts
gitlab-sdk/*.ts     Domain services extend BaseGitLabService (one file per domain)
       ↓
tools/*.ts          ToolDefinition[] arrays — { name, description, parameters: ZodObject, handler }
       ↓
index.ts            Collects all tool arrays → registers via McpServer.registerTool()
utils/auth.ts       createGitLabServices() factory — lazy per-request instantiation
types/index.ts      Zod schemas for API responses + PaginatedResponse<T> + ToolDefinition interface
```

### Data flow for a tool call

1. MCP SDK dispatches to registered handler
2. Handler calls `createGitLabServices()` → reads config, instantiates all service classes
3. Service method calls `fetchJson()`/`fetchWithPagination()` → GitLab REST API v4
4. Response returned as `{ content: [{ type: 'text', text: JSON.stringify(...) }] }`

### Adding a new tool

1. If the GitLab API response needs a new type, add a Zod schema to `types/index.ts`
2. Add method to the appropriate `gitlab-sdk/*.ts` service class
3. Add `ToolDefinition` in corresponding `tools/*.ts` with Zod input schema + handler
4. Add to the domain's exported tool array (e.g., `projectTools`)
5. Auto-registered — `index.ts` spreads all tool arrays into `allTools`

If adding a new domain: also create the service class, add it to `GitLabServices` interface and `createGitLabServices()` in `utils/auth.ts`, import the tool array in `index.ts`.

### Key conventions

- `encodeProjectId()` handles numeric IDs (`123`) and path format (`group/project` → URL-encoded)
- Wiki APIs return arrays directly (not paginated); all other list endpoints use `fetchWithPagination()` which reads `X-Total`/`X-Total-Pages` headers
- Group IDs use `typeof groupId === 'number' ? String(groupId) : encodeURIComponent(groupId)` inline (not `encodeProjectId`)
- Approve/unapprove MR and `code_owner_approval_required` in branch protection require GitLab Premium/Ultimate

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `GITLAB_URL` | Yes | `https://gitlab.com` |
| `GITLAB_TOKEN` | Yes | — |
| `GITLAB_REQUEST_TIMEOUT` | No | `30000` |
| `GITLAB_DEFAULT_PER_PAGE` | No | `20` |

## Gotchas

- **ESM `.js` imports**: All local imports must use `.js` extension (e.g., `import { ... } from './base.js'`), even though source files are `.ts`. This is required by NodeNext module resolution.
- **No linter**: TypeScript compilation (`npm run build`) is the only code quality check. No ESLint/Prettier configured.

## Tech Stack

- TypeScript strict mode, ES2022 target, NodeNext modules
- `@modelcontextprotocol/sdk` (StdioServerTransport)
- `zod` for input validation (schemas serve as both validation and MCP tool input schemas)
- `vitest` for testing, `tsx` for dev, `dotenv` for test config
