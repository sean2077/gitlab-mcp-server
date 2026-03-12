export interface GitLabConfig {
  baseUrl: string;
  token: string;
  requestTimeout: number;
  defaultPerPage: number;
}

export function getConfig(): GitLabConfig {
  const token = process.env.GITLAB_TOKEN;
  if (!token) {
    throw new Error('GITLAB_TOKEN environment variable is not set');
  }

  const baseUrl = (process.env.GITLAB_URL || 'https://gitlab.com').replace(/\/$/, '');

  return {
    baseUrl,
    token,
    requestTimeout: parseInt(process.env.GITLAB_REQUEST_TIMEOUT || '30000', 10),
    defaultPerPage: parseInt(process.env.GITLAB_DEFAULT_PER_PAGE || '20', 10),
  };
}
