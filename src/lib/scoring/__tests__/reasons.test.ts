import { describe, expect, it } from 'vitest';
import type { FetchedRepositoryInfo } from '../../github/repositories';
import type { ScoreCategory } from '../../../types/comparison';
import { generateComparisonReasons } from '../reasons';

function createRepository(
  fullName: string,
  overrides: Partial<FetchedRepositoryInfo['metrics']> = {}
): FetchedRepositoryInfo {
  const [owner, name] = fullName.split('/');

  return {
    ref: { owner, name, fullName, url: `https://github.com/${fullName}` },
    summary: {
      name,
      description: 'An example repository with a detailed description.',
      avatarUrl: null,
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
      subscribersCount: 5,
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
      topics: ['example', 'testing'],
      ...overrides,
    },
    report: {} as FetchedRepositoryInfo['report'],
  };
}

describe('comparison score reasons', () => {
  it('returns two evidence-based reasons for every scoring category', () => {
    const reasons = generateComparisonReasons(
      createRepository('acme/project-a'),
      createRepository('acme/project-b', { hasReadme: false, starsCount: 5 })
    );

    const categories = [
      'activity',
      'maintenance',
      'community',
      'codebase',
      'documentation',
      'popularity',
      'health',
    ] as const satisfies readonly ScoreCategory[];

    for (const category of categories) {
      expect(reasons[category]).toHaveLength(4);
      expect(reasons[category].every((reason) => reason.value !== undefined)).toBe(true);
    }
  });
});
