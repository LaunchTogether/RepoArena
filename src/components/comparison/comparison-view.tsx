import { CategoryBattle } from "@/components/comparison/category-battle";
import Link from "next/link";
import { ComparisonSummary } from "@/components/comparison/comparison-summary";
import { OverallScore } from "@/components/comparison/overall-score";
import { RepositoryHeader } from "@/components/comparison/repository-header";
import { ScoreReasons } from "@/components/comparison/score-reasons";
import type { ComparisonResultPreview, RepositoryAnalysisPreview, ScoreCategory } from "@/lib/preview/types";
import type { ComparisonResult } from "@/types/comparison";

const categories: { key: ScoreCategory; label: string }[] = [
  { key: "activity", label: "Activity" },
  { key: "maintenance", label: "Maintenance" },
  { key: "community", label: "Community" },
  { key: "codebase", label: "Codebase health" },
  { key: "documentation", label: "Documentation" },
  { key: "popularity", label: "Popularity" },
  { key: "health", label: "Project health" },
];

function isLiveResult(result: ComparisonResultPreview | ComparisonResult): result is ComparisonResult {
  return "createdAt" in result;
}

function liveRepositoryAnalysis(
  result: ComparisonResult,
  side: "repoA" | "repoB"
): RepositoryAnalysisPreview {
  const repository = result[side];
  const prefix = `${repository.ref.fullName}:`;

  return {
    repository: {
      fullName: repository.ref.fullName,
      owner: repository.ref.owner,
      name: repository.summary.name,
      description: repository.summary.description,
      avatarUrl: repository.summary.avatarUrl,
      stars: repository.summary.stars,
      forks: repository.summary.forks,
      openIssues: repository.summary.openIssues,
      primaryLanguage: repository.metrics.language,
    },
    scores: repository.scores,
    reasons: {
      activity: result.reasons.activity.filter((reason) => reason.label.startsWith(prefix)),
      maintenance: result.reasons.maintenance.filter((reason) => reason.label.startsWith(prefix)),
      community: result.reasons.community.filter((reason) => reason.label.startsWith(prefix)),
      codebase: result.reasons.codebase.filter((reason) => reason.label.startsWith(prefix)),
      documentation: result.reasons.documentation.filter((reason) => reason.label.startsWith(prefix)),
      popularity: result.reasons.popularity.filter((reason) => reason.label.startsWith(prefix)),
      health: result.reasons.health.filter((reason) => reason.label.startsWith(prefix)),
    },
  };
}

export function ComparisonView({ result }: { result: ComparisonResultPreview | ComparisonResult }) {
  const isLive = isLiveResult(result);
  const repoA = isLive ? liveRepositoryAnalysis(result, "repoA") : result.repoA;
  const repoB = isLive ? liveRepositoryAnalysis(result, "repoB") : result.repoB;
  const winner = result.winner === "repoA" ? repoA : result.winner === "repoB" ? repoB : null;

  return (
    <main className="comparison-page">
      <div className="comparison-topline">
        <Link className="brand" href="/">RepoArena</Link>
        <p>{isLive ? "Live GitHub analysis" : "Preview result"} <span aria-hidden="true">·</span> {isLive ? "generated from current repository data" : "sample scoring data"}</p>
      </div>
      <section className="comparison-hero" aria-label="Repository overview">
        <RepositoryHeader repository={repoA.repository} position="A" />
        <div className="comparison-vs" aria-hidden="true"><span>VS</span></div>
        <RepositoryHeader repository={repoB.repository} position="B" />
      </section>
      <OverallScore
        repoAName={repoA.repository.name}
        repoBName={repoB.repository.name}
        repoAScore={repoA.scores.overall}
        repoBScore={repoB.scores.overall}
        winner={result.winner}
      />
      <section className="category-section" aria-labelledby="category-title">
        <div className="section-intro">
          <p className="eyebrow">Category scorecards</p>
          <h2 id="category-title">Where the difference comes from.</h2>
        </div>
        <div className="category-list">
          {categories.map((category) => (
            <CategoryBattle
              key={category.key}
              label={category.label}
              repoAName={repoA.repository.name}
              repoBName={repoB.repository.name}
              repoAScore={repoA.scores[category.key]}
              repoBScore={repoB.scores[category.key]}
            />
          ))}
        </div>
      </section>
      <section className="reason-grid" aria-label="Score evidence">
        {isLive
          ? categories.map((category) => (
              <ScoreReasons
                key={category.key}
                title={`${category.label} evidence`}
                reasons={result.reasons[category.key]}
              />
            ))
          : <>
              <ScoreReasons title={`${repoA.repository.name} maintenance signals`} reasons={repoA.reasons.maintenance} />
              <ScoreReasons title={`${repoB.repository.name} community signals`} reasons={repoB.reasons.community} />
            </>}
      </section>
      <ComparisonSummary winnerName={winner?.repository.name ?? null} winnerLead="maintenance and project health" otherLead="community reach and popularity" />
    </main>
  );
}
