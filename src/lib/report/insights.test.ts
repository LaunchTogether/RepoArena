import { describe, expect, it } from 'vitest';
import type {
  ComparisonResultInput,
  MetricStatus,
  MetricValue,
  RepositoryReportMetrics,
} from '../../types/comparison';
import { generateReportInsights } from './insights';

function metric<T>(value: T | null, status: MetricStatus = 'available'): MetricValue<T> {
  return {
    value,
    status,
    sourceUrl: 'https://github.com/acme/project',
  };
}

function unavailable<T>(status: Exclude<MetricStatus, 'available'>): MetricValue<T> {
  return metric<T>(null, status);
}

function createReportMetrics(overrides: Partial<RepositoryReportMetrics> = {}): RepositoryReportMetrics {
  return {
    communityHealth: metric({ healthPercentage: 72, hasIssueTemplate: true, hasPullRequestTemplate: true }),
    activity: metric({ commitsLast7Days: 4, commitsLast30Days: 18, commitsLast90Days: 56, activeWeeksLast52: 30, trend: 'up' }),
    release: metric({ latestName: 'v2.0.0', latestPublishedAt: '2026-08-01T00:00:00Z', releasesLastYear: 4, averageIntervalDays: 90 }),
    issues: metric({ openedLast90Days: 18, closedLast90Days: 16, openOlderThan90Days: 2, medianCloseDays: 4 }),
    pullRequests: metric({ mergedLast90Days: 15, openOlderThan30Days: 1, medianMergeDays: 2 }),
    workflow: metric({ completedRuns: 20, successfulRuns: 19, lastConclusion: 'success', lastRunAt: '2026-08-11T00:00:00Z' }),
    languages: metric({ totalBytes: 100, distribution: [{ name: 'TypeScript', bytes: 100, percentage: 100 }] }),
    contributors: metric({ activeContributors: 4, topContributorShare: 52 }),
    projectFiles: metric({
      hasSecurityPolicy: true,
      hasChangelog: true,
      hasTests: true,
      hasCi: true,
      hasLockfile: true,
      hasDocker: false,
      hasLintConfig: true,
    }),
    ...overrides,
  };
}

function createResult(
  repoAReport: RepositoryReportMetrics,
  repoBReport: RepositoryReportMetrics
): ComparisonResultInput {
  const createRepository = (fullName: string, report: RepositoryReportMetrics) => {
    const [owner, name] = fullName.split('/');
    return {
      ref: { owner, name, fullName, url: `https://github.com/${fullName}` },
      summary: {
        name,
        description: 'A repository used for report insight tests.',
        avatarUrl: null,
        stars: 100,
        forks: 20,
        openIssues: 4,
        defaultBranch: 'main',
        isArchived: false,
        updatedAt: '2026-08-11T00:00:00Z',
      },
      metrics: {
        starsCount: 100,
        forksCount: 20,
        openIssuesCount: 4,
        subscribersCount: 10,
        license: 'MIT',
        hasReadme: true,
        hasLicense: true,
        hasContributing: true,
        hasCodeOfConduct: true,
        pushedAt: '2026-08-11T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2026-08-11T00:00:00Z',
        sizeInKb: 500,
        language: 'TypeScript',
        topics: ['testing'],
      },
      scores: {
        activity: 80,
        maintenance: 80,
        community: 80,
        codebase: 80,
        documentation: 80,
        popularity: 80,
        health: 80,
        overall: 80,
      },
      report,
    };
  };

  return {
    repoA: createRepository('acme/project-a', repoAReport),
    repoB: createRepository('acme/project-b', repoBReport),
    reasons: {
      activity: [], maintenance: [], community: [], codebase: [], documentation: [], popularity: [], health: [],
    },
    winner: null,
    createdAt: '2026-08-12T00:00:00Z',
  };
}

describe('generateReportInsights', () => {
  it('does not report missing CI when workflow data is not configured', () => {
    const result = createResult(
      createReportMetrics({ workflow: unavailable('not_configured') }),
      createReportMetrics()
    );

    const report = generateReportInsights(result, 'general');

    expect(report.repoA.workflow.status).toBe('not_configured');
    expect(report.repoA.risks).not.toContain('No CI');
  });

  it('uses release cadence as the first adoption driver only when both repositories have release data', () => {
    const result = createResult(
      createReportMetrics({ release: metric({ latestName: 'v2.0.0', latestPublishedAt: '2026-08-01T00:00:00Z', releasesLastYear: 6, averageIntervalDays: 45 }) }),
      createReportMetrics({ release: metric({ latestName: 'v1.0.0', latestPublishedAt: '2026-04-01T00:00:00Z', releasesLastYear: 1, averageIntervalDays: null }) })
    );

    const report = generateReportInsights(result, 'adopting_library');

    expect(report.decisionDrivers[0]?.category).toBe('release');
    expect(report.decisionDrivers).toHaveLength(1);
  });

  it('counts only available evidence across both repositories for coverage', () => {
    const result = createResult(
      createReportMetrics({ workflow: unavailable('not_configured'), activity: unavailable('unknown') }),
      createReportMetrics({ projectFiles: unavailable('unknown') })
    );

    expect(generateReportInsights(result, 'general').coverage).toEqual({ available: 15, total: 18 });
  });
});
