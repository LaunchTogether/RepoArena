import { RepositoryMetrics, RepositoryRef, RepositorySummary } from '../../types/comparison';
import { fetchGitHubApi, GitHubClientError } from './client';

interface RawGitHubRepositoryDto {
  name: string;
  description: string | null;
  owner?: {
    avatar_url?: string;
  };
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  subscribers_count?: number;
  default_branch?: string;
  archived?: boolean;
  pushed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  size?: number;
  language?: string | null;
  topics?: string[];
  license?: {
    key?: string;
    name?: string;
    spdx_id?: string | null;
  } | null;
}

interface RawGitHubCommunityProfileDto {
  health_percentage?: number;
  files?: {
    readme?: unknown;
    license?: unknown;
    contributing?: unknown;
    code_of_conduct?: unknown;
  };
}

export interface FetchedRepositoryInfo {
  ref: RepositoryRef;
  summary: RepositorySummary;
  metrics: RepositoryMetrics;
}

/**
 * Fetches repository metadata and community profile info from GitHub REST API.
 * Combines endpoints into RepositorySummary and RepositoryMetrics data models.
 * Preserves null values for missing attributes without inventing fallback metrics.
 */
export async function fetchRepositoryData(ref: RepositoryRef): Promise<FetchedRepositoryInfo> {
  const repoEndpoint = `/repos/${ref.owner}/${ref.name}`;
  const communityEndpoint = `/repos/${ref.owner}/${ref.name}/community/profile`;

  const rawRepo = await fetchGitHubApi<RawGitHubRepositoryDto>(repoEndpoint, ref.fullName);

  let rawCommunity: RawGitHubCommunityProfileDto | null = null;
  try {
    rawCommunity = await fetchGitHubApi<RawGitHubCommunityProfileDto>(communityEndpoint, ref.fullName);
  } catch (err) {
    // If community profile is 404 or fails, degrade gracefully with nulls
    if (err instanceof GitHubClientError && err.code === 'REPOSITORY_NOT_FOUND') {
      rawCommunity = null;
    } else if (err instanceof GitHubClientError && err.code === 'GITHUB_RATE_LIMITED') {
      // Re-throw rate limit errors
      throw err;
    }
  }

  const summary: RepositorySummary = {
    name: rawRepo.name || ref.name,
    description: rawRepo.description ?? null,
    avatarUrl: rawRepo.owner?.avatar_url || '',
    stars: rawRepo.stargazers_count ?? 0,
    forks: rawRepo.forks_count ?? 0,
    openIssues: rawRepo.open_issues_count ?? 0,
    defaultBranch: rawRepo.default_branch || 'main',
    isArchived: Boolean(rawRepo.archived),
    updatedAt: rawRepo.updated_at || '',
  };

  const hasReadme = Boolean(rawCommunity?.files?.readme);
  const hasLicense = Boolean(rawCommunity?.files?.license || rawRepo.license);
  const hasContributing = Boolean(rawCommunity?.files?.contributing);
  const hasCodeOfConduct = Boolean(rawCommunity?.files?.code_of_conduct);

  const licenseName = rawRepo.license?.spdx_id || rawRepo.license?.name || null;

  const metrics: RepositoryMetrics = {
    starsCount: rawRepo.stargazers_count ?? 0,
    forksCount: rawRepo.forks_count ?? 0,
    openIssuesCount: rawRepo.open_issues_count ?? 0,
    subscribersCount: rawRepo.subscribers_count ?? 0,
    license: licenseName,
    hasReadme,
    hasLicense,
    hasContributing,
    hasCodeOfConduct,
    pushedAt: rawRepo.pushed_at ?? null,
    createdAt: rawRepo.created_at ?? null,
    updatedAt: rawRepo.updated_at ?? null,
    sizeInKb: rawRepo.size ?? 0,
    language: rawRepo.language ?? null,
    topics: Array.isArray(rawRepo.topics) ? rawRepo.topics : [],
  };

  return {
    ref,
    summary,
    metrics,
  };
}
