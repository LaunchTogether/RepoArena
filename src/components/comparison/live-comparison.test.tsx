import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComparisonResult } from '@/types/comparison';
import { LiveComparison } from './live-comparison';

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
    report: {} as ComparisonResult['repoA']['report'],
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
    report: {} as ComparisonResult['repoB']['report'],
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
  report: {} as ComparisonResult['report'],
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
    expect(fetchMock).toHaveBeenCalledWith('/api/compare', expect.objectContaining({ method: 'POST' }));
  });
});
