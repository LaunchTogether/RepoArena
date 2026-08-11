import { afterEach, describe, expect, it, vi } from 'vitest';
import { GitHubClientError } from '../client';
import { parseGitHubUrl } from '../parser';
import { fetchRepositoryData } from '../repositories';

const repositoryPayload = {
  name: 'project',
  description: 'An example repository.',
  owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1' },
  stargazers_count: 20,
  forks_count: 5,
  open_issues_count: 3,
  subscribers_count: 2,
  default_branch: 'main',
  archived: false,
  pushed_at: '2026-08-11T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2026-08-11T00:00:00Z',
  size: 50,
  language: 'TypeScript',
  topics: ['example'],
  license: { spdx_id: 'MIT' },
};

const communityPayload = {
  files: {
    readme: { url: 'https://api.github.com/readme' },
    license: { url: 'https://api.github.com/license' },
    contributing: null,
    code_of_conduct: null,
  },
};

describe('repository data service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts repository and community profile requests in parallel', async () => {
    let resolveRepository: ((response: Response) => void) | undefined;
    const repositoryResponse = new Promise<Response>((resolve) => {
      resolveRepository = resolve;
    });

    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith('/community/profile')) {
        return Promise.resolve(new Response(JSON.stringify(communityPayload), { status: 200 }));
      }

      return repositoryResponse;
    });
    vi.stubGlobal('fetch', fetchMock);

    const pending = fetchRepositoryData(parseGitHubUrl('acme/project'));
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    resolveRepository?.(new Response(JSON.stringify(repositoryPayload), { status: 200 }));
    await expect(pending).resolves.toMatchObject({ ref: { fullName: 'acme/project' } });
  });

  it('preserves missing GitHub metrics as null instead of scoring them as zero', async () => {
    const incompletePayload = {
      name: 'project',
      description: null,
      owner: {},
      archived: false,
      pushed_at: null,
      created_at: null,
      updated_at: null,
      language: null,
      license: null,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(incompletePayload), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ files: {} }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchRepositoryData(parseGitHubUrl('acme/project'));

    expect(result.summary.avatarUrl).toBeNull();
    expect(result.summary.stars).toBeNull();
    expect(result.summary.defaultBranch).toBeNull();
    expect(result.metrics.starsCount).toBeNull();
    expect(result.metrics.topics).toBeNull();
  });

  it('propagates unavailable community data instead of reporting fabricated scoring inputs', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(repositoryPayload), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 503, statusText: 'Unavailable' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchRepositoryData(parseGitHubUrl('acme/project'))).rejects.toMatchObject({
      code: 'GITHUB_DATA_UNAVAILABLE',
    } satisfies Partial<GitHubClientError>);
  });
});
