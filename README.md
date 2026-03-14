# GitLab MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server for GitLab integration, targeting **self-hosted GitLab instances** (tested with GitLab 18.2.0).

## Why this project?

GitLab [officially supports MCP](https://docs.gitlab.com/ee/user/gitlab_duo/mcp/) starting from **v18.6+**. If you're running an older self-hosted GitLab (e.g., 18.2.x), the official integration is not available. This project fills that gap — a standalone MCP server that works with older GitLab versions via the REST API v4.

**Use this if:**
- Your self-hosted GitLab is on a version **before 18.6**
- You want a lightweight, dependency-free MCP server you can customize
- You need tools not yet covered by the official GitLab MCP integration

**Use the official GitLab MCP if:**
- Your instance is on GitLab **18.6+**
- You prefer vendor-supported, built-in integration

## Highlights

- **MCP client compatible** — robust type coercion handles string-typed numbers, booleans, and JSON-encoded arrays from any MCP client
- **Response-size optimized** — list endpoints default to `simple=true`, group details default to `with_projects=false`, preventing token overflow in LLM conversations
- **Resilient** — automatic retry on 429 (rate limit) with Retry-After, configurable timeouts, unified error messages
- **Zero runtime dependencies** beyond `@modelcontextprotocol/sdk` and `zod`

## Features (87 tools)

- **Users** (3): get current user, search users, get user by ID
- **Projects** (14): list, get, search, create, update, fork, list members, list/create/update labels, list/create/update milestones, get events
- **Issues** (7): list, get, create, update, list/create notes, list discussions
- **Merge Requests** (17): list, get, create, update, merge, get diffs/commits, list/create/update notes, approve/unapprove*, rebase, list/create discussions, set/cancel auto-merge
- **Repositories** (16): list/create/delete branches, get file, create/update file, push multiple files, list tree, compare branches, list commits, list/create tags, list/protect/unprotect branches, list/create releases
- **Pipelines & Jobs** (12): list/get/trigger/retry/cancel pipelines, list pipeline jobs, get/retry/cancel jobs, get job log, list/get environments
- **Groups** (8): list, get, create, update, delete, list projects, list members, list subgroups
- **Wikis** (10): list/get/create/edit/delete project wiki pages, list/get/create/edit/delete group wiki pages

> \* approve/unapprove and `code_owner_approval_required` in branch protection require GitLab Premium/Ultimate.

## Quick Start

```bash
npm install
npm run build
```

### Configure in Claude Code

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "gitlab": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/gitlab-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_URL": "https://gitlab.example.com",
        "GITLAB_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITLAB_URL` | Yes | `https://gitlab.com` | GitLab instance URL |
| `GITLAB_TOKEN` | Yes | - | Personal Access Token |
| `GITLAB_REQUEST_TIMEOUT` | No | `30000` | Request timeout (ms) |
| `GITLAB_DEFAULT_PER_PAGE` | No | `20` | Default page size |

## Development

```bash
npm run dev      # Run with tsx (hot reload)
npm run build    # Compile TypeScript
npm test         # Run tests
npm test:watch   # Watch mode
```

### Testing

Copy `tests/.env.test.example` to `tests/.env.test` and fill in your GitLab credentials:

```bash
cp tests/.env.test.example tests/.env.test
# Edit tests/.env.test with your credentials
npm test
```

## Architecture

Three-layer architecture:

```
src/
├── config/         # Environment config, API URL/header helpers
├── gitlab-sdk/     # Service classes per domain (users, projects, issues, etc.)
│   └── base.ts     # Base class: fetch, pagination, error handling, 429 retry
├── tools/          # MCP tool definitions (Zod schema + handler per domain)
├── types/          # TypeScript type definitions
└── utils/          # Auth service factory, Zod type-coercion helpers
```

## License

MIT
