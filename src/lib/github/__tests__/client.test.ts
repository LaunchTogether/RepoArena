import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchGitHubApi, GitHubClientError } from '../client';

describe('GitHub API client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('rejects an absolute endpoint before sending a request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ private: 'data' }), { status: 200 })
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchGitHubApi('https://example.com/private')).rejects.toMatchObject({
      code: 'GITHUB_DATA_UNAVAILABLE',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not retry unauthenticated after a configured token is rejected', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'invalid-token');
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchGitHubApi('/repos/acme/project', 'acme/project')).rejects.toMatchObject({
      code: 'PRIVATE_REPOSITORY',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('includes the converted reset time for rate-limit responses', async () => {
    const reset = '1786406400';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 403,
          headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': reset,
          },
        })
      )
    );

    await expect(fetchGitHubApi('/repos/acme/project', 'acme/project')).rejects.toMatchObject({
      code: 'GITHUB_RATE_LIMITED',
      rateLimitReset: new Date(Number(reset) * 1000).toISOString(),
    } satisfies Partial<GitHubClientError>);
  });
});
