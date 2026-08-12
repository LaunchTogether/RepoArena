"use client";

import { CategoryBattle } from "@/components/comparison/category-battle";
import Link from "next/link";
import { ComparisonSummary } from "@/components/comparison/comparison-summary";
import { OverallScore } from "@/components/comparison/overall-score";
import { RepositoryHeader } from "@/components/comparison/repository-header";
import { ScoreReasons } from "@/components/comparison/score-reasons";
import { ActivityTimeline } from "@/components/report/activity-timeline";
import { ComparisonIntentControl } from "@/components/report/comparison-intent";
import { ContinuousIntegration } from "@/components/report/continuous-integration";
import { DecisionDrivers } from "@/components/report/decision-drivers";
import { EvidenceCoverage } from "@/components/report/evidence-coverage";
import { ProjectHealthChecklist } from "@/components/report/project-health-checklist";
import { ReleaseCadence } from "@/components/report/release-cadence";
import { ShareComparison } from "@/components/report/share-comparison";
import { TechnologyFootprint } from "@/components/report/technology-footprint";
import { WorkflowHealth } from "@/components/report/workflow-health";
import type { ComparisonResultPreview, RepositoryAnalysisPreview, ScoreCategory } from "@/lib/preview/types";
import { buildComparisonSharePath } from "@/lib/report/snapshot";
import type { ComparisonIntent, ComparisonResult } from "@/types/comparison";
import { useLocale } from "@/components/locale/locale-provider";

const categoryKeys: ScoreCategory[] = ["activity", "maintenance", "community", "codebase", "documentation", "popularity", "health"];

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

type ComparisonViewProps = {
  result: ComparisonResultPreview | ComparisonResult;
  intent?: ComparisonIntent;
  onIntentChange?: (intent: ComparisonIntent) => void;
};

export function ComparisonView({ result, intent = "general", onIntentChange }: ComparisonViewProps) {
  const { messages } = useLocale();
  const isLive = isLiveResult(result);
  const repoA = isLive ? liveRepositoryAnalysis(result, "repoA") : result.repoA;
  const repoB = isLive ? liveRepositoryAnalysis(result, "repoB") : result.repoB;
  const winner = result.winner === "repoA" ? repoA : result.winner === "repoB" ? repoB : null;
  const sharePath = isLive
    ? buildComparisonSharePath({ repoA: result.repoA.ref.url, repoB: result.repoB.ref.url, intent })
    : null;

  return (
    <main className="comparison-page">
      <div className="comparison-topline">
        <Link className="brand" href="/">RepoArena</Link>
        <p>{isLive ? messages.comparison.topLive : messages.comparison.topPreview} <span aria-hidden="true">·</span> {isLive ? messages.comparison.generatedNow : messages.comparison.sampleData}</p>
      </div>
      <section className="comparison-hero" aria-label={messages.comparison.overview}>
        <RepositoryHeader repository={repoA.repository} position="A" />
        <div className="comparison-vs" aria-hidden="true"><span>VS</span></div>
        <RepositoryHeader repository={repoB.repository} position="B" />
      </section>
      {isLive && onIntentChange ? <ComparisonIntentControl intent={intent} onChange={onIntentChange} /> : null}
      <OverallScore
        repoAName={repoA.repository.name}
        repoBName={repoB.repository.name}
        repoAScore={repoA.scores.overall}
        repoBScore={repoB.scores.overall}
        winner={result.winner}
      />
      {isLive ? (
        <section className="report-overview" aria-label={messages.report.evidenceOverview}>
          <EvidenceCoverage
            coverage={result.report.coverage}
            generatedAt={result.report.generatedAt}
            sourceLedger={result.report.sourceLedger}
          />
          <DecisionDrivers
            drivers={result.report.decisionDrivers}
            repoAName={repoA.repository.name}
            repoBName={repoB.repository.name}
          />
          <div className="report-actions">
            <p>{result.report.intentSummary}</p>
            {sharePath ? <ShareComparison path={sharePath} /> : null}
          </div>
        </section>
      ) : null}
      <section className="category-section" aria-labelledby="category-title">
        <div className="section-intro">
          <p className="eyebrow">{messages.comparison.categoriesKicker}</p>
          <h2 id="category-title">{messages.comparison.categoriesTitle}</h2>
        </div>
        <div className="category-list">
          {categoryKeys.map((key) => (
            <CategoryBattle
              key={key}
              label={messages.comparison.categoryLabels[key]}
              repoAName={repoA.repository.name}
              repoBName={repoB.repository.name}
              repoAScore={repoA.scores[key]}
              repoBScore={repoB.scores[key]}
            />
          ))}
        </div>
      </section>
      {isLive ? (
        <section className="report-detail-grid" aria-label={messages.report.deliveryEvidence}>
          <ActivityTimeline report={result.report} repoAName={repoA.repository.name} repoBName={repoB.repository.name} />
          <ReleaseCadence report={result.report} repoAName={repoA.repository.name} repoBName={repoB.repository.name} />
          <WorkflowHealth report={result.report} repoAName={repoA.repository.name} repoBName={repoB.repository.name} />
          <ContinuousIntegration report={result.report} repoAName={repoA.repository.name} repoBName={repoB.repository.name} />
          <ProjectHealthChecklist
            repoA={result.report.repoA.projectFiles}
            repoB={result.report.repoB.projectFiles}
            repoAName={repoA.repository.name}
            repoBName={repoB.repository.name}
          />
          <TechnologyFootprint
            repoA={result.report.repoA.languages}
            repoB={result.report.repoB.languages}
            repoAName={repoA.repository.name}
            repoBName={repoB.repository.name}
          />
        </section>
      ) : null}
      <section className="reason-grid" aria-label={messages.report.scoreEvidence}>
        {isLive
          ? categoryKeys.map((key) => (
              <ScoreReasons
                key={key}
                title={messages.comparison.reasonEvidence(messages.comparison.categoryLabels[key])}
                reasons={result.reasons[key]}
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
