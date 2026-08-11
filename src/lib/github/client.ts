import { CompareErrorCode } from '../../types/comparison';

export interface GitHubApiErrorOptions {
  code: CompareErrorCode;
  message: string;
  target?: string;
  rateLimitReset?: string;
}

export class GitHubClientError extends Error {
  public readonly code: CompareErrorCode;
  public readonly target?: string;
  public readonly rateLimitReset?: string;

  constructor(options: GitHubApiErrorOptions) {
    super(options.message);
    this.name = 'GitHubClientError';
    this.code = options.code;
    this.target = options.target;
    this.rateLimitReset = options.rateLimitReset;
  }
}

/**
 * Executes a server-side HTTP GET request to the GitHub REST API (v3).
 * Reads authentication token exclusively from process.env.GITHUB_TOKEN on the server.
 */
export async function fetchGitHubApi<T>(endpoint: string, targetName?: string): Promise<T> {
  const baseUrl = 'https://api.github.com';
  if (!endpoint.startsWith('/') || endpoint.startsWith('//')) {
    throw new GitHubClientError({
      code: 'GITHUB_DATA_UNAVAILABLE',
      message: 'GitHub API requests must use a relative API path.',
      target: targetName,
    });
  }

  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'RepoArena-App',
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, { method: 'GET', headers });
  } catch (error) {
    throw new GitHubClientError({
      code: 'GITHUB_DATA_UNAVAILABLE',
      message: `Failed to connect to GitHub API: ${error instanceof Error ? error.message : String(error)}`,
      target: targetName,
    });
  }

  // Check Rate Limiting headers
  const remaining = response.headers.get('x-ratelimit-remaining');
  const resetHeader = response.headers.get('x-ratelimit-reset');

  let resetIsoString: string | undefined;
  if (resetHeader) {
    const resetTimeSec = parseInt(resetHeader, 10);
    if (!isNaN(resetTimeSec) && resetTimeSec > 0) {
      resetIsoString = new Date(resetTimeSec * 1000).toISOString();
    }
  }

  if (response.status === 429 || (response.status === 403 && remaining === '0')) {
    throw new GitHubClientError({
      code: 'GITHUB_RATE_LIMITED',
      message: 'GitHub API rate limit exceeded. Please try again later or configure a valid GITHUB_TOKEN.',
      target: targetName,
      rateLimitReset: resetIsoString,
    });
  }

  if (response.status === 404) {
    throw new GitHubClientError({
      code: 'REPOSITORY_NOT_FOUND',
      message: `Repository "${targetName || endpoint}" was not found on GitHub.`,
      target: targetName,
    });
  }

  if (response.status === 401 || response.status === 403) {
    throw new GitHubClientError({
      code: 'PRIVATE_REPOSITORY',
      message: `Repository "${targetName || endpoint}" is private or inaccessible.`,
      target: targetName,
    });
  }

  if (!response.ok) {
    throw new GitHubClientError({
      code: 'GITHUB_DATA_UNAVAILABLE',
      message: `GitHub API returned error status ${response.status}: ${response.statusText}`,
      target: targetName,
    });
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new GitHubClientError({
      code: 'GITHUB_DATA_UNAVAILABLE',
      message: `Failed to parse response JSON from GitHub API for "${targetName || endpoint}".`,
      target: targetName,
    });
  }
}
