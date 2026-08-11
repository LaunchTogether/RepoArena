import { describe, it, expect } from 'vitest';
import { parseGitHubUrl } from '../../github/parser';
import { fetchRepositoryData } from '../../github/repositories';
import { compareRepositories } from '../engine';
import { computeRepositoryScores } from '../categories';

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

  it('should compare facebook/react vs vuejs/core correctly', async () => {
    const refA = parseGitHubUrl('facebook/react');
    const refB = parseGitHubUrl('vuejs/core');

    const repoAData = await fetchRepositoryData(refA);
    const repoBData = await fetchRepositoryData(refB);

    const comparison = compareRepositories(repoAData, repoBData);

    expect(comparison.repoA.ref.fullName).toBe('facebook/react');
    expect(comparison.repoB.ref.fullName).toBe('vuejs/core');

    expect(comparison.repoA.scores.overall).toBeGreaterThanOrEqual(0);
    expect(comparison.repoA.scores.overall).toBeLessThanOrEqual(100);

    expect(comparison.repoB.scores.overall).toBeGreaterThanOrEqual(0);
    expect(comparison.repoB.scores.overall).toBeLessThanOrEqual(100);

    expect(['repoA', 'repoB', 'tie']).toContain(comparison.winner);
    expect(comparison.createdAt).toBeDefined();
  }, 20000);
});
