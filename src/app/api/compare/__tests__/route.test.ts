import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GitHubClientError } from '../../../../lib/github/client';
import type { FetchedRepositoryInfo } from '../../../../lib/github/repositories';
import { POST } from '../route';
import { CompareErrorResponse, ComparisonResult, RepositoryReportMetrics } from '../../../../types/comparison';

const { fetchRepositoryDataMock } = vi.hoisted(() => ({
  fetchRepositoryDataMock: vi.fn(),
}));

vi.mock('../../../../lib/github/repositories', () => ({
  fetchRepositoryData: fetchRepositoryDataMock,
}));

const reportFixture: RepositoryReportMetrics = {
  communityHealth: { value: { healthPercentage: 80, hasIssueTemplate: true, hasPullRequestTemplate: true }, status: 'available', sourceUrl: null },
  activity: { value: { commitsLast7Days: 2, commitsLast30Days: 8, commitsLast90Days: 20, activeWeeksLast52: 15, trend: 'flat' }, status: 'available', sourceUrl: null },
  release: { value: { latestName: 'v1.0.0', latestPublishedAt: '2026-08-01T00:00:00Z', releasesLastYear: 2, averageIntervalDays: 60 }, status: 'available', sourceUrl: null },
  issues: { value: { openedLast90Days: 5, closedLast90Days: 4, openOlderThan90Days: 1, medianCloseDays: 3 }, status: 'available', sourceUrl: null },
  pullRequests: { value: { mergedLast90Days: 3, openOlderThan30Days: 0, medianMergeDays: 2 }, status: 'available', sourceUrl: null },
  workflow: { value: { completedRuns: 5, successfulRuns: 5, lastConclusion: 'success', lastRunAt: '2026-08-11T00:00:00Z' }, status: 'available', sourceUrl: null },
  languages: { value: { totalBytes: 100, distribution: [{ name: 'TypeScript', bytes: 100, percentage: 100 }] }, status: 'available', sourceUrl: null },
  contributors: { value: { activeContributors: 2, topContributorShare: 60 }, status: 'available', sourceUrl: null },
  projectFiles: { value: { hasSecurityPolicy: true, hasChangelog: true, hasTests: true, hasCi: true, hasLockfile: true, hasDocker: false, hasLintConfig: true }, status: 'available', sourceUrl: null },
};

const repositoryFixture: FetchedRepositoryInfo = {
  ref: {
    owner: 'facebook',
    name: 'react',
    fullName: 'facebook/react',
    url: 'https://github.com/facebook/react',
  },
  summary: {
    name: 'react',
    description: 'A JavaScript library for building user interfaces.',
    avatarUrl: 'https://avatars.githubusercontent.com/u/69631',
    stars: 100,
    forks: 20,
    openIssues: 10,
    defaultBranch: 'main',
    isArchived: false,
    updatedAt: '2026-08-11T00:00:00Z',
  },
  metrics: {
    starsCount: 100,
    forksCount: 20,
    openIssuesCount: 10,
    subscribersCount: 10,
    license: 'MIT',
    hasReadme: true,
    hasLicense: true,
    hasContributing: true,
    hasCodeOfConduct: true,
    pushedAt: '2026-08-11T00:00:00Z',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2026-08-11T00:00:00Z',
    sizeInKb: 500,
    language: 'TypeScript',
    topics: ['react'],
  },
  report: reportFixture,
};

describe('POST /api/compare Endpoint', () => {
  beforeEach(() => {
    fetchRepositoryDataMock.mockReset();
    fetchRepositoryDataMock.mockImplementation((ref) =>
      Promise.resolve({
        ...repositoryFixture,
        ref,
        summary: {
          ...repositoryFixture.summary,
          name: ref.name,
        },
      })
    );
  });

  it('returns a ComparisonResult for valid repositories', async () => {
    const request = new Request('http://localhost/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoA: 'facebook/react',
        repoB: 'vuejs/core',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const result = (await response.json()) as ComparisonResult;
    expect(result.repoA.ref.fullName).toBe('facebook/react');
    expect(result.repoB.ref.fullName).toBe('vuejs/core');
    expect(result.repoA.scores.overall).toBeGreaterThan(0);
    expect(result.repoB.scores.overall).toBeGreaterThan(0);
    expect(['repoA', 'repoB', null]).toContain(result.winner);
    expect(result.report.coverage).toEqual({ available: 18, total: 18 });
  });

  it('returns an intent-specific evidence report for a valid comparison', async () => {
    const request = new Request('http://localhost/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoA: 'facebook/react',
        repoB: 'vuejs/core',
        intent: 'adopting_library',
      }),
    });

    const response = await POST(request);
    const result = (await response.json()) as ComparisonResult;

    expect(response.status).toBe(200);
    expect(result.report.intent).toBe('adopting_library');
    expect(result.report.intentSummary).toContain('release cadence');
  });

  it('rejects an unsupported comparison intent', async () => {
    const request = new Request('http://localhost/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoA: 'facebook/react', repoB: 'vuejs/core', intent: 'unsupported' }),
    });

    const response = await POST(request);
    const result = (await response.json()) as CompareErrorResponse;

    expect(response.status).toBe(400);
    expect(result.error.code).toBe('INVALID_REPOSITORY_URL');
  });

  it('should return 400 and INVALID_REPOSITORY_URL for invalid URL input', async () => {
    const request = new Request('http://localhost/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoA: 'invalid-url-format',
        repoB: 'vuejs/core',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const result = (await response.json()) as CompareErrorResponse;
    expect(result.error.code).toBe('INVALID_REPOSITORY_URL');
  });

  it('rejects request bodies with unexpected fields', async () => {
    const request = new Request('http://localhost/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoA: 'facebook/react',
        repoB: 'vuejs/core',
        ignored: true,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const result = (await response.json()) as CompareErrorResponse;
    expect(result.error.code).toBe('INVALID_REPOSITORY_URL');
  });

  it('returns a safe error message when an unexpected error occurs', async () => {
    fetchRepositoryDataMock.mockRejectedValue(new Error('internal connection details'));

    const request = new Request('http://localhost/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoA: 'facebook/react', repoB: 'vuejs/core' }),
    });

    const response = await POST(request);
    const result = (await response.json()) as CompareErrorResponse;

    expect(response.status).toBe(503);
    expect(result.error.code).toBe('GITHUB_DATA_UNAVAILABLE');
    expect(result.error.message).not.toContain('internal connection details');
  });

  it('maps a missing repository to the typed 404 response', async () => {
    fetchRepositoryDataMock.mockRejectedValue(
      new GitHubClientError({
        code: 'REPOSITORY_NOT_FOUND',
        message: 'Repository was not found.',
        target: 'facebook/missing',
      })
    );

    const request = new Request('http://localhost/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoA: 'facebook/missing', repoB: 'vuejs/core' }),
    });

    const response = await POST(request);
    const result = (await response.json()) as CompareErrorResponse;

    expect(response.status).toBe(404);
    expect(result.error.code).toBe('REPOSITORY_NOT_FOUND');
  });
});
