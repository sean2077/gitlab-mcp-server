import { z } from 'zod';

// ============================================================================
// Common Types
// ============================================================================

export const GitLabUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  avatar_url: z.string().optional(),
  web_url: z.string().optional(),
});

export type GitLabUser = z.infer<typeof GitLabUserSchema>;

export const GitLabUserDetailSchema = GitLabUserSchema.extend({
  email: z.string().optional(),
  state: z.string().optional(),
  is_admin: z.boolean().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  public_email: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  organization: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  created_at: z.string().optional(),
  last_sign_in_at: z.string().nullable().optional(),
  two_factor_enabled: z.boolean().optional(),
});

export type GitLabUserDetail = z.infer<typeof GitLabUserDetailSchema>;

// ============================================================================
// Project Types
// ============================================================================

export const GitLabProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  web_url: z.string(),
  default_branch: z.string(),
  visibility: z.enum(['private', 'internal', 'public']),
  ssh_url_to_repo: z.string(),
  http_url_to_repo: z.string(),
  readme_url: z.string().nullable().optional(),
  forks_count: z.number().optional(),
  star_count: z.number().optional(),
  created_at: z.string(),
  last_activity_at: z.string(),
});

export type GitLabProject = z.infer<typeof GitLabProjectSchema>;

export const GitLabProjectDetailSchema = GitLabProjectSchema.extend({
  path: z.string().optional(),
  path_with_namespace: z.string().optional(),
  issues_enabled: z.boolean().optional(),
  merge_requests_enabled: z.boolean().optional(),
  wiki_enabled: z.boolean().optional(),
  jobs_enabled: z.boolean().optional(),
  namespace: z.object({
    id: z.number(),
    name: z.string(),
    path: z.string(),
    kind: z.string(),
    full_path: z.string(),
    web_url: z.string().optional(),
  }).optional(),
  open_issues_count: z.number().optional(),
  archived: z.boolean().optional(),
});

export type GitLabProjectDetail = z.infer<typeof GitLabProjectDetailSchema>;

// ============================================================================
// Issue Types
// ============================================================================

export const GitLabIssueSchema = z.object({
  id: z.number(),
  iid: z.number(),
  project_id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  state: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
  labels: z.array(z.union([z.string(), z.object({ name: z.string() })])),
  milestone: z.object({
    id: z.number(),
    iid: z.number(),
    title: z.string(),
    state: z.string(),
    due_date: z.string().nullable(),
    web_url: z.string(),
  }).nullable().optional(),
  assignees: z.array(GitLabUserSchema),
  author: GitLabUserSchema,
  user_notes_count: z.number().optional(),
  due_date: z.string().nullable().optional(),
  confidential: z.boolean().optional(),
  web_url: z.string(),
});

export type GitLabIssue = z.infer<typeof GitLabIssueSchema>;

// ============================================================================
// Merge Request Types
// ============================================================================

export const GitLabMergeRequestSchema = z.object({
  id: z.number(),
  iid: z.number(),
  project_id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  state: z.string(),
  merged: z.boolean().optional(),
  author: GitLabUserSchema,
  assignees: z.array(GitLabUserSchema),
  source_branch: z.string(),
  target_branch: z.string(),
  diff_refs: z.object({
    base_sha: z.string(),
    head_sha: z.string(),
    start_sha: z.string(),
  }).nullable().optional(),
  web_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  merged_at: z.string().nullable().optional(),
  closed_at: z.string().nullable().optional(),
  merge_commit_sha: z.string().nullable().optional(),
});

export type GitLabMergeRequest = z.infer<typeof GitLabMergeRequestSchema>;

export const GitLabMergeRequestChangesSchema = GitLabMergeRequestSchema.extend({
  changes: z.array(z.object({
    old_path: z.string(),
    new_path: z.string(),
    new_file: z.boolean(),
    renamed_file: z.boolean(),
    deleted_file: z.boolean(),
    diff: z.string(),
  })),
  changes_count: z.string().optional(),
  overflow: z.boolean().optional(),
});

export type GitLabMergeRequestChanges = z.infer<typeof GitLabMergeRequestChangesSchema>;

// ============================================================================
// Note / Discussion Types
// ============================================================================

export const GitLabNoteSchema = z.object({
  id: z.number(),
  body: z.string(),
  author: z.lazy(() => GitLabUserSchema),
  created_at: z.string(),
  updated_at: z.string(),
  system: z.boolean(),
  noteable_id: z.number(),
  noteable_type: z.string(),
  resolvable: z.boolean().optional(),
  internal: z.boolean().optional(),
});

export type GitLabNote = z.infer<typeof GitLabNoteSchema>;

// ============================================================================
// Branch / Repository Types
// ============================================================================

export const GitLabBranchSchema = z.object({
  name: z.string(),
  commit: z.object({
    id: z.string(),
    short_id: z.string(),
    title: z.string(),
    created_at: z.string(),
    message: z.string().optional(),
    author_name: z.string().optional(),
    web_url: z.string().optional(),
  }),
  merged: z.boolean().optional(),
  protected: z.boolean(),
  default: z.boolean().optional(),
  web_url: z.string().optional(),
});

export type GitLabBranch = z.infer<typeof GitLabBranchSchema>;

export const GitLabTreeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['tree', 'blob']),
  path: z.string(),
  mode: z.string(),
});

export type GitLabTreeItem = z.infer<typeof GitLabTreeItemSchema>;

export const GitLabFileContentSchema = z.object({
  file_name: z.string(),
  file_path: z.string(),
  size: z.number(),
  encoding: z.string(),
  content: z.string(),
  ref: z.string(),
  blob_id: z.string(),
  commit_id: z.string(),
});

export type GitLabFileContent = z.infer<typeof GitLabFileContentSchema>;

export const GitLabCompareResultSchema = z.object({
  commits: z.array(z.object({
    id: z.string(),
    short_id: z.string(),
    title: z.string(),
    author_name: z.string(),
    created_at: z.string(),
  })),
  diffs: z.array(z.object({
    old_path: z.string(),
    new_path: z.string(),
    new_file: z.boolean(),
    renamed_file: z.boolean(),
    deleted_file: z.boolean(),
    diff: z.string(),
  })),
  compare_timeout: z.boolean().optional(),
  compare_same_ref: z.boolean().optional(),
});

export type GitLabCompareResult = z.infer<typeof GitLabCompareResultSchema>;

// ============================================================================
// Pipeline / Job Types
// ============================================================================

export const GitLabPipelineSchema = z.object({
  id: z.number(),
  iid: z.number().optional(),
  project_id: z.number().optional(),
  sha: z.string(),
  ref: z.string(),
  status: z.string(),
  source: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  web_url: z.string(),
  duration: z.number().nullable().optional(),
  queued_duration: z.number().nullable().optional(),
});

export type GitLabPipeline = z.infer<typeof GitLabPipelineSchema>;

export const GitLabJobSchema = z.object({
  id: z.number(),
  status: z.string(),
  stage: z.string(),
  name: z.string(),
  ref: z.string(),
  created_at: z.string(),
  started_at: z.string().nullable().optional(),
  finished_at: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  queued_duration: z.number().nullable().optional(),
  web_url: z.string(),
  pipeline: z.object({
    id: z.number(),
    ref: z.string(),
    sha: z.string(),
    status: z.string(),
  }).optional(),
  failure_reason: z.string().optional(),
});

export type GitLabJob = z.infer<typeof GitLabJobSchema>;

// ============================================================================
// Discussion Types
// ============================================================================

export const GitLabDiscussionNoteSchema = z.object({
  id: z.number(),
  body: z.string(),
  author: GitLabUserSchema,
  created_at: z.string(),
  updated_at: z.string(),
  system: z.boolean(),
  resolvable: z.boolean().optional(),
  resolved: z.boolean().optional(),
  position: z.object({
    base_sha: z.string(),
    start_sha: z.string(),
    head_sha: z.string(),
    position_type: z.string(),
    old_path: z.string().optional(),
    new_path: z.string().optional(),
    old_line: z.number().nullable().optional(),
    new_line: z.number().nullable().optional(),
  }).optional(),
});

export type GitLabDiscussionNote = z.infer<typeof GitLabDiscussionNoteSchema>;

export const GitLabDiscussionSchema = z.object({
  id: z.string(),
  individual_note: z.boolean(),
  notes: z.array(GitLabDiscussionNoteSchema),
});

export type GitLabDiscussion = z.infer<typeof GitLabDiscussionSchema>;

// ============================================================================
// Commit Types
// ============================================================================

export const GitLabCommitSchema = z.object({
  id: z.string(),
  short_id: z.string(),
  title: z.string(),
  author_name: z.string(),
  author_email: z.string().optional(),
  created_at: z.string(),
  message: z.string().optional(),
  committed_date: z.string().optional(),
  web_url: z.string().optional(),
  stats: z.object({
    additions: z.number(),
    deletions: z.number(),
    total: z.number(),
  }).optional(),
});

export type GitLabCommit = z.infer<typeof GitLabCommitSchema>;

// ============================================================================
// Tag Types
// ============================================================================

export const GitLabTagSchema = z.object({
  name: z.string(),
  message: z.string().nullable().optional(),
  target: z.string().optional(),
  commit: z.object({
    id: z.string(),
    short_id: z.string(),
    title: z.string(),
    created_at: z.string(),
    author_name: z.string().optional(),
  }).optional(),
  release: z.object({
    tag_name: z.string(),
    description: z.string().nullable(),
  }).nullable().optional(),
  protected: z.boolean().optional(),
});

export type GitLabTag = z.infer<typeof GitLabTagSchema>;

// ============================================================================
// Group Types
// ============================================================================

export const GitLabGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  path: z.string(),
  description: z.string().nullable().optional(),
  visibility: z.string().optional(),
  full_name: z.string().optional(),
  full_path: z.string().optional(),
  web_url: z.string(),
  parent_id: z.number().nullable().optional(),
  created_at: z.string().optional(),
});

export type GitLabGroup = z.infer<typeof GitLabGroupSchema>;

// ============================================================================
// Member Types
// ============================================================================

export const GitLabMemberSchema = GitLabUserSchema.extend({
  access_level: z.number(),
  expires_at: z.string().nullable().optional(),
  membership_state: z.string().optional(),
});

export type GitLabMember = z.infer<typeof GitLabMemberSchema>;

// ============================================================================
// Label Types
// ============================================================================

export const GitLabLabelSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  text_color: z.string().optional(),
  description: z.string().nullable().optional(),
  description_html: z.string().optional(),
  open_issues_count: z.number().optional(),
  closed_issues_count: z.number().optional(),
  open_merge_requests_count: z.number().optional(),
  subscribed: z.boolean().optional(),
  priority: z.number().nullable().optional(),
  is_project_label: z.boolean().optional(),
});

export type GitLabLabel = z.infer<typeof GitLabLabelSchema>;

// ============================================================================
// Milestone Types
// ============================================================================

export const GitLabMilestoneSchema = z.object({
  id: z.number(),
  iid: z.number(),
  project_id: z.number().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  state: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  due_date: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  expired: z.boolean().optional(),
  web_url: z.string().optional(),
});

export type GitLabMilestone = z.infer<typeof GitLabMilestoneSchema>;

// ============================================================================
// Protected Branch Types
// ============================================================================

export const GitLabProtectedBranchSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  push_access_levels: z.array(z.object({
    access_level: z.number(),
    access_level_description: z.string().optional(),
  })).optional(),
  merge_access_levels: z.array(z.object({
    access_level: z.number(),
    access_level_description: z.string().optional(),
  })).optional(),
  allow_force_push: z.boolean().optional(),
  code_owner_approval_required: z.boolean().optional(),
});

export type GitLabProtectedBranch = z.infer<typeof GitLabProtectedBranchSchema>;

// ============================================================================
// Release Types
// ============================================================================

export const GitLabReleaseSchema = z.object({
  tag_name: z.string(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  created_at: z.string().optional(),
  released_at: z.string().optional(),
  upcoming_release: z.boolean().optional(),
  author: GitLabUserSchema.optional(),
  commit: z.object({
    id: z.string(),
    short_id: z.string(),
    title: z.string(),
    created_at: z.string(),
  }).optional(),
  assets: z.object({
    count: z.number().optional(),
    sources: z.array(z.object({
      format: z.string(),
      url: z.string(),
    })).optional(),
    links: z.array(z.object({
      id: z.number(),
      name: z.string(),
      url: z.string(),
      link_type: z.string().optional(),
    })).optional(),
  }).optional(),
});

export type GitLabRelease = z.infer<typeof GitLabReleaseSchema>;

// ============================================================================
// Environment Types
// ============================================================================

export const GitLabEnvironmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().optional(),
  external_url: z.string().nullable().optional(),
  state: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type GitLabEnvironment = z.infer<typeof GitLabEnvironmentSchema>;

// ============================================================================
// Event Types
// ============================================================================

export const GitLabEventSchema = z.object({
  id: z.number().optional(),
  project_id: z.number().optional(),
  action_name: z.string().optional(),
  target_id: z.number().nullable().optional(),
  target_iid: z.number().nullable().optional(),
  target_type: z.string().nullable().optional(),
  target_title: z.string().nullable().optional(),
  author_id: z.number().optional(),
  author_username: z.string().optional(),
  created_at: z.string().optional(),
  push_data: z.object({
    commit_count: z.number().optional(),
    action: z.string().optional(),
    ref_type: z.string().optional(),
    ref: z.string().nullable().optional(),
  }).optional(),
  note: z.object({
    id: z.number(),
    body: z.string(),
    noteable_type: z.string().optional(),
  }).optional(),
});

export type GitLabEvent = z.infer<typeof GitLabEventSchema>;

// ============================================================================
// Fork Types
// ============================================================================

export const GitLabForkSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  web_url: z.string(),
  path_with_namespace: z.string().optional(),
  default_branch: z.string().optional(),
  namespace: z.object({
    id: z.number(),
    name: z.string(),
    path: z.string(),
    full_path: z.string(),
  }).optional(),
});

export type GitLabFork = z.infer<typeof GitLabForkSchema>;

// ============================================================================
// Wiki Types
// ============================================================================

export const GitLabWikiPageSchema = z.object({
  content: z.string().optional(),
  format: z.string(),
  slug: z.string(),
  title: z.string(),
  encoding: z.string().optional(),
});

export type GitLabWikiPage = z.infer<typeof GitLabWikiPageSchema>;

// ============================================================================
// File Operation Types (for multi-file commits)
// ============================================================================

export interface FileOperation {
  action: 'create' | 'delete' | 'move' | 'update' | 'chmod';
  file_path: string;
  content?: string;
  previous_path?: string;
  encoding?: 'text' | 'base64';
}

// ============================================================================
// Paginated Response
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ============================================================================
// Tool Definition
// ============================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodObject<z.ZodRawShape>;
  handler: (params: Record<string, unknown>) => Promise<{
    [key: string]: unknown;
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }>;
}
