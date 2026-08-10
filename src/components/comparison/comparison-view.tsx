import { CategoryBattle } from "@/components/comparison/category-battle";
import Link from "next/link";
import { ComparisonSummary } from "@/components/comparison/comparison-summary";
import { OverallScore } from "@/components/comparison/overall-score";
import { RepositoryHeader } from "@/components/comparison/repository-header";
import { ScoreReasons } from "@/components/comparison/score-reasons";
import type { ComparisonResultPreview, ScoreCategory } from "@/lib/preview/types";

const categories: { key: ScoreCategory; label: string }[] = [
  { key: "activity", label: "Activity" },
  { key: "maintenance", label: "Maintenance" },
  { key: "community", label: "Community" },
  { key: "codebase", label: "Codebase health" },
  { key: "documentation", label: "Documentation" },
  { key: "popularity", label: "Popularity" },
  { key: "health", label: "Project health" },
];

export function ComparisonView({ result }: { result: ComparisonResultPreview }) {
  const repoA = result.repoA;
  const repoB = result.repoB;
  const winner = result.winner === "repoA" ? repoA : result.winner === "repoB" ? repoB : null;

  return (
    <main className="comparison-page">
      <div className="comparison-topline">
        <Link className="brand" href="/">RepoArena</Link>
        <p>Preview result <span aria-hidden="true">·</span> live data adapter pending</p>
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
      <section className="reason-grid" aria-label="Score signals">
        <ScoreReasons repositoryName={repoA.repository.name} reasons={repoA.reasons.maintenance} />
        <ScoreReasons repositoryName={repoB.repository.name} reasons={repoB.reasons.community} />
      </section>
      <ComparisonSummary winnerName={winner?.repository.name ?? null} winnerLead="maintenance and project health" otherLead="community reach and popularity" />
    </main>
  );
}
