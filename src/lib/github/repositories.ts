import { RepositoryMetrics, RepositoryRef, RepositorySummary } from '../../types/comparison';
import { fetchGitHubApi } from './client';

interface RawGitHubRepositoryDto {
  name?: string;
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

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function nullableBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function nullableStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.every((item) => typeof item === 'string') ? value : null;
}

function nullableCommunityFile(value: unknown): boolean | null {
  if (value === undefined) return null;
  return Boolean(value);
}

/**
 * Fetches repository metadata and community profile info from GitHub REST API.
 * Combines endpoints into RepositorySummary and RepositoryMetrics data models.
 * Preserves null values for missing attributes without inventing fallback metrics.
 */
export async function fetchRepositoryData(ref: RepositoryRef): Promise<FetchedRepositoryInfo> {
  const repoEndpoint = `/repos/${ref.owner}/${ref.name}`;
  const communityEndpoint = `/repos/${ref.owner}/${ref.name}/community/profile`;

  const [rawRepo, rawCommunity] = await Promise.all([
    fetchGitHubApi<RawGitHubRepositoryDto>(repoEndpoint, ref.fullName),
    fetchGitHubApi<RawGitHubCommunityProfileDto>(communityEndpoint, ref.fullName),
  ]);

  const communityFiles = rawCommunity.files;
  const communityLicense = nullableCommunityFile(communityFiles?.license);
  const repositoryLicense = rawRepo.license === undefined ? null : rawRepo.license !== null;

  const summary: RepositorySummary = {
    name: nullableString(rawRepo.name) ?? ref.name,
    description: rawRepo.description ?? null,
    avatarUrl: nullableString(rawRepo.owner?.avatar_url),
    stars: nullableNumber(rawRepo.stargazers_count),
    forks: nullableNumber(rawRepo.forks_count),
    openIssues: nullableNumber(rawRepo.open_issues_count),
    defaultBranch: nullableString(rawRepo.default_branch),
    isArchived: nullableBoolean(rawRepo.archived),
    updatedAt: nullableString(rawRepo.updated_at),
  };

  const hasReadme = nullableCommunityFile(communityFiles?.readme);
  const hasLicense = communityLicense === true || repositoryLicense === true
    ? true
    : communityLicense === false || repositoryLicense === false
      ? false
      : null;
  const hasContributing = nullableCommunityFile(communityFiles?.contributing);
  const hasCodeOfConduct = nullableCommunityFile(communityFiles?.code_of_conduct);

  const licenseName = rawRepo.license?.spdx_id || rawRepo.license?.name || null;

  const metrics: RepositoryMetrics = {
    starsCount: nullableNumber(rawRepo.stargazers_count),
    forksCount: nullableNumber(rawRepo.forks_count),
    openIssuesCount: nullableNumber(rawRepo.open_issues_count),
    subscribersCount: nullableNumber(rawRepo.subscribers_count),
    license: licenseName,
    hasReadme,
    hasLicense,
    hasContributing,
    hasCodeOfConduct,
    pushedAt: rawRepo.pushed_at ?? null,
    createdAt: rawRepo.created_at ?? null,
    updatedAt: rawRepo.updated_at ?? null,
    sizeInKb: nullableNumber(rawRepo.size),
    language: rawRepo.language ?? null,
    topics: nullableStringArray(rawRepo.topics),
  };

  return {
    ref,
    summary,
    metrics,
  };
}
