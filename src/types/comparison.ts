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
}

export interface ComparisonResult {
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
