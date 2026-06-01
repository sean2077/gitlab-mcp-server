import { getConfig } from '../config/index.js';
import { GitLabUsersService } from '../gitlab-sdk/users.js';
import { GitLabProjectsService } from '../gitlab-sdk/projects.js';
import { GitLabIssuesService } from '../gitlab-sdk/issues.js';
import { GitLabMergeRequestsService } from '../gitlab-sdk/merge-requests.js';
import { GitLabRepositoriesService } from '../gitlab-sdk/repositories.js';
import { GitLabPipelinesService } from '../gitlab-sdk/pipelines.js';
import { GitLabGroupsService } from '../gitlab-sdk/groups.js';
import { GitLabWikisService } from '../gitlab-sdk/wikis.js';

export interface GitLabServices {
  users: GitLabUsersService;
  projects: GitLabProjectsService;
  issues: GitLabIssuesService;
  mergeRequests: GitLabMergeRequestsService;
  repositories: GitLabRepositoriesService;
  pipelines: GitLabPipelinesService;
  groups: GitLabGroupsService;
  wikis: GitLabWikisService;
}

let cachedServices: GitLabServices | null = null;

/**
 * Build (once) and return the GitLab service singletons. Services are stateless
 * for the process lifetime, so we memoize them: this avoids re-reading/parsing
 * the environment config and re-constructing all eight services on every tool
 * call. Config validation is still deferred to the first call (first tool use).
 */
export function createGitLabServices(): GitLabServices {
  if (cachedServices) {
    return cachedServices;
  }

  const config = getConfig();
  const { baseUrl, token, requestTimeout, defaultPerPage } = config;

  cachedServices = {
    users: new GitLabUsersService(baseUrl, token, requestTimeout, defaultPerPage),
    projects: new GitLabProjectsService(baseUrl, token, requestTimeout, defaultPerPage),
    issues: new GitLabIssuesService(baseUrl, token, requestTimeout, defaultPerPage),
    mergeRequests: new GitLabMergeRequestsService(baseUrl, token, requestTimeout, defaultPerPage),
    repositories: new GitLabRepositoriesService(baseUrl, token, requestTimeout, defaultPerPage),
    pipelines: new GitLabPipelinesService(baseUrl, token, requestTimeout, defaultPerPage),
    groups: new GitLabGroupsService(baseUrl, token, requestTimeout, defaultPerPage),
    wikis: new GitLabWikisService(baseUrl, token, requestTimeout, defaultPerPage),
  };

  return cachedServices;
}

/** Reset memoized services. Intended for tests that stub env/config. */
export function resetGitLabServices(): void {
  cachedServices = null;
}
