import { ComparisonResult } from '../../types/comparison';
import { FetchedRepositoryInfo } from '../github/repositories';
import { computeRepositoryScores } from './categories';
import { generateComparisonReasons } from './reasons';

/**
 * Computes category scores, reasons, and overall winner for two repositories.
 * Returns complete, typed ComparisonResult payload.
 */
export function compareRepositories(
  repoAInfo: FetchedRepositoryInfo,
  repoBInfo: FetchedRepositoryInfo
): ComparisonResult {
  const scoresA = computeRepositoryScores(repoAInfo.metrics, repoAInfo.summary);
  const scoresB = computeRepositoryScores(repoBInfo.metrics, repoBInfo.summary);

  const reasons = generateComparisonReasons(repoAInfo, repoBInfo);

  let winner: 'repoA' | 'repoB' | 'tie' = 'tie';
  if (scoresA.overall > scoresB.overall) {
    winner = 'repoA';
  } else if (scoresB.overall > scoresA.overall) {
    winner = 'repoB';
  }

  return {
    repoA: {
      ref: repoAInfo.ref,
      summary: repoAInfo.summary,
      metrics: repoAInfo.metrics,
      scores: scoresA,
    },
    repoB: {
      ref: repoBInfo.ref,
      summary: repoBInfo.summary,
      metrics: repoBInfo.metrics,
      scores: scoresB,
    },
    reasons,
    winner,
    createdAt: new Date().toISOString(),
  };
}
