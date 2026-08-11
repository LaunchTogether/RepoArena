import { z } from 'zod';
import { CompareErrorCode, CompareErrorResponse, ComparisonResult } from '../../../types/comparison';
import { parseGitHubUrl, GitHubParserError } from '../../../lib/github/parser';
import { fetchRepositoryData } from '../../../lib/github/repositories';
import { GitHubClientError } from '../../../lib/github/client';
import { compareRepositories } from '../../../lib/scoring/engine';

export interface CompareRequestBody {
  repoA: string;
  repoB: string;
}

const compareRequestSchema = z
  .object({
    repoA: z.string().trim().min(1),
    repoB: z.string().trim().min(1),
  })
  .strict();

function buildErrorResponse(
  code: CompareErrorCode,
  message: string,
  target?: string,
  rateLimitReset?: string,
  status: number = 400
): Response {
  const payload: CompareErrorResponse = {
    error: {
      code,
      message,
      target,
      rateLimitReset,
    },
  };
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * POST /api/compare
 * Body: { repoA: string, repoB: string }
 *
 * Validates repository URLs, fetches GitHub API metrics concurrently,
 * evaluates scores and reasons, and returns ComparisonResult (HTTP 200)
 * or CompareErrorResponse (HTTP 400/403/404/429/503).
 */
export async function POST(request: Request): Promise<Response> {
  let body: CompareRequestBody;
  try {
    body = compareRequestSchema.parse(await request.json());
  } catch {
    return buildErrorResponse(
      'INVALID_REPOSITORY_URL',
      'Provide exactly two non-empty repository URL fields: repoA and repoB.',
      undefined,
      undefined,
      400
    );
  }

  const { repoA, repoB } = body;

  // Parse & validate URLs
  let refA;
  try {
    refA = parseGitHubUrl(repoA);
  } catch (err) {
    if (err instanceof GitHubParserError) {
      return buildErrorResponse(err.code, err.message, repoA, undefined, 400);
    }
    return buildErrorResponse('INVALID_REPOSITORY_URL', 'Failed to parse repoA URL.', repoA, undefined, 400);
  }

  let refB;
  try {
    refB = parseGitHubUrl(repoB);
  } catch (err) {
    if (err instanceof GitHubParserError) {
      return buildErrorResponse(err.code, err.message, repoB, undefined, 400);
    }
    return buildErrorResponse('INVALID_REPOSITORY_URL', 'Failed to parse repoB URL.', repoB, undefined, 400);
  }

  // Fetch repository data concurrently & compute comparison
  try {
    const [repoAData, repoBData] = await Promise.all([
      fetchRepositoryData(refA),
      fetchRepositoryData(refB),
    ]);

    const result: ComparisonResult = compareRepositories(repoAData, repoBData);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (err instanceof GitHubClientError) {
      let status = 400;
      if (err.code === 'REPOSITORY_NOT_FOUND') status = 404;
      else if (err.code === 'PRIVATE_REPOSITORY') status = 403;
      else if (err.code === 'GITHUB_RATE_LIMITED') status = 429;
      else if (err.code === 'GITHUB_DATA_UNAVAILABLE') status = 503;

      return buildErrorResponse(err.code, err.message, err.target, err.rateLimitReset, status);
    }

    return buildErrorResponse(
      'GITHUB_DATA_UNAVAILABLE',
      'Repository data is temporarily unavailable. Please try again shortly.',
      undefined,
      undefined,
      503
    );
  }
}
