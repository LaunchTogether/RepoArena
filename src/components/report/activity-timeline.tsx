import type { ComparisonReport, MetricValue } from "@/types/comparison";

type ActivityTimelineProps = {
  report: ComparisonReport;
  repoAName: string;
  repoBName: string;
};

type ActivityValue = NonNullable<ComparisonReport["repoA"]["activity"]["value"]>;

const windows: Array<{ key: keyof Pick<ActivityValue, "commitsLast7Days" | "commitsLast30Days" | "commitsLast90Days">; label: string }> = [
  { key: "commitsLast7Days", label: "Last 7 days" },
  { key: "commitsLast30Days", label: "Last 30 days" },
  { key: "commitsLast90Days", label: "Last 90 days" },
];

function unavailableMessage(metric: MetricValue<ActivityValue>): string {
  if (metric.status === "unknown") return "Activity data is still being prepared by GitHub.";
  if (metric.status === "not_configured") return "Activity data was not configured for this repository.";
  return "Activity data is not applicable for this repository.";
}

function trendLabel(metric: MetricValue<ActivityValue>): string {
  if (metric.status !== "available" || metric.value === null) return unavailableMessage(metric);
  if (metric.value.trend === "up") return "Rising activity";
  if (metric.value.trend === "down") return "Slowing activity";
  return "Steady activity";
}

function activityValue(metric: MetricValue<ActivityValue>, key: (typeof windows)[number]["key"]): string {
  return metric.status === "available" && metric.value !== null ? String(metric.value[key]) : "Unavailable";
}

export function ActivityTimeline({ report, repoAName, repoBName }: ActivityTimelineProps) {
  const repoA = report.repoA.activity;
  const repoB = report.repoB.activity;

  return (
    <section className="report-panel activity-timeline" aria-labelledby="activity-timeline-title">
      <div className="report-panel-intro">
        <p className="eyebrow">Evidence dashboard</p>
        <h2 id="activity-timeline-title">Development activity</h2>
        <p>Commit volume across recent delivery windows. This evidence does not change the score when GitHub has not returned it.</p>
      </div>
      <div className="report-table-wrap">
        <table aria-label="Commit activity comparison">
          <thead>
            <tr>
              <th scope="col">Window</th>
              <th scope="col">{repoAName}</th>
              <th scope="col">{repoBName}</th>
            </tr>
          </thead>
          <tbody>
            {windows.map((window) => (
              <tr key={window.key}>
                <th scope="row">{window.label}</th>
                <td>{activityValue(repoA, window.key)}</td>
                <td>{activityValue(repoB, window.key)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Active weeks, last year</th>
              <td>{repoA.status === "available" && repoA.value !== null ? repoA.value.activeWeeksLast52 : "Unavailable"}</td>
              <td>{repoB.status === "available" && repoB.value !== null ? repoB.value.activeWeeksLast52 : "Unavailable"}</td>
            </tr>
            <tr>
              <th scope="row">Current trend</th>
              <td>{trendLabel(repoA)}</td>
              <td>{trendLabel(repoB)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {(repoA.status !== "available" || repoB.status !== "available") ? <p className="report-panel-note">Unavailable evidence is neutral. No score penalty.</p> : null}
    </section>
  );
}
