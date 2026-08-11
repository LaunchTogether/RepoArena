import type { ComparisonIntent } from '../../types/comparison';
import { parseGitHubUrl } from '../github/parser';

type ComparisonShareInput = {
  repoA: string;
  repoB: string;
  intent: ComparisonIntent;
};

export function buildComparisonSharePath({ repoA, repoB, intent }: ComparisonShareInput): string {
  const first = parseGitHubUrl(repoA);
  const second = parseGitHubUrl(repoB);
  const query = intent === 'general' ? '' : `?intent=${encodeURIComponent(intent)}`;

  return `/compare/${encodeURIComponent(first.owner)}/${encodeURIComponent(first.name)}/vs/${encodeURIComponent(second.owner)}/${encodeURIComponent(second.name)}${query}`;
}
