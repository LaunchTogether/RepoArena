import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComparisonResult, RepositoryReportMetrics } from '@/types/comparison';
import { LiveComparison } from './live-comparison';

const reportFixture: RepositoryReportMetrics = {
  communityHealth: { value: { healthPercentage: 80, hasIssueTemplate: true, hasPullRequestTemplate: true }, status: 'available', sourceUrl: 'https://github.com/facebook/react/community' },
  activity: { value: { commitsLast7Days: 3, commitsLast30Days: 12, commitsLast90Days: 40, activeWeeksLast52: 30, trend: 'up' }, status: 'available', sourceUrl: 'https://github.com/facebook/react/stats/commit_activity' },
  release: { value: { latestName: 'v1.0.0', latestPublishedAt: '2026-08-01T00:00:00Z', releasesLastYear: 2, averageIntervalDays: 70 }, status: 'available', sourceUrl: 'https://github.com/facebook/react/releases' },
  issues: { value: { openedLast90Days: 10, closedLast90Days: 9, openOlderThan90Days: 1, medianCloseDays: 4 }, status: 'available', sourceUrl: 'https://github.com/facebook/react/issues' },
  pullRequests: { value: { mergedLast90Days: 6, openOlderThan30Days: 1, medianMergeDays: 2 }, status: 'available', sourceUrl: 'https://github.com/facebook/react/pulls' },
  workflow: { value: { completedRuns: 10, successfulRuns: 9, lastConclusion: 'success', lastRunAt: '2026-08-11T00:00:00Z' }, status: 'available', sourceUrl: 'https://github.com/facebook/react/actions' },
  languages: { value: { totalBytes: 100, distribution: [{ name: 'TypeScript', bytes: 100, percentage: 100 }] }, status: 'available', sourceUrl: 'https://github.com/facebook/react/languages' },
  contributors: { value: { activeContributors: 4, topContributorShare: 60 }, status: 'available', sourceUrl: 'https://github.com/facebook/react/stats/contributors' },
  projectFiles: { value: { hasSecurityPolicy: true, hasChangelog: true, hasTests: true, hasCi: true, hasLockfile: true, hasDocker: false, hasLintConfig: true }, status: 'available', sourceUrl: 'https://github.com/facebook/react/git/trees/main?recursive=1' },
};

const comparisonFixture: ComparisonResult = {
  repoA: {
    ref: { owner: 'facebook', name: 'react', fullName: 'facebook/react', url: 'https://github.com/facebook/react' },
    summary: {
      name: 'react', description: 'A JavaScript library.', avatarUrl: null, stars: 100, forks: 20,
      openIssues: 10, defaultBranch: 'main', isArchived: false, updatedAt: '2026-08-11T00:00:00Z',
    },
    metrics: {
      starsCount: 100, forksCount: 20, openIssuesCount: 10, subscribersCount: 5, license: 'MIT',
      hasReadme: true, hasLicense: true, hasContributing: true, hasCodeOfConduct: true,
      pushedAt: '2026-08-11T00:00:00Z', createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2026-08-11T00:00:00Z', sizeInKb: 500, language: 'JavaScript', topics: ['react'],
    },
    scores: { activity: 90, maintenance: 85, community: 80, codebase: 75, documentation: 90, popularity: 70, health: 95, overall: 85 },
    report: reportFixture,
  },
  repoB: {
    ref: { owner: 'vuejs', name: 'core', fullName: 'vuejs/core', url: 'https://github.com/vuejs/core' },
    summary: {
      name: 'core', description: 'The progressive framework.', avatarUrl: null, stars: 90, forks: 15,
      openIssues: 7, defaultBranch: 'main', isArchived: false, updatedAt: '2026-08-11T00:00:00Z',
    },
    metrics: {
      starsCount: 90, forksCount: 15, openIssuesCount: 7, subscribersCount: 4, license: 'MIT',
      hasReadme: true, hasLicense: true, hasContributing: true, hasCodeOfConduct: true,
      pushedAt: '2026-08-11T00:00:00Z', createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2026-08-11T00:00:00Z', sizeInKb: 400, language: 'TypeScript', topics: ['vue'],
    },
    scores: { activity: 86, maintenance: 82, community: 75, codebase: 80, documentation: 88, popularity: 65, health: 92, overall: 82 },
    report: reportFixture,
  },
  reasons: {
    activity: [
      { kind: 'positive', label: 'facebook/react: latest push timestamp.', value: '2026-08-11T00:00:00Z' },
      { kind: 'positive', label: 'vuejs/core: latest push timestamp.', value: '2026-08-11T00:00:00Z' },
    ],
    maintenance: [], community: [], codebase: [], documentation: [], popularity: [], health: [],
  },
  winner: 'repoA',
  createdAt: '2026-08-11T00:00:00Z',
  report: {
    intent: 'general',
    generatedAt: '2026-08-11T00:00:00Z',
    intentSummary: 'Balances recent delivery, maintenance signals, and project health evidence.',
    coverage: { available: 18, total: 18 },
    repoA: { ...reportFixture, strengths: ['Recent development activity'], risks: [] },
    repoB: { ...reportFixture, strengths: ['Regular stable releases'], risks: [] },
    sourceLedger: [],
    decisionDrivers: [],
  },
};

describe('LiveComparison', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads a comparison from the stable API endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(comparisonFixture), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<LiveComparison repoA="https://github.com/facebook/react" repoB="https://github.com/vuejs/core" />);

    expect(screen.getByText('Reading the repository signals.')).toBeInTheDocument();
    expect(
      await screen.findByText((_, element) => element?.tagName === 'P' && element.textContent?.includes('Live GitHub analysis') === true)
    ).toBeInTheDocument();
    expect(screen.getByText('Activity evidence')).toBeInTheDocument();
    expect(screen.getByText('facebook/react: latest push timestamp.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How complete is this read?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Development activity' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/compare', expect.objectContaining({ method: 'POST' }));
  });

  it('reloads evidence with the selected decision intent and keeps it in the share URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(comparisonFixture), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<LiveComparison repoA="https://github.com/facebook/react" repoB="https://github.com/vuejs/core" />);

    const select = await screen.findByLabelText('Comparison intent');
    fireEvent.change(select, { target: { value: 'contributing' } });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenLastCalledWith('/api/compare', expect.objectContaining({
      body: JSON.stringify({ repoA: 'https://github.com/facebook/react', repoB: 'https://github.com/vuejs/core', intent: 'contributing' }),
    }));
    expect(window.location.search).toBe('?intent=contributing');
  });
});
