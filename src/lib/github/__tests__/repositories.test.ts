import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearGitHubCache } from '../cache';
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
  health_percentage: 75,
  files: {
    readme: { url: 'https://api.github.com/readme' },
    license: { url: 'https://api.github.com/license' },
    contributing: null,
    code_of_conduct: null,
    issue_template: { url: 'https://api.github.com/issue-template' },
    pull_request_template: { url: 'https://api.github.com/pull-request-template' },
  },
};

describe('repository data service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearGitHubCache();
  });

  it('loads optional report evidence only after core repository metadata validates', async () => {
    let resolveRepository: ((response: Response) => void) | undefined;
    const repositoryResponse = new Promise<Response>((resolve) => {
      resolveRepository = resolve;
    });

    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith('/repos/acme/project')) return repositoryResponse;
      if (url.endsWith('/community/profile')) return Promise.resolve(new Response(JSON.stringify(communityPayload), { status: 200 }));
      if (url.includes('/actions/runs')) return Promise.resolve(new Response(JSON.stringify({ workflow_runs: [] }), { status: 200 }));
      if (url.includes('/releases') || url.includes('/issues') || url.includes('/pulls') || url.endsWith('/languages') || url.includes('/contributors') || url.includes('/commit_activity') || url.includes('/git/trees/')) {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }
      throw new Error(`Unexpected GitHub request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const pending = fetchRepositoryData(parseGitHubUrl('acme/project'));
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveRepository?.(new Response(JSON.stringify(repositoryPayload), { status: 200 }));
    await expect(pending).resolves.toMatchObject({ ref: { fullName: 'acme/project' } });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/acme/project/community/profile',
      expect.any(Object)
    );
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

  it('marks unavailable community data as unknown instead of fabricating scoring inputs', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(repositoryPayload), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 503, statusText: 'Unavailable' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchRepositoryData(parseGitHubUrl('acme/project'))).resolves.toMatchObject({
      report: { communityHealth: { status: 'unknown', value: null } },
    });
  });

  it('returns aggregate report evidence from public GitHub endpoints', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith('/community/profile')) return Promise.resolve(new Response(JSON.stringify(communityPayload), { status: 200 }));
      if (url.endsWith('/actions/runs?status=completed&per_page=20')) {
        return Promise.resolve(new Response(JSON.stringify({ workflow_runs: [
          { conclusion: 'success', created_at: '2026-08-11T00:00:00Z' },
          { conclusion: 'failure', created_at: '2026-08-10T00:00:00Z' },
        ] }), { status: 200 }));
      }
      if (url.endsWith('/releases?per_page=100')) {
        return Promise.resolve(new Response(JSON.stringify([
          { name: 'v2.0.0', tag_name: 'v2.0.0', draft: false, prerelease: false, published_at: '2026-08-01T00:00:00Z' },
          { name: 'v1.0.0', tag_name: 'v1.0.0', draft: false, prerelease: false, published_at: '2026-01-01T00:00:00Z' },
        ]), { status: 200 }));
      }
      if (url.includes('/issues?')) {
        return Promise.resolve(new Response(JSON.stringify([
          { created_at: '2026-08-01T00:00:00Z', closed_at: null },
          { created_at: '2026-07-01T00:00:00Z', closed_at: '2026-07-06T00:00:00Z' },
          { created_at: '2026-08-01T00:00:00Z', closed_at: null, pull_request: {} },
        ]), { status: 200 }));
      }
      if (url.includes('/pulls?')) {
        return Promise.resolve(new Response(JSON.stringify([
          { created_at: '2026-08-01T00:00:00Z', merged_at: '2026-08-03T00:00:00Z', state: 'closed' },
          { created_at: '2026-06-01T00:00:00Z', merged_at: null, state: 'open' },
        ]), { status: 200 }));
      }
      if (url.endsWith('/languages')) {
        return Promise.resolve(new Response(JSON.stringify({ TypeScript: 75, JavaScript: 25 }), { status: 200 }));
      }
      if (url.endsWith('/stats/contributors')) {
        return Promise.resolve(new Response(JSON.stringify([
          { total: 75 }, { total: 25 },
        ]), { status: 200 }));
      }
      if (url.endsWith('/stats/commit_activity')) {
        return Promise.resolve(new Response(JSON.stringify([
          ...Array.from({ length: 48 }, () => ({ total: 0 })),
          { total: 2 }, { total: 4 }, { total: 8 }, { total: 10 },
        ]), { status: 200 }));
      }
      if (url.includes('/git/trees/')) {
        return Promise.resolve(new Response(JSON.stringify({ tree: [
          { path: 'SECURITY.md', type: 'blob' }, { path: 'CHANGELOG.md', type: 'blob' },
          { path: 'package-lock.json', type: 'blob' }, { path: 'Dockerfile', type: 'blob' },
          { path: '.github/workflows/test.yml', type: 'blob' }, { path: 'src/app.test.ts', type: 'blob' },
        ] }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify(repositoryPayload), { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchRepositoryData(parseGitHubUrl('acme/project'));
    const report = (result as unknown as { report: Record<string, unknown> }).report;

    expect(report).toMatchObject({
      communityHealth: { status: 'available', value: { healthPercentage: 75, hasIssueTemplate: true } },
      workflow: { status: 'available', value: { completedRuns: 2, successfulRuns: 1 } },
      languages: { status: 'available', value: { totalBytes: 100 } },
    });
  });

  it('marks delayed GitHub statistics as unknown without failing core repository data', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith('/community/profile')) return Promise.resolve(new Response(JSON.stringify(communityPayload), { status: 200 }));
      if (url.endsWith('/stats/commit_activity')) return Promise.resolve(new Response(null, { status: 202 }));
      if (url.includes('/actions/runs')) return Promise.resolve(new Response(null, { status: 404 }));
      if (url.includes('/releases') || url.includes('/issues') || url.includes('/pulls') || url.endsWith('/languages') || url.includes('/contributors') || url.includes('/git/trees/')) {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify(repositoryPayload), { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchRepositoryData(parseGitHubUrl('acme/project'));
    const report = (result as unknown as { report: { activity: { status: string }; workflow: { status: string } } }).report;

    expect(report.activity.status).toBe('unknown');
    expect(report.workflow.status).toBe('not_configured');
  });
});
