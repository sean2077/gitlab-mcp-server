import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  parseRetryAfter,
  MAX_RETRY_AFTER_SECONDS,
  GitLabTimeoutError,
} from '../../src/gitlab-sdk/base.js';
import { GitLabUsersService } from '../../src/gitlab-sdk/users.js';
import { GitLabIssuesService } from '../../src/gitlab-sdk/issues.js';
import { GitLabMergeRequestsService } from '../../src/gitlab-sdk/merge-requests.js';
import { GitLabRepositoriesService } from '../../src/gitlab-sdk/repositories.js';
import { GitLabPipelinesService } from '../../src/gitlab-sdk/pipelines.js';

type FetchMock = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const jsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

describe('429 retry backoff is bounded (B2)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('caps large Retry-After values at MAX_RETRY_AFTER_SECONDS', () => {
    expect(parseRetryAfter('3600')).toBe(MAX_RETRY_AFTER_SECONDS);
    expect(parseRetryAfter(String(MAX_RETRY_AFTER_SECONDS + 100))).toBe(MAX_RETRY_AFTER_SECONDS);
  });

  it('returns small Retry-After values unchanged', () => {
    expect(parseRetryAfter('3')).toBe(3);
    expect(parseRetryAfter(null)).toBe(5);
    expect(parseRetryAfter('not-a-date')).toBe(5);
  });

  it('caps the actual retry sleep at the configured request timeout', async () => {
    vi.useFakeTimers();
    try {
      let calls = 0;
      const fetchMock = vi.fn<FetchMock>(async () => {
        calls += 1;
        if (calls === 1) {
          return new Response(null, { status: 429, headers: { 'Retry-After': '60' } });
        }
        return jsonResponse({ id: 1 });
      });
      vi.stubGlobal('fetch', fetchMock);

      // 1000ms timeout; an uncapped Retry-After: 60 would schedule a 60s sleep.
      const service = new GitLabUsersService('https://gitlab.example.com', 'token', 1000);
      const promise = service.getCurrentUser();

      // Advancing only by the request timeout must be enough for the retry to
      // fire — proving the backoff is bounded by this.timeout, not 60s.
      await vi.advanceTimersByTimeAsync(1000);
      expect(calls).toBe(2);

      await promise;
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('request timeout surfaces a clear error (B3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('throws GitLabTimeoutError when the request aborts', async () => {
    const fetchMock = vi.fn<FetchMock>((_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (signal?.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    // 10ms timeout so the abort fires quickly and deterministically.
    const service = new GitLabUsersService('https://gitlab.example.com', 'token', 10);
    await expect(service.getCurrentUser()).rejects.toBeInstanceOf(GitLabTimeoutError);
    await expect(service.getCurrentUser()).rejects.toThrow(/timed out after 10ms/i);
  });
});

describe('milestone_id null is normalized to 0 (Q1)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const bodyOf = (mock: ReturnType<typeof vi.fn>) =>
    JSON.parse(String(mock.mock.calls[0][1]?.body));

  it('sends milestone_id: 0 when updating an issue with null', async () => {
    const fetchMock = vi.fn<FetchMock>(async () => jsonResponse({ id: 1 }));
    vi.stubGlobal('fetch', fetchMock);
    const service = new GitLabIssuesService('https://gitlab.example.com', 'token');

    await service.updateIssue(1, 2, { milestone_id: null });
    expect(bodyOf(fetchMock).milestone_id).toBe(0);
  });

  it('passes through a real milestone_id and omits it when undefined (issue)', async () => {
    const withId = vi.fn<FetchMock>(async () => jsonResponse({ id: 1 }));
    vi.stubGlobal('fetch', withId);
    let service = new GitLabIssuesService('https://gitlab.example.com', 'token');
    await service.updateIssue(1, 2, { milestone_id: 7 });
    expect(bodyOf(withId).milestone_id).toBe(7);

    const noId = vi.fn<FetchMock>(async () => jsonResponse({ id: 1 }));
    vi.stubGlobal('fetch', noId);
    service = new GitLabIssuesService('https://gitlab.example.com', 'token');
    await service.updateIssue(1, 2, { title: 'rename' });
    expect('milestone_id' in bodyOf(noId)).toBe(false);
  });

  it('sends milestone_id: 0 when updating a merge request with null', async () => {
    const fetchMock = vi.fn<FetchMock>(async () => jsonResponse({ id: 1 }));
    vi.stubGlobal('fetch', fetchMock);
    const service = new GitLabMergeRequestsService('https://gitlab.example.com', 'token');

    await service.updateMergeRequest(1, 2, { milestone_id: null });
    expect(bodyOf(fetchMock).milestone_id).toBe(0);
  });
});

describe('createOrUpdateFile uses HEAD for existence (O2)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('HEAD 200 -> PUT (update existing file), without downloading content', async () => {
    const calls: Array<{ url: string; method?: string }> = [];
    const fetchMock = vi.fn<FetchMock>(async (input, init) => {
      calls.push({ url: String(input), method: init?.method });
      if (init?.method === 'HEAD') return new Response(null, { status: 200 });
      return jsonResponse({ file_path: 'docs/x.md', branch: 'main' });
    });
    vi.stubGlobal('fetch', fetchMock);

    const service = new GitLabRepositoriesService('https://gitlab.example.com', 'token');
    await service.createOrUpdateFile(1, 'docs/x.md', {
      branch: 'main',
      content: 'hi',
      commit_message: 'm',
    });

    expect(calls).toHaveLength(2);
    expect(calls[0].method).toBe('HEAD');
    expect(calls[0].url).toContain('/repository/files/docs%2Fx.md?ref=main');
    expect(calls[1].method).toBe('PUT');
  });

  it('HEAD 404 -> POST (create new file)', async () => {
    const calls: Array<{ method?: string }> = [];
    const fetchMock = vi.fn<FetchMock>(async (_input, init) => {
      calls.push({ method: init?.method });
      if (init?.method === 'HEAD') return new Response(null, { status: 404 });
      return jsonResponse({ file_path: 'new.md', branch: 'main' }, { status: 201 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const service = new GitLabRepositoriesService('https://gitlab.example.com', 'token');
    await service.createOrUpdateFile(1, 'new.md', {
      branch: 'main',
      content: 'hi',
      commit_message: 'm',
    });

    expect(calls[0].method).toBe('HEAD');
    expect(calls[1].method).toBe('POST');
  });
});

describe('array query params expand into repeated key[] (C1)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('expands pipeline job scope into repeated scope[] params', async () => {
    let capturedUrl = '';
    const fetchMock = vi.fn<FetchMock>(async (input) => {
      capturedUrl = String(input);
      return jsonResponse([], {
        headers: {
          'Content-Type': 'application/json',
          'X-Page': '1',
          'X-Total': '0',
          'X-Total-Pages': '1',
        },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const service = new GitLabPipelinesService('https://gitlab.example.com', 'token');
    await service.listPipelineJobs(1, 99, { scope: ['failed', 'success'] });

    expect(capturedUrl).toContain('scope%5B%5D=failed');
    expect(capturedUrl).toContain('scope%5B%5D=success');
  });
});
