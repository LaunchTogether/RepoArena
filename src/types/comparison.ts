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
  avatarUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  isArchived: boolean;
  updatedAt: string;
}

export interface RepositoryMetrics {
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  subscribersCount: number;
  license: string | null;
  hasReadme: boolean;
  hasLicense: boolean;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  pushedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sizeInKb: number;
  language: string | null;
  topics: string[];
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
  value?: string | number;
}

export interface RepositoryComparisonData {
  ref: RepositoryRef;
  summary: RepositorySummary;
  metrics: RepositoryMetrics;
  scores: RepositoryScores;
}

export interface ComparisonResult {
  repoA: RepositoryComparisonData;
  repoB: RepositoryComparisonData;
  reasons: Record<string, ScoreReason[]>;
  winner: 'repoA' | 'repoB' | 'tie';
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
