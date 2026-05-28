import { describe, expect, it } from 'vitest';
import { listGroupsTool, getGroupTool, listGroupProjectsTool, listGroupSubgroupsTool } from '../../src/tools/groups.js';
import { getProjectTool } from '../../src/tools/projects.js';
import { searchUsersTool } from '../../src/tools/users.js';

describe('tool input schemas', () => {
  it('accepts string booleans for user filters', () => {
    const parsed = searchUsersTool.parameters.parse({
      active: 'false',
      blocked: 'true',
    });

    expect(parsed.active).toBe(false);
    expect(parsed.blocked).toBe(true);
  });

  it('accepts string booleans for group filters', () => {
    expect(listGroupsTool.parameters.parse({
      owned: 'true',
      archived: 'false',
      top_level_only: 'false',
    })).toMatchObject({ owned: true, archived: false, top_level_only: false });

    expect(getGroupTool.parameters.parse({
      group_id: 'platform',
      with_projects: 'false',
    })).toMatchObject({ group_id: 'platform', with_projects: false });

    expect(listGroupProjectsTool.parameters.parse({
      group_id: 'platform',
      archived: 'false',
      include_subgroups: 'true',
      simple: 'false',
    })).toMatchObject({
      group_id: 'platform',
      archived: false,
      include_subgroups: true,
      simple: false,
    });

    expect(listGroupSubgroupsTool.parameters.parse({
      group_id: 'platform',
      owned: 'false',
    })).toMatchObject({ group_id: 'platform', owned: false });
  });

  it('accepts numeric project and group IDs from native JSON clients', () => {
    expect(getProjectTool.parameters.parse({ project_id: 123 })).toEqual({ project_id: '123' });
    expect(getGroupTool.parameters.parse({ group_id: 456 })).toMatchObject({
      group_id: '456',
      with_projects: false,
    });
  });

  it('keeps project and group IDs required', () => {
    expect(() => getProjectTool.parameters.parse({})).toThrow();
    expect(() => getGroupTool.parameters.parse({})).toThrow();
  });

  it('bounds pagination inputs before API calls', () => {
    expect(searchUsersTool.parameters.parse({ page: '2', per_page: '100' })).toMatchObject({
      page: 2,
      per_page: 100,
    });
    expect(() => searchUsersTool.parameters.parse({ page: '0' })).toThrow();
    expect(() => searchUsersTool.parameters.parse({ per_page: '101' })).toThrow();
  });
});
