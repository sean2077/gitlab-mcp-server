import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(process.cwd(), 'tests/.env.test') });

export function getTestConfig() {
  return {
    baseUrl: process.env.GITLAB_URL || '',
    token: process.env.GITLAB_TOKEN || '',
    isConfigured: !!(process.env.GITLAB_URL && process.env.GITLAB_TOKEN),
    testProjectId: process.env.TEST_PROJECT_ID || '',
    testIssueIid: process.env.TEST_ISSUE_IID ? parseInt(process.env.TEST_ISSUE_IID, 10) : 0,
    testMrIid: process.env.TEST_MR_IID ? parseInt(process.env.TEST_MR_IID, 10) : 0,
  };
}

export function skipIfNotConfigured(): boolean {
  const cfg = getTestConfig();
  if (!cfg.isConfigured) {
    console.log('Skipping: configure GitLab credentials in tests/.env.test');
    return true;
  }
  return false;
}
