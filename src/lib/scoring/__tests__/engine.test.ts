import { describe, it, expect } from 'vitest';
import { compareRepositories } from '../engine';
import { calculateOverallScore, computeRepositoryScores } from '../categories';
import type { RepositoryReportMetrics } from '../../../types/comparison';

function createReportMetrics(): RepositoryReportMetrics {
  const metric = <T,>(value: T) => ({
    value,
    status: 'available' as const,
    sourceUrl: 'https://github.com/acme/project',
  });

  return {
    communityHealth: metric({ healthPercentage: 75, hasIssueTemplate: true, hasPullRequestTemplate: true }),
    activity: metric({ commitsLast7Days: 1, commitsLast30Days: 4, commitsLast90Days: 12, activeWeeksLast52: 12, trend: 'flat' as const }),
    release: metric({ latestName: 'v1.0.0', latestPublishedAt: '2026-08-01T00:00:00Z', releasesLastYear: 1, averageIntervalDays: null }),
    issues: metric({ openedLast90Days: 2, closedLast90Days: 2, openOlderThan90Days: 0, medianCloseDays: 2 }),
    pullRequests: metric({ mergedLast90Days: 2, openOlderThan30Days: 0, medianMergeDays: 1 }),
    workflow: metric({ completedRuns: 1, successfulRuns: 1, lastConclusion: 'success', lastRunAt: '2026-08-11T00:00:00Z' }),
    languages: metric({ totalBytes: 100, distribution: [{ name: 'TypeScript', bytes: 100, percentage: 100 }] }),
    contributors: metric({ activeContributors: 1, topContributorShare: 100 }),
    projectFiles: metric({
      hasSecurityPolicy: false,
      hasChangelog: false,
      hasTests: true,
      hasCi: true,
      hasLockfile: true,
      hasDocker: false,
      hasLintConfig: true,
    }),
  };
}

describe('Scoring Engine', () => {
  it('should compute scores clamped between 0 and 100', () => {
    const dummyMetrics = {
      starsCount: 15000,
      forksCount: 2000,
      openIssuesCount: 45,
      subscribersCount: 120,
      license: 'MIT',
      hasReadme: true,
      hasLicense: true,
      hasContributing: true,
      hasCodeOfConduct: true,
      pushedAt: new Date().toISOString(),
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      sizeInKb: 4500,
      language: 'TypeScript',
      topics: ['react', 'nextjs', 'typescript'],
    };

    const dummySummary = {
      name: 'test-repo',
      description: 'A test repository description for unit testing.',
      avatarUrl: 'https://example.com/avatar.png',
      stars: 15000,
      forks: 2000,
      openIssues: 45,
      defaultBranch: 'main',
      isArchived: false,
      updatedAt: new Date().toISOString(),
    };

    const scores = computeRepositoryScores(dummyMetrics, dummySummary);

    const keys: (keyof typeof scores)[] = [
      'activity',
      'maintenance',
      'community',
      'codebase',
      'documentation',
      'popularity',
      'health',
      'overall',
    ];

    for (const key of keys) {
      expect(scores[key]).toBeGreaterThanOrEqual(0);
      expect(scores[key]).toBeLessThanOrEqual(100);
      expect(Number.isInteger(scores[key])).toBe(true);
    }
  });

  it('weights popularity at five percent of the overall score', () => {
    expect(
      calculateOverallScore({
        activity: 0,
        maintenance: 0,
        community: 0,
        codebase: 0,
        documentation: 0,
        popularity: 100,
        health: 0,
      })
    ).toBe(5);
  });

  it('returns null when both repositories have the same overall score', () => {
    const repository = {
      ref: {
        owner: 'acme',
        name: 'project',
        fullName: 'acme/project',
        url: 'https://github.com/acme/project',
      },
      summary: {
        name: 'project',
        description: 'A test repository description.',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1',
        stars: 1,
        forks: 1,
        openIssues: 1,
        defaultBranch: 'main',
        isArchived: false,
        updatedAt: '2026-08-11T00:00:00Z',
      },
      metrics: {
        starsCount: 1,
        forksCount: 1,
        openIssuesCount: 1,
        subscribersCount: 1,
        license: 'MIT',
        hasReadme: true,
        hasLicense: true,
        hasContributing: true,
        hasCodeOfConduct: true,
        pushedAt: '2026-08-11T00:00:00Z',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2026-08-11T00:00:00Z',
        sizeInKb: 100,
        language: 'TypeScript',
        topics: ['testing'],
      },
      report: createReportMetrics(),
    };

    expect(compareRepositories(repository, repository).winner).toBeNull();
  });
});
