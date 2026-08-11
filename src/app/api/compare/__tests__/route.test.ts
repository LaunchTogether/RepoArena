import { describe, it, expect } from 'vitest';
import { POST } from '../route';
import { ComparisonResult, CompareErrorResponse } from '../../../../types/comparison';

describe('POST /api/compare Endpoint', () => {
  it('should return 200 and ComparisonResult for valid repositories (facebook/react vs vuejs/core)', async () => {
    const request = new Request('http://localhost/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoA: 'facebook/react',
        repoB: 'vuejs/core',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const result = (await response.json()) as ComparisonResult;
    expect(result.repoA.ref.fullName).toBe('facebook/react');
    expect(result.repoB.ref.fullName).toBe('vuejs/core');
    expect(result.repoA.scores.overall).toBeGreaterThan(0);
    expect(result.repoB.scores.overall).toBeGreaterThan(0);
    expect(['repoA', 'repoB', 'tie']).toContain(result.winner);
  }, 20000);

  it('should return 400 and INVALID_REPOSITORY_URL for invalid URL input', async () => {
    const request = new Request('http://localhost/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoA: 'invalid-url-format',
        repoB: 'vuejs/core',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const result = (await response.json()) as CompareErrorResponse;
    expect(result.error.code).toBe('INVALID_REPOSITORY_URL');
  });

  it('should return 404 and REPOSITORY_NOT_FOUND for non-existent repository', async () => {
    const request = new Request('http://localhost/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoA: 'facebook/non-existent-repo-9999999',
        repoB: 'vuejs/core',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);

    const result = (await response.json()) as CompareErrorResponse;
    expect(result.error.code).toBe('REPOSITORY_NOT_FOUND');
  }, 20000);
});
