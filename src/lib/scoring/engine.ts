import { ComparisonIntent, ComparisonResult, ComparisonResultInput } from '../../types/comparison';
import { FetchedRepositoryInfo } from '../github/repositories';
import { generateReportInsights } from '../report/insights';
import { computeRepositoryScores } from './categories';
import { generateComparisonReasons } from './reasons';

/**
 * Computes category scores, reasons, and overall winner for two repositories.
 * Returns complete, typed ComparisonResult payload.
 */
export function compareRepositories(
  repoAInfo: FetchedRepositoryInfo,
  repoBInfo: FetchedRepositoryInfo,
  intent: ComparisonIntent = 'general'
): ComparisonResult {
  const scoresA = computeRepositoryScores(repoAInfo.metrics, repoAInfo.summary);
  const scoresB = computeRepositoryScores(repoBInfo.metrics, repoBInfo.summary);

  const reasons = generateComparisonReasons(repoAInfo, repoBInfo);

  let winner: 'repoA' | 'repoB' | null = null;
  if (scoresA.overall > scoresB.overall) {
    winner = 'repoA';
  } else if (scoresB.overall > scoresA.overall) {
    winner = 'repoB';
  }

  const result: ComparisonResultInput = {
    repoA: {
      ref: repoAInfo.ref,
      summary: repoAInfo.summary,
      metrics: repoAInfo.metrics,
      scores: scoresA,
      report: repoAInfo.report,
    },
    repoB: {
      ref: repoBInfo.ref,
      summary: repoBInfo.summary,
      metrics: repoBInfo.metrics,
      scores: scoresB,
      report: repoBInfo.report,
    },
    reasons,
    winner,
    createdAt: new Date().toISOString(),
  };

  return {
    ...result,
    report: generateReportInsights(result, intent),
  };
}
