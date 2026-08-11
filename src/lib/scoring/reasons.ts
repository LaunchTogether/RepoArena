import { ComparisonReasons, ScoreReason } from '../../types/comparison';
import { FetchedRepositoryInfo } from '../github/repositories';

function reason(kind: ScoreReason['kind'], label: string, value: ScoreReason['value']): ScoreReason {
  return { kind, label, value };
}

function repositoryReasons(repository: FetchedRepositoryInfo): ComparisonReasons {
  const { metrics, ref, summary } = repository;
  const name = ref.fullName;

  return {
    activity: [
      reason(metrics.pushedAt ? 'positive' : 'negative', `${name}: latest push timestamp.`, metrics.pushedAt),
      reason(metrics.updatedAt ? 'positive' : 'negative', `${name}: latest repository update timestamp.`, metrics.updatedAt),
    ],
    maintenance: [
      reason(summary.isArchived === false ? 'positive' : 'negative', `${name}: archive status.`, summary.isArchived),
      reason(
        metrics.openIssuesCount !== null && metrics.openIssuesCount <= 100 ? 'positive' : 'negative',
        `${name}: open issue count.`,
        metrics.openIssuesCount
      ),
    ],
    community: [
      reason(
        metrics.forksCount !== null && metrics.forksCount > 0 ? 'positive' : 'negative',
        `${name}: fork count.`,
        metrics.forksCount
      ),
      reason(
        metrics.hasContributing === true ? 'positive' : 'negative',
        `${name}: contributing guide availability.`,
        metrics.hasContributing
      ),
    ],
    codebase: [
      reason(metrics.language ? 'positive' : 'negative', `${name}: primary language.`, metrics.language),
      reason(
        metrics.topics !== null && metrics.topics.length > 0 ? 'positive' : 'negative',
        `${name}: repository topic count.`,
        metrics.topics?.length ?? null
      ),
    ],
    documentation: [
      reason(metrics.hasReadme === true ? 'positive' : 'negative', `${name}: README availability.`, metrics.hasReadme),
      reason(
        summary.description ? 'positive' : 'negative',
        `${name}: repository description.`,
        summary.description
      ),
    ],
    popularity: [
      reason(
        metrics.starsCount !== null && metrics.starsCount > 0 ? 'positive' : 'negative',
        `${name}: star count.`,
        metrics.starsCount
      ),
      reason(
        metrics.forksCount !== null && metrics.forksCount > 0 ? 'positive' : 'negative',
        `${name}: fork count.`,
        metrics.forksCount
      ),
    ],
    health: [
      reason(metrics.hasLicense === true ? 'positive' : 'negative', `${name}: license availability.`, metrics.hasLicense),
      reason(
        metrics.hasCodeOfConduct === true ? 'positive' : 'negative',
        `${name}: code of conduct availability.`,
        metrics.hasCodeOfConduct
      ),
    ],
  };
}

export function generateComparisonReasons(
  repoA: FetchedRepositoryInfo,
  repoB: FetchedRepositoryInfo
): ComparisonReasons {
  const reasonsA = repositoryReasons(repoA);
  const reasonsB = repositoryReasons(repoB);

  return {
    activity: [...reasonsA.activity, ...reasonsB.activity],
    maintenance: [...reasonsA.maintenance, ...reasonsB.maintenance],
    community: [...reasonsA.community, ...reasonsB.community],
    codebase: [...reasonsA.codebase, ...reasonsB.codebase],
    documentation: [...reasonsA.documentation, ...reasonsB.documentation],
    popularity: [...reasonsA.popularity, ...reasonsB.popularity],
    health: [...reasonsA.health, ...reasonsB.health],
  };
}
