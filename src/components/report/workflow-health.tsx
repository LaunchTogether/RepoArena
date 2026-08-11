import type { ComparisonReport, MetricValue } from "@/types/comparison";

type WorkflowHealthProps = {
  report: ComparisonReport;
  repoAName: string;
  repoBName: string;
};

type IssueValue = NonNullable<ComparisonReport["repoA"]["issues"]["value"]>;
type PullRequestValue = NonNullable<ComparisonReport["repoA"]["pullRequests"]["value"]>;

function issueValue(metric: MetricValue<IssueValue>, key: keyof IssueValue): string {
  if (metric.status !== "available" || metric.value === null) return "Unavailable";
  if (key === "medianCloseDays") return metric.value[key] === null ? "No closed issues in range" : `${Math.round(metric.value[key])} day median`;
  if (key === "openedLast90Days") return `${metric.value[key]} opened`;
  if (key === "closedLast90Days") return `${metric.value[key]} closed`;
  return `${metric.value[key]} open >90 days`;
}

function pullRequestValue(metric: MetricValue<PullRequestValue>, key: keyof PullRequestValue): string {
  if (metric.status !== "available" || metric.value === null) return "Unavailable";
  if (key === "medianMergeDays") return metric.value[key] === null ? "No merged pull requests in range" : `${Math.round(metric.value[key])} day median`;
  if (key === "mergedLast90Days") return `${metric.value[key]} merged`;
  return `${metric.value[key]} open >30 days`;
}

export function WorkflowHealth({ report, repoAName, repoBName }: WorkflowHealthProps) {
  const repoAIssues = report.repoA.issues;
  const repoBIssues = report.repoB.issues;
  const repoAPullRequests = report.repoA.pullRequests;
  const repoBPullRequests = report.repoB.pullRequests;
  const hasUnavailableEvidence = [repoAIssues, repoBIssues, repoAPullRequests, repoBPullRequests].some((metric) => metric.status !== "available");

  return (
    <section className="report-panel workflow-health" aria-labelledby="workflow-health-title">
      <div className="report-panel-intro">
        <p className="eyebrow">Collaboration evidence</p>
        <h2 id="workflow-health-title">Collaboration flow</h2>
        <p>Issue response and pull request throughput from GitHub&apos;s public API.</p>
      </div>
      <div className="report-table-wrap">
        <table aria-label="Issue and pull request flow comparison">
          <thead>
            <tr>
              <th scope="col">Flow signal</th>
              <th scope="col">{repoAName}</th>
              <th scope="col">{repoBName}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Issues opened, last 90 days</th>
              <td>{issueValue(repoAIssues, "openedLast90Days")}</td>
              <td>{issueValue(repoBIssues, "openedLast90Days")}</td>
            </tr>
            <tr>
              <th scope="row">Issues closed, last 90 days</th>
              <td>{issueValue(repoAIssues, "closedLast90Days")}</td>
              <td>{issueValue(repoBIssues, "closedLast90Days")}</td>
            </tr>
            <tr>
              <th scope="row">Median issue close time</th>
              <td>{issueValue(repoAIssues, "medianCloseDays")}</td>
              <td>{issueValue(repoBIssues, "medianCloseDays")}</td>
            </tr>
            <tr>
              <th scope="row">Merged pull requests, last 90 days</th>
              <td>{pullRequestValue(repoAPullRequests, "mergedLast90Days")}</td>
              <td>{pullRequestValue(repoBPullRequests, "mergedLast90Days")}</td>
            </tr>
            <tr>
              <th scope="row">Median pull request merge time</th>
              <td>{pullRequestValue(repoAPullRequests, "medianMergeDays")}</td>
              <td>{pullRequestValue(repoBPullRequests, "medianMergeDays")}</td>
            </tr>
            <tr>
              <th scope="row">Aged open pull requests</th>
              <td>{pullRequestValue(repoAPullRequests, "openOlderThan30Days")}</td>
              <td>{pullRequestValue(repoBPullRequests, "openOlderThan30Days")}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {hasUnavailableEvidence ? <p className="report-panel-note">Unavailable evidence is neutral. No score penalty.</p> : null}
    </section>
  );
}
