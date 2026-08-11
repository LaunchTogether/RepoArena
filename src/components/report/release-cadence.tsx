import type { ComparisonReport, MetricValue } from "@/types/comparison";

type ReleaseCadenceProps = {
  report: ComparisonReport;
  repoAName: string;
  repoBName: string;
};

type ReleaseValue = NonNullable<ComparisonReport["repoA"]["release"]["value"]>;

function unavailableMessage(metric: MetricValue<ReleaseValue>): string {
  if (metric.status === "unknown") return "Release data is still being prepared by GitHub.";
  if (metric.status === "not_configured") return "GitHub Releases was not configured for this repository.";
  return "Release data is not applicable for this repository.";
}

function releaseValue(metric: MetricValue<ReleaseValue>, field: "latestName" | "releasesLastYear" | "averageIntervalDays"): string {
  if (metric.status !== "available" || metric.value === null) return "Unavailable";
  if (field === "latestName") return metric.value.latestName ?? "No stable release found";
  if (field === "releasesLastYear") return `${metric.value.releasesLastYear} stable releases`;
  return metric.value.averageIntervalDays === null ? "Not enough release history" : `${Math.round(metric.value.averageIntervalDays)} day average`;
}

function releaseDate(metric: MetricValue<ReleaseValue>): string {
  if (metric.status !== "available" || metric.value === null) return unavailableMessage(metric);
  if (metric.value.latestPublishedAt === null) return "No published stable release found";

  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
    .format(new Date(metric.value.latestPublishedAt));
}

export function ReleaseCadence({ report, repoAName, repoBName }: ReleaseCadenceProps) {
  const repoA = report.repoA.release;
  const repoB = report.repoB.release;

  return (
    <section className="report-panel release-cadence" aria-labelledby="release-cadence-title">
      <div className="report-panel-intro">
        <p className="eyebrow">Delivery cadence</p>
        <h2 id="release-cadence-title">Stable release rhythm</h2>
        <p>Published, non-prerelease GitHub Releases over the last year.</p>
      </div>
      <div className="report-table-wrap">
        <table aria-label="Stable release cadence comparison">
          <thead>
            <tr>
              <th scope="col">Release signal</th>
              <th scope="col">{repoAName}</th>
              <th scope="col">{repoBName}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Latest stable release</th>
              <td>{releaseValue(repoA, "latestName")}</td>
              <td>{releaseValue(repoB, "latestName")}</td>
            </tr>
            <tr>
              <th scope="row">Published</th>
              <td>{releaseDate(repoA)}</td>
              <td>{releaseDate(repoB)}</td>
            </tr>
            <tr>
              <th scope="row">Last 12 months</th>
              <td>{releaseValue(repoA, "releasesLastYear")}</td>
              <td>{releaseValue(repoB, "releasesLastYear")}</td>
            </tr>
            <tr>
              <th scope="row">Average interval</th>
              <td>{releaseValue(repoA, "averageIntervalDays")}</td>
              <td>{releaseValue(repoB, "averageIntervalDays")}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {(repoA.status !== "available" || repoB.status !== "available") ? <p className="report-panel-note">Unavailable evidence is neutral. No score penalty.</p> : null}
    </section>
  );
}
