import type { RepositoryScores } from '../../types/comparison';

export const SCORE_WEIGHTS = {
  activity: 0.2,
  maintenance: 0.2,
  community: 0.15,
  codebase: 0.15,
  documentation: 0.15,
  popularity: 0.05,
  health: 0.1,
} as const satisfies Record<Exclude<keyof RepositoryScores, 'overall'>, number>;
