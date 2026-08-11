import { describe, expect, it } from 'vitest';
import { buildComparisonSharePath } from './snapshot';

describe('buildComparisonSharePath', () => {
  it('preserves both repositories and the selected intent in a stable public path', () => {
    expect(buildComparisonSharePath({
      repoA: 'https://github.com/facebook/react',
      repoB: 'https://github.com/vuejs/core',
      intent: 'contributing',
    })).toBe('/compare/facebook/react/vs/vuejs/core?intent=contributing');
  });

  it('does not serialize report payloads or credentials into the share path', () => {
    const path = buildComparisonSharePath({
      repoA: 'https://github.com/facebook/react',
      repoB: 'https://github.com/vuejs/core',
      intent: 'general',
    });

    expect(path).not.toContain('report=');
    expect(path).not.toContain('token');
  });
});
