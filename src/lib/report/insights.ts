import type {
  ComparisonIntent,
  ComparisonReport,
  ComparisonResultInput,
  MetricValue,
  ReportDecisionDriver,
  ReportSourceLedgerEntry,
  RepositoryReportInsights,
  RepositoryReportMetrics,
} from '../../types/comparison';

const REPORT_METRIC_KEYS = [
  'communityHealth',
  'activity',
  'release',
  'issues',
  'pullRequests',
  'workflow',
  'languages',
  'contributors',
  'projectFiles',
] as const satisfies readonly (keyof RepositoryReportMetrics)[];

type MetricKey = (typeof REPORT_METRIC_KEYS)[number];
type ReportMetric<T extends MetricKey> = RepositoryReportMetrics[T];

const INTENT_SUMMARIES: Record<ComparisonIntent, string> = {
  general: 'Balances recent delivery, maintenance signals, and project health evidence.',
  adopting_library: 'Prioritizes release cadence, delivery reliability, and sustained maintenance evidence.',
  contributing: 'Prioritizes contribution workflow, issue responsiveness, and active maintainer signals.',
  reference_project: 'Prioritizes engineering practices, project health, and reusable implementation evidence.',
};

function isAvailable<T>(metric: MetricValue<T>): metric is MetricValue<T> & { value: T } {
  return metric.status === 'available' && metric.value !== null;
}

function successfulWorkflowRate(metric: ReportMetric<'workflow'>): number | null {
  if (!isAvailable(metric) || metric.value.completedRuns === 0) return null;
  return (metric.value.successfulRuns / metric.value.completedRuns) * 100;
}

function projectFileScore(metric: ReportMetric<'projectFiles'>): number | null {
  if (!isAvailable(metric)) return null;
  return Object.values(metric.value).filter(Boolean).length;
}

function appendStrength(strengths: string[], condition: boolean, label: string): void {
  if (condition) strengths.push(label);
}

function appendRisk(risks: string[], condition: boolean, label: string): void {
  if (condition) risks.push(label);
}

function buildRepositoryInsights(metrics: RepositoryReportMetrics): RepositoryReportInsights {
  const strengths: string[] = [];
  const risks: string[] = [];

  if (isAvailable(metrics.activity)) {
    appendStrength(strengths, metrics.activity.value.commitsLast30Days >= 8, 'Recent development activity');
    appendRisk(risks, metrics.activity.value.commitsLast30Days === 0, 'No commits in the last 30 days');
  }

  if (isAvailable(metrics.release)) {
    appendStrength(strengths, metrics.release.value.releasesLastYear >= 2, 'Regular stable releases');
    appendRisk(risks, metrics.release.value.releasesLastYear === 0, 'No stable releases in the last year');
  }

  const workflowRate = successfulWorkflowRate(metrics.workflow);
  appendStrength(strengths, workflowRate !== null && workflowRate >= 80, 'Reliable CI outcomes');
  appendRisk(risks, workflowRate !== null && workflowRate < 50, 'Unreliable CI outcomes');

  if (isAvailable(metrics.pullRequests)) {
    appendStrength(strengths, metrics.pullRequests.value.mergedLast90Days >= 5, 'Active pull request throughput');
    appendRisk(risks, metrics.pullRequests.value.openOlderThan30Days >= 10, 'Growing aged pull request backlog');
  }

  if (isAvailable(metrics.issues)) {
    appendRisk(risks, metrics.issues.value.openOlderThan90Days >= 20, 'Growing long-lived issue backlog');
  }

  if (isAvailable(metrics.communityHealth)) {
    appendStrength(strengths, metrics.communityHealth.value.healthPercentage >= 70, 'Strong community health profile');
    appendRisk(risks, metrics.communityHealth.value.healthPercentage < 40, 'Limited community health documentation');
  }

  if (isAvailable(metrics.projectFiles)) {
    appendStrength(
      strengths,
      metrics.projectFiles.value.hasTests && metrics.projectFiles.value.hasCi && metrics.projectFiles.value.hasLintConfig,
      'Established engineering safeguards'
    );
    appendRisk(risks, !metrics.projectFiles.value.hasTests, 'No test evidence detected');
  }

  return { ...metrics, strengths, risks };
}

function buildSourceLedger(repository: 'repoA' | 'repoB', metrics: RepositoryReportMetrics): ReportSourceLedgerEntry[] {
  return REPORT_METRIC_KEYS.map((metric) => ({
    repository,
    metric,
    status: metrics[metric].status,
    sourceUrl: metrics[metric].sourceUrl,
  }));
}

function numericDriver(
  category: string,
  label: string,
  repoAValue: number | null,
  repoBValue: number | null,
  detail: (leadValue: number, trailingValue: number) => string
): ReportDecisionDriver | null {
  if (repoAValue === null || repoBValue === null || repoAValue === repoBValue) return null;
  const lead = repoAValue > repoBValue ? 'repoA' : 'repoB';
  const leadValue = lead === 'repoA' ? repoAValue : repoBValue;
  const trailingValue = lead === 'repoA' ? repoBValue : repoAValue;
  return { category, label, detail: detail(leadValue, trailingValue), lead };
}

function releaseDriver(repoA: RepositoryReportMetrics, repoB: RepositoryReportMetrics): ReportDecisionDriver | null {
  const repoAValue = isAvailable(repoA.release) ? repoA.release.value.releasesLastYear : null;
  const repoBValue = isAvailable(repoB.release) ? repoB.release.value.releasesLastYear : null;
  return numericDriver(
    'release',
    'Stable release cadence',
    repoAValue,
    repoBValue,
    (leadValue, trailingValue) => `${leadValue} stable releases in the last year, compared with ${trailingValue}.`
  );
}

function activityDriver(repoA: RepositoryReportMetrics, repoB: RepositoryReportMetrics): ReportDecisionDriver | null {
  const repoAValue = isAvailable(repoA.activity) ? repoA.activity.value.commitsLast30Days : null;
  const repoBValue = isAvailable(repoB.activity) ? repoB.activity.value.commitsLast30Days : null;
  return numericDriver(
    'activity',
    'Recent development activity',
    repoAValue,
    repoBValue,
    (leadValue, trailingValue) => `${leadValue} commits in the last 30 days, compared with ${trailingValue}.`
  );
}

function workflowDriver(repoA: RepositoryReportMetrics, repoB: RepositoryReportMetrics): ReportDecisionDriver | null {
  return numericDriver(
    'workflow',
    'Continuous integration reliability',
    successfulWorkflowRate(repoA.workflow),
    successfulWorkflowRate(repoB.workflow),
    (leadValue, trailingValue) => `${Math.round(leadValue)}% completed workflow success, compared with ${Math.round(trailingValue)}%.`
  );
}

function pullRequestDriver(repoA: RepositoryReportMetrics, repoB: RepositoryReportMetrics): ReportDecisionDriver | null {
  const repoAValue = isAvailable(repoA.pullRequests) ? repoA.pullRequests.value.mergedLast90Days : null;
  const repoBValue = isAvailable(repoB.pullRequests) ? repoB.pullRequests.value.mergedLast90Days : null;
  return numericDriver(
    'pull_request',
    'Merged pull request activity',
    repoAValue,
    repoBValue,
    (leadValue, trailingValue) => `${leadValue} pull requests merged in the last 90 days, compared with ${trailingValue}.`
  );
}

function contributorDriver(repoA: RepositoryReportMetrics, repoB: RepositoryReportMetrics): ReportDecisionDriver | null {
  const repoAValue = isAvailable(repoA.contributors) ? repoA.contributors.value.activeContributors : null;
  const repoBValue = isAvailable(repoB.contributors) ? repoB.contributors.value.activeContributors : null;
  return numericDriver(
    'contributors',
    'Active contributor base',
    repoAValue,
    repoBValue,
    (leadValue, trailingValue) => `${leadValue} active contributors, compared with ${trailingValue}.`
  );
}

function projectFilesDriver(repoA: RepositoryReportMetrics, repoB: RepositoryReportMetrics): ReportDecisionDriver | null {
  return numericDriver(
    'project_files',
    'Documented engineering practices',
    projectFileScore(repoA.projectFiles),
    projectFileScore(repoB.projectFiles),
    (leadValue, trailingValue) => `${leadValue} detected project practices, compared with ${trailingValue}.`
  );
}

function communityDriver(repoA: RepositoryReportMetrics, repoB: RepositoryReportMetrics): ReportDecisionDriver | null {
  const repoAValue = isAvailable(repoA.communityHealth) ? repoA.communityHealth.value.healthPercentage : null;
  const repoBValue = isAvailable(repoB.communityHealth) ? repoB.communityHealth.value.healthPercentage : null;
  return numericDriver(
    'community',
    'Community health profile',
    repoAValue,
    repoBValue,
    (leadValue, trailingValue) => `${leadValue}% community health, compared with ${trailingValue}%.`
  );
}

function decisionDrivers(
  repoA: RepositoryReportMetrics,
  repoB: RepositoryReportMetrics,
  intent: ComparisonIntent
): ReportDecisionDriver[] {
  const candidatesByIntent: Record<ComparisonIntent, Array<() => ReportDecisionDriver | null>> = {
    general: [
      () => activityDriver(repoA, repoB),
      () => workflowDriver(repoA, repoB),
      () => releaseDriver(repoA, repoB),
      () => pullRequestDriver(repoA, repoB),
    ],
    adopting_library: [
      () => releaseDriver(repoA, repoB),
      () => workflowDriver(repoA, repoB),
      () => activityDriver(repoA, repoB),
      () => projectFilesDriver(repoA, repoB),
    ],
    contributing: [
      () => pullRequestDriver(repoA, repoB),
      () => contributorDriver(repoA, repoB),
      () => communityDriver(repoA, repoB),
      () => activityDriver(repoA, repoB),
    ],
    reference_project: [
      () => projectFilesDriver(repoA, repoB),
      () => communityDriver(repoA, repoB),
      () => workflowDriver(repoA, repoB),
      () => activityDriver(repoA, repoB),
    ],
  };

  return candidatesByIntent[intent]
    .map((candidate) => candidate())
    .filter((driver): driver is ReportDecisionDriver => driver !== null)
    .slice(0, 3);
}

export function generateReportInsights(
  result: ComparisonResultInput,
  intent: ComparisonIntent
): ComparisonReport {
  const repoA = buildRepositoryInsights(result.repoA.report);
  const repoB = buildRepositoryInsights(result.repoB.report);
  const sourceLedger = [
    ...buildSourceLedger('repoA', result.repoA.report),
    ...buildSourceLedger('repoB', result.repoB.report),
  ];
  const total = sourceLedger.length;
  const available = sourceLedger.filter((entry) => entry.status === 'available').length;

  return {
    intent,
    generatedAt: result.createdAt,
    intentSummary: INTENT_SUMMARIES[intent],
    coverage: { available, total },
    repoA,
    repoB,
    sourceLedger,
    decisionDrivers: decisionDrivers(result.repoA.report, result.repoB.report, intent),
  };
}
