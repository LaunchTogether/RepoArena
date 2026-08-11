import { describe, it, expect } from 'vitest';
import { parseGitHubUrl } from '../parser';
import { fetchRepositoryData } from '../repositories';
import { GitHubClientError } from '../client';

describe('GitHub Repositories Service', () => {
  it('should fetch repository data for a valid public repository (facebook/react)', async () => {
    const ref = parseGitHubUrl('facebook/react');
    const data = await fetchRepositoryData(ref);

    expect(data.ref.fullName).toBe('facebook/react');
    expect(data.summary.name).toBe('react');
    expect(data.summary.stars).toBeGreaterThan(10000);
    expect(data.metrics.hasReadme).toBe(true);
    expect(data.metrics.license).toBeDefined();
  }, 15000);

  it('should throw GitHubClientError REPOSITORY_NOT_FOUND for non-existent repository', async () => {
    const ref = parseGitHubUrl('facebook/non-existent-repo-999999999');

    try {
      await fetchRepositoryData(ref);
      expect.fail('Should have thrown REPOSITORY_NOT_FOUND error');
    } catch (err) {
      expect(err).toBeInstanceOf(GitHubClientError);
      const clientErr = err as GitHubClientError;
      expect(clientErr.code).toBe('REPOSITORY_NOT_FOUND');
    }
  }, 15000);
});
