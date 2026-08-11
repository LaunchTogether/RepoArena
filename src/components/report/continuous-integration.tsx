import type { ComparisonReport, MetricValue } from "@/types/comparison";

type ContinuousIntegrationProps = {
  report: ComparisonReport;
  repoAName: string;
  repoBName: string;
};

type WorkflowValue = NonNullable<ComparisonReport["repoA"]["workflow"]["value"]>;

function workflowStatus(metric: MetricValue<WorkflowValue>): string {
  if (metric.status === "not_configured") return "GitHub Actions was not configured for this repository.";
  if (metric.status === "unknown") return "GitHub Actions data is still being prepared by GitHub.";
  return "GitHub Actions data is not applicable for this repository.";
}

function runValue(metric: MetricValue<WorkflowValue>, key: "completedRuns" | "successfulRuns"): string {
  if (metric.status !== "available" || metric.value === null) return "Unavailable";
  return String(metric.value[key]);
}

function successRate(metric: MetricValue<WorkflowValue>): string {
  if (metric.status !== "available" || metric.value === null) return "Unavailable";
  if (metric.value.completedRuns === 0) return "No completed runs";
  return `${Math.round((metric.value.successfulRuns / metric.value.completedRuns) * 100)}%`;
}

function lastConclusion(metric: MetricValue<WorkflowValue>): string {
  if (metric.status !== "available" || metric.value === null) return workflowStatus(metric);
  return metric.value.lastConclusion ?? "No completed run conclusion";
}

export function ContinuousIntegration({ report, repoAName, repoBName }: ContinuousIntegrationProps) {
  const repoA = report.repoA.workflow;
  const repoB = report.repoB.workflow;
  const hasUnavailableEvidence = repoA.status !== "available" || repoB.status !== "available";
  const noGitHubActions = repoA.status === "not_configured" || repoB.status === "not_configured";

  return (
    <section className="report-panel continuous-integration" aria-labelledby="continuous-integration-title">
      <div className="report-panel-intro">
        <p className="eyebrow">Delivery reliability</p>
        <h2 id="continuous-integration-title">Continuous integration</h2>
        <p>Completed GitHub Actions workflow runs. This panel does not assess external CI providers.</p>
      </div>
      <div className="report-table-wrap">
        <table aria-label="GitHub Actions workflow comparison">
          <thead>
            <tr>
              <th scope="col">Workflow signal</th>
              <th scope="col">{repoAName}</th>
              <th scope="col">{repoBName}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Completed runs sampled</th>
              <td>{runValue(repoA, "completedRuns")}</td>
              <td>{runValue(repoB, "completedRuns")}</td>
            </tr>
            <tr>
              <th scope="row">Successful runs</th>
              <td>{runValue(repoA, "successfulRuns")}</td>
              <td>{runValue(repoB, "successfulRuns")}</td>
            </tr>
            <tr>
              <th scope="row">Success rate</th>
              <td>{successRate(repoA)}</td>
              <td>{successRate(repoB)}</td>
            </tr>
            <tr>
              <th scope="row">Latest conclusion</th>
              <td>{lastConclusion(repoA)}</td>
              <td>{lastConclusion(repoB)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {noGitHubActions ? <p className="report-panel-note">Other CI providers may be in use.</p> : null}
      {hasUnavailableEvidence ? <p className="report-panel-note">Unavailable evidence is neutral. No score penalty.</p> : null}
    </section>
  );
}
