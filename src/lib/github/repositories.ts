import {
  MetricStatus,
  MetricValue,
  RepositoryMetrics,
  RepositoryRef,
  RepositoryReportMetrics,
  RepositorySummary,
} from '../../types/comparison';
import { getCachedValue } from './cache';
import { fetchGitHubApi, fetchOptionalGitHubApi, GitHubClientError, OptionalGitHubApiResult } from './client';

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
    issue_template?: unknown;
    pull_request_template?: unknown;
  };
}

interface RawWorkflowRunDto {
  conclusion?: string | null;
  created_at?: string | null;
}

interface RawWorkflowRunsDto {
  workflow_runs?: RawWorkflowRunDto[];
}

interface RawReleaseDto {
  name?: string | null;
  tag_name?: string | null;
  draft?: boolean;
  prerelease?: boolean;
  published_at?: string | null;
}

interface RawIssueDto {
  created_at?: string | null;
  closed_at?: string | null;
  pull_request?: unknown;
}

interface RawPullRequestDto {
  created_at?: string | null;
  merged_at?: string | null;
  state?: string;
}

interface RawContributorDto {
  total?: number;
  weeks?: Array<{ w?: number; c?: number }>;
}

interface RawCommitActivityDto {
  total?: number;
}

interface RawGitTreeDto {
  tree?: Array<{ path?: string; type?: string }>;
}

export interface FetchedRepositoryInfo {
  ref: RepositoryRef;
  summary: RepositorySummary;
  metrics: RepositoryMetrics;
  report: RepositoryReportMetrics;
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

function reportMetric<T>(value: T | null, status: MetricStatus, sourceUrl: string | null): MetricValue<T> {
  return { value, status, sourceUrl };
}

function metricFromOptionalResult<T, R>(
  result: OptionalGitHubApiResult<T>,
  sourceUrl: string,
  transform: (value: T) => R
): MetricValue<R> {
  if (result.kind === 'not_found') return reportMetric<R>(null, 'not_configured', sourceUrl);
  if (result.kind === 'pending') return reportMetric<R>(null, 'unknown', sourceUrl);
  return reportMetric(transform(result.data), 'available', sourceUrl);
}

function daysBetween(later: string, earlier: string): number {
  return Math.max(0, (new Date(later).getTime() - new Date(earlier).getTime()) / 86_400_000);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0 ? (ordered[middle - 1] + ordered[middle]) / 2 : ordered[middle];
}

function safeDate(value: string | null | undefined): string | null {
  if (!value || Number.isNaN(new Date(value).getTime())) return null;
  return value;
}

function currentCutoff(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}

async function loadSecondaryMetric<T, R>(
  endpoint: string,
  targetName: string,
  sourceUrl: string,
  transform: (value: T) => R
): Promise<MetricValue<R>> {
  try {
    const result = await fetchOptionalGitHubApi<T>(endpoint, targetName);
    return metricFromOptionalResult(result, sourceUrl, transform);
  } catch (error) {
    if (error instanceof GitHubClientError && error.code === 'GITHUB_RATE_LIMITED') {
      throw error;
    }
    return reportMetric<R>(null, 'unknown', sourceUrl);
  }
}

function buildProjectFiles(paths: string[]): {
  hasSecurityPolicy: boolean;
  hasChangelog: boolean;
  hasTests: boolean;
  hasCi: boolean;
  hasLockfile: boolean;
  hasDocker: boolean;
  hasLintConfig: boolean;
} {
  const normalizedPaths = paths.map((path) => path.toLowerCase());
  return {
    hasSecurityPolicy: normalizedPaths.some((path) => path === 'security.md' || path.endsWith('/security.md')),
    hasChangelog: normalizedPaths.some((path) => path === 'changelog.md' || path.endsWith('/changelog.md')),
    hasTests: normalizedPaths.some((path) => /(^|\/)(test|tests|__tests__)(\/|$)|\.(test|spec)\.[^/]+$/.test(path)),
    hasCi: normalizedPaths.some((path) => path.startsWith('.github/workflows/')),
    hasLockfile: normalizedPaths.some((path) => /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|cargo\.lock|poetry\.lock)$/.test(path)),
    hasDocker: normalizedPaths.some((path) => /(^|\/)dockerfile$|docker-compose\..+\.ya?ml$/.test(path)),
    hasLintConfig: normalizedPaths.some((path) => /(^|\/)(eslint\.config\.|\.eslintrc|biome\.json)/.test(path)),
  };
}

function buildReportEndpoints(ref: RepositoryRef, defaultBranch: string | null): Record<string, string> {
  const repositoryPath = `/repos/${ref.owner}/${ref.name}`;
  const since90Days = currentCutoff(90).toISOString();
  return {
    community: `${repositoryPath}/community/profile`,
    workflow: `${repositoryPath}/actions/runs?status=completed&per_page=20`,
    releases: `${repositoryPath}/releases?per_page=100`,
    issues: `${repositoryPath}/issues?state=all&since=${encodeURIComponent(since90Days)}&per_page=100`,
    pullRequests: `${repositoryPath}/pulls?state=all&sort=updated&direction=desc&per_page=100`,
    languages: `${repositoryPath}/languages`,
    contributors: `${repositoryPath}/stats/contributors`,
    activity: `${repositoryPath}/stats/commit_activity`,
    tree: defaultBranch ? `${repositoryPath}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1` : '',
  };
}

/**
 * Fetches repository metadata and community profile info from GitHub REST API.
 * Combines endpoints into RepositorySummary and RepositoryMetrics data models.
 * Preserves null values for missing attributes without inventing fallback metrics.
 */
export async function fetchRepositoryData(ref: RepositoryRef): Promise<FetchedRepositoryInfo> {
  return getCachedValue(`repository-report:${ref.fullName}`, async () => {
    const repoEndpoint = `/repos/${ref.owner}/${ref.name}`;
    const rawRepo = await fetchGitHubApi<RawGitHubRepositoryDto>(repoEndpoint, ref.fullName);
    const defaultBranch = nullableString(rawRepo.default_branch);
    const endpoints = buildReportEndpoints(ref, defaultBranch);
    const communityPromise = fetchOptionalGitHubApi<RawGitHubCommunityProfileDto>(endpoints.community, ref.fullName).catch((error) => {
      if (error instanceof GitHubClientError && error.code === 'GITHUB_RATE_LIMITED') throw error;
      return null;
    });

    const [communityResponse, workflow, release, issues, pullRequests, languages, contributors, activity, projectFiles] = await Promise.all([
      communityPromise,
      loadSecondaryMetric<RawWorkflowRunsDto, { completedRuns: number; successfulRuns: number; lastConclusion: string | null; lastRunAt: string | null }>(
        endpoints.workflow,
        ref.fullName,
        `${ref.url}/actions`,
        (payload) => {
          const runs = Array.isArray(payload.workflow_runs) ? payload.workflow_runs : [];
          return {
            completedRuns: runs.length,
            successfulRuns: runs.filter((run) => run.conclusion === 'success').length,
            lastConclusion: nullableString(runs[0]?.conclusion),
            lastRunAt: safeDate(runs[0]?.created_at),
          };
        }
      ),
      loadSecondaryMetric<RawReleaseDto[], { latestName: string | null; latestPublishedAt: string | null; releasesLastYear: number; averageIntervalDays: number | null }>(
        endpoints.releases,
        ref.fullName,
        `${ref.url}/releases`,
        (payload) => {
          const stableReleases = (Array.isArray(payload) ? payload : [])
            .filter((release) => release.draft !== true && release.prerelease !== true && safeDate(release.published_at))
            .sort((left, right) => new Date(right.published_at ?? 0).getTime() - new Date(left.published_at ?? 0).getTime());
          const oneYearAgo = currentCutoff(365);
          const intervals = stableReleases.slice(0, -1).flatMap((release, index) => {
            const later = safeDate(release.published_at);
            const earlier = safeDate(stableReleases[index + 1]?.published_at);
            return later && earlier ? [daysBetween(later, earlier)] : [];
          });
          return {
            latestName: nullableString(stableReleases[0]?.name) ?? nullableString(stableReleases[0]?.tag_name),
            latestPublishedAt: safeDate(stableReleases[0]?.published_at),
            releasesLastYear: stableReleases.filter((release) => new Date(release.published_at ?? 0) >= oneYearAgo).length,
            averageIntervalDays: median(intervals),
          };
        }
      ),
      loadSecondaryMetric<RawIssueDto[], { openedLast90Days: number; closedLast90Days: number; openOlderThan90Days: number; medianCloseDays: number | null }>(
        endpoints.issues,
        ref.fullName,
        `${ref.url}/issues`,
        (payload) => {
          const issuesOnly = (Array.isArray(payload) ? payload : []).filter((issue) => issue.pull_request === undefined);
          const cutoff = currentCutoff(90);
          const closedDurations = issuesOnly.flatMap((issue) => {
            const createdAt = safeDate(issue.created_at);
            const closedAt = safeDate(issue.closed_at);
            return createdAt && closedAt ? [daysBetween(closedAt, createdAt)] : [];
          });
          return {
            openedLast90Days: issuesOnly.filter((issue) => new Date(issue.created_at ?? 0) >= cutoff).length,
            closedLast90Days: issuesOnly.filter((issue) => new Date(issue.closed_at ?? 0) >= cutoff).length,
            openOlderThan90Days: issuesOnly.filter((issue) => !issue.closed_at && new Date(issue.created_at ?? 0) < cutoff).length,
            medianCloseDays: median(closedDurations),
          };
        }
      ),
      loadSecondaryMetric<RawPullRequestDto[], { mergedLast90Days: number; openOlderThan30Days: number; medianMergeDays: number | null }>(
        endpoints.pullRequests,
        ref.fullName,
        `${ref.url}/pulls`,
        (payload) => {
          const pulls = Array.isArray(payload) ? payload : [];
          const cutoff90 = currentCutoff(90);
          const cutoff30 = currentCutoff(30);
          const mergeDurations = pulls.flatMap((pull) => {
            const createdAt = safeDate(pull.created_at);
            const mergedAt = safeDate(pull.merged_at);
            return createdAt && mergedAt ? [daysBetween(mergedAt, createdAt)] : [];
          });
          return {
            mergedLast90Days: pulls.filter((pull) => safeDate(pull.merged_at) && new Date(pull.merged_at ?? 0) >= cutoff90).length,
            openOlderThan30Days: pulls.filter((pull) => pull.state === 'open' && new Date(pull.created_at ?? 0) < cutoff30).length,
            medianMergeDays: median(mergeDurations),
          };
        }
      ),
      loadSecondaryMetric<Record<string, number>, { totalBytes: number; distribution: Array<{ name: string; bytes: number; percentage: number }> }>(
        endpoints.languages,
        ref.fullName,
        `${ref.url}/languages`,
        (payload) => {
          const entries = Object.entries(payload).filter(([, bytes]) => Number.isFinite(bytes) && bytes >= 0);
          const totalBytes = entries.reduce((total, [, bytes]) => total + bytes, 0);
          return {
            totalBytes,
            distribution: entries
              .sort(([, left], [, right]) => right - left)
              .map(([name, bytes]) => ({ name, bytes, percentage: totalBytes === 0 ? 0 : Math.round((bytes / totalBytes) * 100) })),
          };
        }
      ),
      loadSecondaryMetric<RawContributorDto[], { activeContributors: number; topContributorShare: number | null }>(
        endpoints.contributors,
        ref.fullName,
        `${ref.url}/graphs/contributors`,
        (payload) => {
          const contributors = Array.isArray(payload) ? payload : [];
          const totalCommits = contributors.reduce((total, contributor) => total + (nullableNumber(contributor.total) ?? 0), 0);
          const activeContributors = contributors.filter((contributor) => (contributor.weeks ?? []).slice(-13).some((week) => (nullableNumber(week.c) ?? 0) > 0)).length;
          const topTotal = Math.max(0, ...contributors.map((contributor) => nullableNumber(contributor.total) ?? 0));
          return {
            activeContributors,
            topContributorShare: totalCommits === 0 ? null : Math.round((topTotal / totalCommits) * 100),
          };
        }
      ),
      loadSecondaryMetric<RawCommitActivityDto[], { commitsLast7Days: number; commitsLast30Days: number; commitsLast90Days: number; activeWeeksLast52: number; trend: 'up' | 'down' | 'flat' }>(
        endpoints.activity,
        ref.fullName,
        `${ref.url}/graphs/commit-activity`,
        (payload) => {
          const weeks = (Array.isArray(payload) ? payload : []).map((week) => nullableNumber(week.total) ?? 0);
          const recentFourWeeks = weeks.slice(-4).reduce((total, count) => total + count, 0);
          const precedingFourWeeks = weeks.slice(-8, -4).reduce((total, count) => total + count, 0);
          const trend = recentFourWeeks === precedingFourWeeks ? 'flat' : recentFourWeeks > precedingFourWeeks ? 'up' : 'down';
          return {
            commitsLast7Days: weeks.at(-1) ?? 0,
            commitsLast30Days: recentFourWeeks,
            commitsLast90Days: weeks.slice(-13).reduce((total, count) => total + count, 0),
            activeWeeksLast52: weeks.filter((count) => count > 0).length,
            trend,
          };
        }
      ),
      endpoints.tree
        ? loadSecondaryMetric<RawGitTreeDto, ReturnType<typeof buildProjectFiles>>(
          endpoints.tree,
          ref.fullName,
          `${ref.url}/tree/${defaultBranch}`,
          (payload) => buildProjectFiles((payload.tree ?? []).filter((entry) => entry.type === 'blob').flatMap((entry) => typeof entry.path === 'string' ? [entry.path] : []))
        )
        : Promise.resolve(reportMetric<ReturnType<typeof buildProjectFiles>>(null, 'unknown', `${ref.url}/tree`)),
    ]);

    const rawCommunity = communityResponse?.kind === 'success' ? communityResponse.data : null;
    const rawCommunityFiles = rawCommunity?.files;
    const communityHealth = rawCommunity
      ? reportMetric({
        healthPercentage: nullableNumber(rawCommunity.health_percentage) ?? 0,
        hasIssueTemplate: nullableCommunityFile(rawCommunityFiles?.issue_template) === true,
        hasPullRequestTemplate: nullableCommunityFile(rawCommunityFiles?.pull_request_template) === true,
      }, 'available', `${ref.url}/community`)
      : communityResponse?.kind === 'not_found'
        ? reportMetric<NonNullable<RepositoryReportMetrics['communityHealth']['value']>>(null, 'not_configured', `${ref.url}/community`)
        : reportMetric<NonNullable<RepositoryReportMetrics['communityHealth']['value']>>(null, 'unknown', `${ref.url}/community`);
    const communityLicense = nullableCommunityFile(rawCommunityFiles?.license);
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

    const hasReadme = nullableCommunityFile(rawCommunityFiles?.readme);
    const hasLicense = communityLicense === true || repositoryLicense === true
    ? true
    : communityLicense === false || repositoryLicense === false
      ? false
      : null;
    const hasContributing = nullableCommunityFile(rawCommunityFiles?.contributing);
    const hasCodeOfConduct = nullableCommunityFile(rawCommunityFiles?.code_of_conduct);

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
      report: {
        communityHealth,
        activity,
        release,
        issues,
        pullRequests,
        workflow,
        languages,
        contributors,
        projectFiles,
      },
    };
  });
}
