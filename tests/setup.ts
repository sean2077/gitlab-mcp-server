import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const testEnvPath = resolve(process.cwd(), 'tests/.env.test');
loadEnv({ path: testEnvPath });

export function getTestConfig() {
  const runIntegration = process.env.RUN_GITLAB_INTEGRATION === '1';
  const hasTestEnvFile = existsSync(testEnvPath);

  return {
    baseUrl: process.env.GITLAB_URL || '',
    token: process.env.GITLAB_TOKEN || '',
    isConfigured: runIntegration && hasTestEnvFile && !!(process.env.GITLAB_URL && process.env.GITLAB_TOKEN),
    testProjectId: process.env.TEST_PROJECT_ID || '',
    testIssueIid: process.env.TEST_ISSUE_IID ? parseInt(process.env.TEST_ISSUE_IID, 10) : 0,
    testMrIid: process.env.TEST_MR_IID ? parseInt(process.env.TEST_MR_IID, 10) : 0,
  };
}

export function skipIfNotConfigured(ctx: { skip: () => never }, ...conditions: boolean[]): void {
  const cfg = getTestConfig();
  if (!cfg.isConfigured || conditions.some(c => c)) {
    ctx.skip();
  }
}
