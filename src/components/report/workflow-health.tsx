"use client";

import type { ComparisonReport, MetricValue } from "@/types/comparison";
import { useLocale } from "@/components/locale/locale-provider";

type WorkflowHealthProps = {
  report: ComparisonReport;
  repoAName: string;
  repoBName: string;
};

type IssueValue = NonNullable<ComparisonReport["repoA"]["issues"]["value"]>;
type PullRequestValue = NonNullable<ComparisonReport["repoA"]["pullRequests"]["value"]>;

export function WorkflowHealth({ report, repoAName, repoBName }: WorkflowHealthProps) {
  const { locale, messages } = useLocale();
  const copy = locale === "tr"
    ? { kicker: "İş birliği kanıtı", title: "İş birliği akışı", description: "GitHub’ın herkese açık API’sinden issue yanıtı ve pull request akışı.", table: "Issue ve pull request akışı karşılaştırması", signal: "Akış sinyali", issuesOpened: "Son 90 günde açılan issue’lar", issuesClosed: "Son 90 günde kapatılan issue’lar", issueMedian: "Medyan issue kapatma süresi", prsMerged: "Son 90 günde birleştirilen pull request’ler", prMedian: "Medyan pull request birleştirme süresi", aged: "Uzun süredir açık pull request’ler", unavailable: "Kullanılamıyor", noClosed: "Aralıkta kapatılmış issue yok", noMerged: "Aralıkta birleştirilmiş pull request yok", dayMedian: "gün medyan", opened: "açıldı", closed: "kapandı", merged: "birleştirildi", open90: "90 günden uzun açık", open30: "30 günden uzun açık" }
    : { kicker: "Collaboration evidence", title: "Collaboration flow", description: "Issue response and pull request throughput from GitHub's public API.", table: "Issue and pull request flow comparison", signal: "Flow signal", issuesOpened: "Issues opened, last 90 days", issuesClosed: "Issues closed, last 90 days", issueMedian: "Median issue close time", prsMerged: "Merged pull requests, last 90 days", prMedian: "Median pull request merge time", aged: "Aged open pull requests", unavailable: "Unavailable", noClosed: "No closed issues in range", noMerged: "No merged pull requests in range", dayMedian: "day median", opened: "opened", closed: "closed", merged: "merged", open90: "open >90 days", open30: "open >30 days" };
  const repoAIssues = report.repoA.issues;
  const repoBIssues = report.repoB.issues;
  const repoAPullRequests = report.repoA.pullRequests;
  const repoBPullRequests = report.repoB.pullRequests;
  const hasUnavailableEvidence = [repoAIssues, repoBIssues, repoAPullRequests, repoBPullRequests].some((metric) => metric.status !== "available");
  const issueValue = (metric: MetricValue<IssueValue>, key: keyof IssueValue) => {
    if (metric.status !== "available" || metric.value === null) return copy.unavailable;
    if (key === "medianCloseDays") return metric.value[key] === null ? copy.noClosed : `${Math.round(metric.value[key])} ${copy.dayMedian}`;
    if (key === "openedLast90Days") return `${metric.value[key]} ${copy.opened}`;
    if (key === "closedLast90Days") return `${metric.value[key]} ${copy.closed}`;
    return `${metric.value[key]} ${copy.open90}`;
  };
  const pullRequestValue = (metric: MetricValue<PullRequestValue>, key: keyof PullRequestValue) => {
    if (metric.status !== "available" || metric.value === null) return copy.unavailable;
    if (key === "medianMergeDays") return metric.value[key] === null ? copy.noMerged : `${Math.round(metric.value[key])} ${copy.dayMedian}`;
    if (key === "mergedLast90Days") return `${metric.value[key]} ${copy.merged}`;
    return `${metric.value[key]} ${copy.open30}`;
  };

  return (
    <section className="report-panel workflow-health" aria-labelledby="workflow-health-title">
      <div className="report-panel-intro">
        <p className="eyebrow">{copy.kicker}</p><h2 id="workflow-health-title">{copy.title}</h2><p>{copy.description}</p>
      </div>
      <div className="report-table-wrap">
        <table aria-label={copy.table}>
          <thead>
            <tr>
              <th scope="col">{copy.signal}</th>
              <th scope="col">{repoAName}</th>
              <th scope="col">{repoBName}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{copy.issuesOpened}</th>
              <td>{issueValue(repoAIssues, "openedLast90Days")}</td>
              <td>{issueValue(repoBIssues, "openedLast90Days")}</td>
            </tr>
            <tr>
              <th scope="row">{copy.issuesClosed}</th>
              <td>{issueValue(repoAIssues, "closedLast90Days")}</td>
              <td>{issueValue(repoBIssues, "closedLast90Days")}</td>
            </tr>
            <tr>
              <th scope="row">{copy.issueMedian}</th>
              <td>{issueValue(repoAIssues, "medianCloseDays")}</td>
              <td>{issueValue(repoBIssues, "medianCloseDays")}</td>
            </tr>
            <tr>
              <th scope="row">{copy.prsMerged}</th>
              <td>{pullRequestValue(repoAPullRequests, "mergedLast90Days")}</td>
              <td>{pullRequestValue(repoBPullRequests, "mergedLast90Days")}</td>
            </tr>
            <tr>
              <th scope="row">{copy.prMedian}</th>
              <td>{pullRequestValue(repoAPullRequests, "medianMergeDays")}</td>
              <td>{pullRequestValue(repoBPullRequests, "medianMergeDays")}</td>
            </tr>
            <tr>
              <th scope="row">{copy.aged}</th>
              <td>{pullRequestValue(repoAPullRequests, "openOlderThan30Days")}</td>
              <td>{pullRequestValue(repoBPullRequests, "openOlderThan30Days")}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {hasUnavailableEvidence ? <p className="report-panel-note">{messages.report.neutralEvidence}</p> : null}
    </section>
  );
}
