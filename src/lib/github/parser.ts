import { CompareErrorCode, RepositoryRef } from '../../types/comparison';

export class GitHubParserError extends Error {
  public readonly code: CompareErrorCode = 'INVALID_REPOSITORY_URL';
  public readonly input: string;

  constructor(message: string, input: string) {
    super(message);
    this.name = 'GitHubParserError';
    this.input = input;
  }
}

/**
 * Parses and validates a GitHub repository URL or short format string.
 *
 * Acceptable formats:
 * - https://github.com/owner/repository
 * - http://github.com/owner/repository
 * - https://github.com/owner/repository.git
 * - https://github.com/owner/repository/
 * - owner/repository
 *
 * Rejection criteria:
 * - Empty or whitespace-only inputs
 * - Non-GitHub hosts (e.g. gitlab.com)
 * - Query parameters (?ref=main) or hashes (#readme)
 * - Extra path segments (e.g. owner/repo/tree/main)
 * - Missing owner or repository segment
 */
export function parseGitHubUrl(input: string): RepositoryRef {
  if (!input || typeof input !== 'string') {
    throw new GitHubParserError('Repository URL or short format cannot be empty.', input ?? '');
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new GitHubParserError('Repository URL or short format cannot be empty.', input);
  }

  // Reject query params or hashes
  if (trimmed.includes('?') || trimmed.includes('#')) {
    throw new GitHubParserError(
      'Repository URL must not contain query parameters or hash anchors.',
      input
    );
  }

  let pathString = trimmed;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      throw new GitHubParserError('Invalid URL format.', input);
    }

    const host = url.hostname.toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com') {
      throw new GitHubParserError(`Only github.com repository URLs are supported (got ${host}).`, input);
    }

    pathString = url.pathname;
  }

  // Normalize pathString: remove leading/trailing slashes and optional .git extension
  let cleanPath = pathString.replace(/^\/+|\/+$/g, '');
  if (cleanPath.endsWith('.git')) {
    cleanPath = cleanPath.slice(0, -4);
  }
  cleanPath = cleanPath.replace(/^\/+|\/+$/g, '');

  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length !== 2) {
    throw new GitHubParserError(
      `Invalid repository format "${input}". Expected "owner/repository" or "https://github.com/owner/repository".`,
      input
    );
  }

  const [owner, name] = segments;

  // Validate owner and name contain valid GitHub name characters
  const validSegmentRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!validSegmentRegex.test(owner) || !validSegmentRegex.test(name)) {
    throw new GitHubParserError(
      `Invalid repository owner or name characters in "${input}".`,
      input
    );
  }

  const fullName = `${owner}/${name}`;
  const canonicalUrl = `https://github.com/${fullName}`;

  return {
    owner,
    name,
    fullName,
    url: canonicalUrl,
  };
}
