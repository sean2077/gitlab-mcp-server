import { afterEach, describe, expect, it, vi } from 'vitest';
import { GitLabRepositoriesService } from '../../src/gitlab-sdk/repositories.js';
import { GitLabMergeRequestsService } from '../../src/gitlab-sdk/merge-requests.js';
import { parseRetryAfter } from '../../src/gitlab-sdk/base.js';

describe('GitLab SDK utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('parses Retry-After seconds and HTTP dates', () => {
    vi.setSystemTime(new Date('2026-05-28T00:00:00.000Z'));

    expect(parseRetryAfter('3')).toBe(3);
    expect(parseRetryAfter('Thu, 28 May 2026 00:00:04 GMT')).toBe(4);
    expect(parseRetryAfter('not-a-date')).toBe(5);
    expect(parseRetryAfter(null)).toBe(5);
  });

  it('uses a commit move action when renaming a single file', async () => {
    const fetchMock = vi.fn<(
      input: string | URL | Request,
      init?: RequestInit,
    ) => Promise<Response>>(async () => new Response(JSON.stringify({
      id: 'abcdef',
      short_id: 'abcdef',
      title: 'Rename file',
      author_name: 'Test User',
      created_at: '2026-05-28T00:00:00.000Z',
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const service = new GitLabRepositoriesService('https://gitlab.example.com', 'token');
    await service.createOrUpdateFile(123, 'docs/new.md', {
      branch: 'main',
      content: '# New',
      commit_message: 'Rename doc',
      previous_path: 'docs/old.md',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://gitlab.example.com/api/v4/projects/123/repository/commits');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      branch: 'main',
      commit_message: 'Rename doc',
      actions: [{
        action: 'move',
        file_path: 'docs/new.md',
        previous_path: 'docs/old.md',
        content: '# New',
      }],
    });
  });

  it('uses GitLab HEAD ref for default-branch file reads', async () => {
    const fetchMock = vi.fn<(
      input: string | URL | Request,
      init?: RequestInit,
    ) => Promise<Response>>(async () => new Response(JSON.stringify({
      file_name: 'README.md',
      file_path: 'README.md',
      size: 7,
      encoding: 'base64',
      content: Buffer.from('content').toString('base64'),
      ref: 'HEAD',
      blob_id: 'blob',
      commit_id: 'commit',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const service = new GitLabRepositoriesService('https://gitlab.example.com', 'token');
    const result = await service.getFile(123, 'README.md');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://gitlab.example.com/api/v4/projects/123/repository/files/README.md?ref=HEAD');
    expect(result.content).toBe('content');
    expect(result.encoding).toBe('utf-8');
  });

  it('uses the non-deprecated auto_merge flag for set-auto-merge', async () => {
    const fetchMock = vi.fn<(
      input: string | URL | Request,
      init?: RequestInit,
    ) => Promise<Response>>(async () => new Response(JSON.stringify({
      id: 1,
      iid: 2,
      project_id: 123,
      title: 'MR',
      description: null,
      state: 'opened',
      author: { id: 1, name: 'Test User', username: 'test' },
      assignees: [],
      source_branch: 'feature',
      target_branch: 'main',
      web_url: 'https://gitlab.example.com/group/project/-/merge_requests/2',
      created_at: '2026-05-28T00:00:00.000Z',
      updated_at: '2026-05-28T00:00:00.000Z',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const service = new GitLabMergeRequestsService('https://gitlab.example.com', 'token');
    await service.setAutoMerge(123, 2, { squash: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://gitlab.example.com/api/v4/projects/123/merge_requests/2/merge');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      squash: true,
      auto_merge: true,
    });
  });
});
