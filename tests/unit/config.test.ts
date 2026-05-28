import { afterEach, describe, expect, it, vi } from 'vitest';
import { getConfig } from '../../src/config/index.js';

describe('getConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('requires an explicit GitLab URL', () => {
    vi.stubEnv('GITLAB_TOKEN', 'token');
    vi.stubEnv('GITLAB_URL', '');

    expect(() => getConfig()).toThrow('GITLAB_URL environment variable is not set');
  });

  it('rejects non-http GitLab URLs', () => {
    vi.stubEnv('GITLAB_TOKEN', 'token');
    vi.stubEnv('GITLAB_URL', 'file:///tmp/gitlab');

    expect(() => getConfig()).toThrow('GITLAB_URL must use http or https');
  });

  it('normalizes a valid GitLab URL', () => {
    vi.stubEnv('GITLAB_TOKEN', 'token');
    vi.stubEnv('GITLAB_URL', 'https://gitlab.example.com/gitlab/');

    expect(getConfig()).toMatchObject({
      baseUrl: 'https://gitlab.example.com/gitlab',
      token: 'token',
      requestTimeout: 30000,
      defaultPerPage: 20,
    });
  });
});
