import { RepositoryMetrics, RepositoryScores, RepositorySummary } from '../../types/comparison';

function clamp(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function daysSince(dateIsoString: string | null): number | null {
  if (!dateIsoString) return null;
  const date = new Date(dateIsoString);
  if (isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function calculateActivityScore(metrics: RepositoryMetrics, isArchived: boolean): number {
  if (isArchived) return 10;

  const days = daysSince(metrics.pushedAt || metrics.updatedAt);
  if (days === null) return 50;

  if (days <= 7) return 100;
  if (days <= 30) return 90;
  if (days <= 90) return 75;
  if (days <= 180) return 55;
  if (days <= 365) return 35;
  return 15;
}

export function calculateMaintenanceScore(metrics: RepositoryMetrics, isArchived: boolean): number {
  if (isArchived) return 5;

  let score = 100;

  if (!metrics.hasLicense) score -= 20;

  const days = daysSince(metrics.pushedAt || metrics.updatedAt);
  if (days !== null && days > 365) score -= 30;
  else if (days !== null && days > 180) score -= 15;

  if (metrics.openIssuesCount > 2000) score -= 25;
  else if (metrics.openIssuesCount > 500) score -= 15;
  else if (metrics.openIssuesCount > 100) score -= 5;

  return clamp(score);
}

export function calculateCommunityScore(metrics: RepositoryMetrics): number {
  let score = 20;

  if (metrics.hasContributing) score += 25;
  if (metrics.hasCodeOfConduct) score += 20;

  if (metrics.subscribersCount >= 100) score += 25;
  else if (metrics.subscribersCount >= 10) score += 15;

  if (metrics.forksCount >= 500) score += 30;
  else if (metrics.forksCount >= 50) score += 20;
  else if (metrics.forksCount >= 5) score += 10;

  return clamp(score);
}

export function calculateCodebaseScore(metrics: RepositoryMetrics): number {
  let score = 30;

  if (metrics.language) score += 25;

  const topicsCount = metrics.topics.length;
  if (topicsCount >= 5) score += 25;
  else if (topicsCount >= 1) score += 15;

  if (metrics.sizeInKb > 50 && metrics.sizeInKb < 1000000) score += 20;

  return clamp(score);
}

export function calculateDocumentationScore(metrics: RepositoryMetrics, summary: RepositorySummary): number {
  let score = 0;

  if (metrics.hasReadme) score += 50;
  if (summary.description && summary.description.trim().length > 10) score += 25;
  if (metrics.hasContributing) score += 25;

  return clamp(score);
}

export function calculatePopularityScore(metrics: RepositoryMetrics): number {
  const stars = metrics.starsCount;
  if (stars === 0) return 0;

  // Logarithmic scaling for stars up to 100k+
  // log10(10)=1 -> 20, log10(100)=2 -> 40, log10(1000)=3 -> 60, log10(10000)=4 -> 80, log10(100000)=5 -> 100
  const starScore = Math.min(100, Math.log10(stars) * 20);

  const forkBonus = metrics.forksCount > 100 ? 10 : metrics.forksCount > 10 ? 5 : 0;

  return clamp(starScore + forkBonus);
}

export function calculateHealthScore(metrics: RepositoryMetrics, isArchived: boolean): number {
  if (isArchived) return 10;

  let score = 0;

  if (metrics.hasReadme) score += 25;
  if (metrics.hasLicense) score += 25;
  if (metrics.hasContributing) score += 25;
  if (metrics.hasCodeOfConduct) score += 25;

  return clamp(score);
}

export function calculateOverallScore(categoryScores: Omit<RepositoryScores, 'overall'>): number {
  const weights = {
    activity: 0.20,
    maintenance: 0.20,
    documentation: 0.15,
    community: 0.15,
    popularity: 0.15,
    codebase: 0.075,
    health: 0.075,
  };

  const weightedSum =
    categoryScores.activity * weights.activity +
    categoryScores.maintenance * weights.maintenance +
    categoryScores.documentation * weights.documentation +
    categoryScores.community * weights.community +
    categoryScores.popularity * weights.popularity +
    categoryScores.codebase * weights.codebase +
    categoryScores.health * weights.health;

  return clamp(weightedSum);
}

export function computeRepositoryScores(metrics: RepositoryMetrics, summary: RepositorySummary): RepositoryScores {
  const isArchived = summary.isArchived;

  const activity = calculateActivityScore(metrics, isArchived);
  const maintenance = calculateMaintenanceScore(metrics, isArchived);
  const community = calculateCommunityScore(metrics);
  const codebase = calculateCodebaseScore(metrics);
  const documentation = calculateDocumentationScore(metrics, summary);
  const popularity = calculatePopularityScore(metrics);
  const health = calculateHealthScore(metrics, isArchived);

  const overall = calculateOverallScore({
    activity,
    maintenance,
    community,
    codebase,
    documentation,
    popularity,
    health,
  });

  return {
    activity,
    maintenance,
    community,
    codebase,
    documentation,
    popularity,
    health,
    overall,
  };
}
