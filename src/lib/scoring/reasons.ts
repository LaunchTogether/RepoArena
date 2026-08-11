import { ScoreReason } from '../../types/comparison';
import { FetchedRepositoryInfo } from '../github/repositories';

export function generateRepositoryReasons(repo: FetchedRepositoryInfo): ScoreReason[] {
  const reasons: ScoreReason[] = [];
  const { metrics, summary } = repo;

  // Activity & Maintenance
  if (summary.isArchived) {
    reasons.push({
      kind: 'negative',
      label: 'Depo arşivlenmiş (read-only) durumda',
    });
  } else {
    reasons.push({
      kind: 'positive',
      label: 'Depo aktif olarak sürdürülüyor',
    });
  }

  // Documentation
  if (metrics.hasReadme) {
    reasons.push({
      kind: 'positive',
      label: 'Detaylı README dokümantasyonu mevcut',
    });
  } else {
    reasons.push({
      kind: 'negative',
      label: 'README dosyası bulunamadı',
    });
  }

  // License
  if (metrics.hasLicense && metrics.license) {
    reasons.push({
      kind: 'positive',
      label: `Açık kaynak lisansı tanımlı (${metrics.license})`,
      value: metrics.license,
    });
  } else {
    reasons.push({
      kind: 'negative',
      label: 'Açık lisans bilgisi tanımlı değil',
    });
  }

  // Community files
  if (metrics.hasContributing) {
    reasons.push({
      kind: 'positive',
      label: 'Katkı sağlama kılavuzu (CONTRIBUTING) mevcut',
    });
  }

  if (metrics.hasCodeOfConduct) {
    reasons.push({
      kind: 'positive',
      label: 'Davranış kuralları (CODE_OF_CONDUCT) mevcut',
    });
  }

  // Popularity & Community
  if (metrics.starsCount > 1000) {
    reasons.push({
      kind: 'positive',
      label: `Yüksek topluluk ilgisi (${metrics.starsCount.toLocaleString()} yıldız)`,
      value: metrics.starsCount,
    });
  }

  return reasons;
}

export function generateComparisonReasons(
  repoA: FetchedRepositoryInfo,
  repoB: FetchedRepositoryInfo
): Record<string, ScoreReason[]> {
  const categoryReasons: Record<string, ScoreReason[]> = {
    overall: [],
    activity: [],
    maintenance: [],
    community: [],
    codebase: [],
    documentation: [],
    popularity: [],
    health: [],
  };

  // Documentation comparison
  if (repoA.metrics.hasReadme && !repoB.metrics.hasReadme) {
    categoryReasons.documentation.push({
      kind: 'positive',
      label: `${repoA.ref.fullName} deposunda README mevcutken, ${repoB.ref.fullName} deposunda bulunmuyor.`,
    });
  } else if (!repoA.metrics.hasReadme && repoB.metrics.hasReadme) {
    categoryReasons.documentation.push({
      kind: 'positive',
      label: `${repoB.ref.fullName} deposunda README mevcutken, ${repoA.ref.fullName} deposunda bulunmuyor.`,
    });
  }

  // License comparison
  if (repoA.metrics.hasLicense && !repoB.metrics.hasLicense) {
    categoryReasons.maintenance.push({
      kind: 'positive',
      label: `${repoA.ref.fullName} açık lisansa (${repoA.metrics.license}) sahip.`,
    });
  } else if (!repoA.metrics.hasLicense && repoB.metrics.hasLicense) {
    categoryReasons.maintenance.push({
      kind: 'positive',
      label: `${repoB.ref.fullName} açık lisansa (${repoB.metrics.license}) sahip.`,
    });
  }

  // Archive status
  if (repoA.summary.isArchived && !repoB.summary.isArchived) {
    categoryReasons.maintenance.push({
      kind: 'negative',
      label: `${repoA.ref.fullName} arşivlenmiş proje, ${repoB.ref.fullName} ise aktif durumda.`,
    });
  } else if (!repoA.summary.isArchived && repoB.summary.isArchived) {
    categoryReasons.maintenance.push({
      kind: 'negative',
      label: `${repoB.ref.fullName} arşivlenmiş proje, ${repoA.ref.fullName} ise aktif durumda.`,
    });
  }

  // Popularity comparison
  const starDiff = Math.abs(repoA.metrics.starsCount - repoB.metrics.starsCount);
  if (starDiff > 1000) {
    const winnerRepo = repoA.metrics.starsCount > repoB.metrics.starsCount ? repoA : repoB;
    categoryReasons.popularity.push({
      kind: 'positive',
      label: `${winnerRepo.ref.fullName} deposu ${starDiff.toLocaleString()} daha fazla yıldıza sahip.`,
      value: winnerRepo.metrics.starsCount,
    });
  }

  // Add individual repo reasons to category reasons
  categoryReasons.overall.push(...generateRepositoryReasons(repoA));

  return categoryReasons;
}
