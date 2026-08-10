export type ScoreCategory =
  | "activity"
  | "maintenance"
  | "community"
  | "codebase"
  | "documentation"
  | "popularity"
  | "health";

export type ScoreReason = {
  kind: "positive" | "negative";
  label: string;
};

export type RepositoryPreview = {
  fullName: string;
  owner: string;
  name: string;
  description: string;
  avatarUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  primaryLanguage: string;
};

export type RepositoryScorePreview = Record<ScoreCategory | "overall", number>;

export type RepositoryAnalysisPreview = {
  repository: RepositoryPreview;
  scores: RepositoryScorePreview;
  reasons: Record<ScoreCategory, ScoreReason[]>;
};

export type ComparisonResultPreview = {
  repoA: RepositoryAnalysisPreview;
  repoB: RepositoryAnalysisPreview;
  winner: "repoA" | "repoB" | null;
  generatedAt: string;
};
