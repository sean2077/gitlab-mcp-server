export const SERVER_CONFIG = {
  name: 'gitlab-mcp-server',
  version: '1.0.0',
};

export function getGitLabApiUrl(baseUrl: string, endpoint: string): string {
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/api/v4/${cleanEndpoint}`;
}

export function createHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function encodeProjectId(projectId: string | number): string {
  if (/^\d+$/.test(String(projectId))) return String(projectId);
  return encodeURIComponent(String(projectId));
}
