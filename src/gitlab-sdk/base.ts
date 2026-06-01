import { getGitLabApiUrl, createHeaders, encodeProjectId } from '../config/api.js';
import type { PaginatedResponse } from '../types/index.js';

export { encodeProjectId };

export class GitLabApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'GitLabApiError';
  }
}

/** Thrown when a request exceeds the configured timeout and is aborted. */
export class GitLabTimeoutError extends Error {
  constructor(public readonly timeout: number, url: string) {
    super(`GitLab API request timed out after ${timeout}ms: ${url}`);
    this.name = 'GitLabTimeoutError';
  }
}

/**
 * Upper bound (seconds) we are willing to wait for a 429 Retry-After before
 * giving up the wait. Without this, a hostile or misconfigured server returning
 * `Retry-After: 3600` could block a single tool call far beyond the request
 * timeout. See parseRetryAfter.
 */
export const MAX_RETRY_AFTER_SECONDS = 60;

/**
 * Resolve the number of seconds to wait before retrying a 429, given the
 * `Retry-After` header. Accepts either a delta-seconds value or an HTTP date.
 * The result is always bounded to [1, MAX_RETRY_AFTER_SECONDS] so a single call
 * can never hang indefinitely on a large/abusive value.
 */
export function parseRetryAfter(header: string | null): number {
  let seconds = 5;

  if (header) {
    const parsedSeconds = Number(header);
    if (!Number.isNaN(parsedSeconds) && parsedSeconds > 0) {
      seconds = parsedSeconds;
    } else {
      const parsedDate = Date.parse(header);
      if (!Number.isNaN(parsedDate)) {
        const secondsUntilDate = Math.ceil((parsedDate - Date.now()) / 1000);
        seconds = secondsUntilDate > 0 ? secondsUntilDate : 5;
      }
    }
  }

  return Math.min(seconds, MAX_RETRY_AFTER_SECONDS);
}

export type QueryParamValue =
  | string
  | number
  | boolean
  | Array<string | number>
  | undefined
  | null;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

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

  /**
   * Single entry point for every HTTP call: applies the timeout, surfaces a
   * clear timeout error, retries once on 429 (bounded by parseRetryAfter), and
   * converts non-2xx responses into GitLabApiError via handleError.
   */
  protected async request(url: string, init?: RequestInit, retries = 1): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: { ...this.headers, ...init?.headers },
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new GitLabTimeoutError(this.timeout, url);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 429 && retries > 0) {
      // Bound the backoff by the request timeout too: a single tool call should
      // never wait longer than its configured timeout, even across a retry.
      const retryAfterMs = Math.min(parseRetryAfter(response.headers.get('Retry-After')) * 1000, this.timeout);
      await delay(retryAfterMs);
      return this.request(url, init, retries - 1);
    }

    if (!response.ok) {
      await this.handleError(response);
    }

    return response;
  }

  protected async fetchJson<T>(url: string, init?: RequestInit, retries = 1): Promise<T> {
    const response = await this.request(url, init, retries);
    return await response.json() as T;
  }

  protected async fetchText(url: string, init?: RequestInit, retries = 1): Promise<string> {
    const response = await this.request(url, init, retries);
    return await response.text();
  }

  /**
   * Build a query string from a param map. Array values are expanded into
   * repeated `key[]=...` entries (GitLab's array convention); undefined/null
   * values are skipped.
   */
  protected buildSearchParams(params: Record<string, QueryParamValue>): URLSearchParams {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== null) {
            searchParams.append(`${key}[]`, String(item));
          }
        }
      } else {
        searchParams.set(key, String(value));
      }
    }
    return searchParams;
  }

  protected parsePaginationHeaders(
    response: Response,
    fallbackPage: number,
  ): { page: number; total: number; totalPages: number } {
    const page = parseInt(response.headers.get('X-Page') || String(fallbackPage), 10);
    const xTotal = response.headers.get('X-Total');
    const xTotalPages = response.headers.get('X-Total-Pages');
    const xNextPage = response.headers.get('X-Next-Page');
    const total = xTotal ? parseInt(xTotal, 10) : -1;
    const totalPages = xTotalPages
      ? parseInt(xTotalPages, 10)
      : (xNextPage ? page + 1 : page);
    return { page, total, totalPages };
  }

  protected async fetchWithPagination<T>(
    endpoint: string,
    params: Record<string, QueryParamValue> = {},
    retries = 1,
  ): Promise<PaginatedResponse<T>> {
    const { page = 1, per_page = this.defaultPerPage, ...otherParams } = params;

    const searchParams = this.buildSearchParams({ page, per_page, ...otherParams });
    const url = `${this.apiUrl(endpoint)}?${searchParams.toString()}`;

    const response = await this.request(url, undefined, retries);
    const items = await response.json() as T[];
    const pagination = this.parsePaginationHeaders(response, typeof page === 'number' ? page : 1);

    return { items, total: pagination.total, page: pagination.page, totalPages: pagination.totalPages };
  }

  protected async handleError(response: Response): Promise<never> {
    let message = '';

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
        message = await response.text();
      }
    } catch {
      // Could not parse response body; fall back to a status-based message below.
    }

    if (!message) {
      switch (response.status) {
        case 401: message = 'Authentication failed. Check your GitLab token.'; break;
        case 403: message = 'Forbidden. Check your token scopes and permissions.'; break;
        case 404: message = 'Resource not found.'; break;
        case 409: message = 'Conflict.'; break;
        case 422: message = 'Validation failed.'; break;
        default: message = response.statusText || 'Request failed';
      }
    }

    throw new GitLabApiError(response.status, `GitLab API Error (${response.status}): ${message}`);
  }
}
