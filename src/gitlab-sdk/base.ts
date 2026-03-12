import { getGitLabApiUrl, createHeaders, encodeProjectId } from '../config/api.js';
import type { PaginatedResponse } from '../types/index.js';

export { encodeProjectId };

export class BaseGitLabService {
  protected baseUrl: string;
  protected token: string;
  protected timeout: number;
  protected defaultPerPage: number;
  protected headers: Record<string, string>;

  constructor(baseUrl: string, token: string, timeout = 30000, defaultPerPage = 20) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.timeout = timeout;
    this.defaultPerPage = defaultPerPage;
    this.headers = createHeaders(token);
  }

  protected apiUrl(endpoint: string): string {
    return getGitLabApiUrl(this.baseUrl, endpoint);
  }

  protected async fetchJson<T>(url: string, init?: RequestInit, retries = 1): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        headers: { ...this.headers, ...init?.headers },
        signal: controller.signal,
      });

      if (response.status === 429 && retries > 0) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.fetchJson<T>(url, init, retries - 1);
      }

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json() as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  protected async fetchText(url: string, init?: RequestInit, retries = 1): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        headers: { ...this.headers, ...init?.headers },
        signal: controller.signal,
      });

      if (response.status === 429 && retries > 0) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.fetchText(url, init, retries - 1);
      }

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  protected async fetchWithPagination<T>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined> = {},
    retries = 1,
  ): Promise<PaginatedResponse<T>> {
    const { page = 1, per_page = this.defaultPerPage, ...otherParams } = params;

    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('per_page', String(per_page));

    for (const [key, value] of Object.entries(otherParams)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }

    const url = `${this.apiUrl(endpoint)}?${searchParams.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        headers: this.headers,
        signal: controller.signal,
      });

      if (response.status === 429 && retries > 0) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.fetchWithPagination<T>(endpoint, params, retries - 1);
      }

      if (!response.ok) {
        await this.handleError(response);
      }

      const items = await response.json() as T[];
      const total = parseInt(response.headers.get('X-Total') || '0', 10);
      const totalPages = parseInt(response.headers.get('X-Total-Pages') || '1', 10);
      const currentPage = parseInt(response.headers.get('X-Page') || String(page), 10);

      return { items, total, page: currentPage, totalPages };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  protected async handleError(response: Response): Promise<never> {
    let message = response.statusText;

    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json() as Record<string, unknown>;
        if (typeof errorData.message === 'string') {
          message = errorData.message;
        } else if (typeof errorData.message === 'object' && errorData.message !== null) {
          const nested = errorData.message as Record<string, unknown>;
          message = Object.entries(nested)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('; ');
        } else if (typeof errorData.error === 'string') {
          message = errorData.error;
        }
      } else {
        message = await response.text() || message;
      }
    } catch {
      // Could not parse response body, use statusText
    }

    switch (response.status) {
      case 401: message = message || 'Authentication failed. Check your GitLab token.'; break;
      case 403: message = message || 'Forbidden. Check your token scopes and permissions.'; break;
      case 404: message = message || 'Resource not found.'; break;
      case 409: message = message || 'Conflict.'; break;
      case 422: message = message || 'Validation failed.'; break;
    }

    throw new Error(`GitLab API Error (${response.status}): ${message}`);
  }
}
