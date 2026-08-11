export type CompareErrorCode =
  | 'INVALID_REPOSITORY_URL'
  | 'REPOSITORY_NOT_FOUND'
  | 'PRIVATE_REPOSITORY'
  | 'GITHUB_RATE_LIMITED'
  | 'GITHUB_DATA_UNAVAILABLE';

export interface RepositoryRef {
  owner: string;
  name: string;
  fullName: string;
  url: string;
}

export interface RepositorySummary {
  name: string;
  description: string | null;
  avatarUrl: string | null;
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  defaultBranch: string | null;
  isArchived: boolean | null;
  updatedAt: string | null;
}

export interface RepositoryMetrics {
  starsCount: number | null;
  forksCount: number | null;
  openIssuesCount: number | null;
  subscribersCount: number | null;
  license: string | null;
  hasReadme: boolean | null;
  hasLicense: boolean | null;
  hasContributing: boolean | null;
  hasCodeOfConduct: boolean | null;
  pushedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sizeInKb: number | null;
  language: string | null;
  topics: string[] | null;
}

export interface RepositoryScores {
  activity: number;
  maintenance: number;
  community: number;
  codebase: number;
  documentation: number;
  popularity: number;
  health: number;
  overall: number;
}

export interface ScoreReason {
  kind: 'positive' | 'negative';
  label: string;
  value?: string | number | boolean | null;
}

export type ScoreCategory = Exclude<keyof RepositoryScores, 'overall'>;

export type ComparisonReasons = Record<ScoreCategory, ScoreReason[]>;

export interface RepositoryComparisonData {
  ref: RepositoryRef;
  summary: RepositorySummary;
  metrics: RepositoryMetrics;
  scores: RepositoryScores;
  report: RepositoryReportMetrics;
}

export interface ComparisonResultInput {
  repoA: RepositoryComparisonData;
  repoB: RepositoryComparisonData;
  reasons: ComparisonReasons;
  winner: 'repoA' | 'repoB' | null;
  createdAt: string;
}

export interface CompareErrorDetail {
  code: CompareErrorCode;
  message: string;
  target?: string;
  rateLimitReset?: string;
}

export interface CompareErrorResponse {
  error: CompareErrorDetail;
}

export type ComparisonIntent =
  | "general"
  | "adopting_library"
  | "contributing"
  | "reference_project";

export type MetricStatus = "available" | "unknown" | "not_configured" | "not_applicable";

export interface MetricValue<T> {
  value: T | null;
  status: MetricStatus;
  sourceUrl: string | null;
}

export interface RepositoryReportMetrics {
  communityHealth: MetricValue<{
    healthPercentage: number;
    hasIssueTemplate: boolean;
    hasPullRequestTemplate: boolean;
  }>;
  activity: MetricValue<{
    commitsLast7Days: number;
    commitsLast30Days: number;
    commitsLast90Days: number;
    activeWeeksLast52: number;
    trend: "up" | "down" | "flat";
  }>;
  release: MetricValue<{
    latestName: string | null;
    latestPublishedAt: string | null;
    releasesLastYear: number;
    averageIntervalDays: number | null;
  }>;
  issues: MetricValue<{
    openedLast90Days: number;
    closedLast90Days: number;
    openOlderThan90Days: number;
    medianCloseDays: number | null;
  }>;
  pullRequests: MetricValue<{
    mergedLast90Days: number;
    openOlderThan30Days: number;
    medianMergeDays: number | null;
  }>;
  workflow: MetricValue<{
    completedRuns: number;
    successfulRuns: number;
    lastConclusion: string | null;
    lastRunAt: string | null;
  }>;
  languages: MetricValue<{
    totalBytes: number;
    distribution: Array<{ name: string; bytes: number; percentage: number }>;
  }>;
  contributors: MetricValue<{
    activeContributors: number;
    topContributorShare: number | null;
  }>;
  projectFiles: MetricValue<{
    hasSecurityPolicy: boolean;
    hasChangelog: boolean;
    hasTests: boolean;
    hasCi: boolean;
    hasLockfile: boolean;
    hasDocker: boolean;
    hasLintConfig: boolean;
  }>;
}

export interface ReportDecisionDriver {
  category: string;
  label: string;
  detail: string;
  lead: "repoA" | "repoB";
}

export interface RepositoryReportInsights extends RepositoryReportMetrics {
  strengths: string[];
  risks: string[];
}

export interface ReportSourceLedgerEntry {
  repository: "repoA" | "repoB";
  metric: keyof RepositoryReportMetrics;
  status: MetricStatus;
  sourceUrl: string | null;
}

export interface ComparisonReport {
  intent: ComparisonIntent;
  generatedAt: string;
  intentSummary: string;
  coverage: {
    available: number;
    total: number;
  };
  repoA: RepositoryReportInsights;
  repoB: RepositoryReportInsights;
  sourceLedger: ReportSourceLedgerEntry[];
  decisionDrivers: ReportDecisionDriver[];
}

export interface ComparisonResult extends ComparisonResultInput {
  report: ComparisonReport;
}
