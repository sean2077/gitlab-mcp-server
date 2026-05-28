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

  const rawBaseUrl = process.env.GITLAB_URL?.trim();
  if (!rawBaseUrl) {
    throw new Error('GITLAB_URL environment variable is not set');
  }

  let parsedBaseUrl: URL;
  try {
    parsedBaseUrl = new URL(rawBaseUrl);
  } catch {
    throw new Error('GITLAB_URL must be a valid URL');
  }

  if (!['http:', 'https:'].includes(parsedBaseUrl.protocol)) {
    throw new Error('GITLAB_URL must use http or https');
  }

  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  const rawTimeout = parseInt(process.env.GITLAB_REQUEST_TIMEOUT || '30000', 10);
  const rawPerPage = parseInt(process.env.GITLAB_DEFAULT_PER_PAGE || '20', 10);

  return {
    baseUrl,
    token,
    requestTimeout: isNaN(rawTimeout) || rawTimeout <= 0 ? 30000 : rawTimeout,
    defaultPerPage: isNaN(rawPerPage) || rawPerPage <= 0 ? 20 : rawPerPage,
  };
}
