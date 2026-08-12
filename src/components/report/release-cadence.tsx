"use client";

import type { ComparisonReport, MetricValue } from "@/types/comparison";
import { useLocale } from "@/components/locale/locale-provider";

type ReleaseCadenceProps = {
  report: ComparisonReport;
  repoAName: string;
  repoBName: string;
};

type ReleaseValue = NonNullable<ComparisonReport["repoA"]["release"]["value"]>;

export function ReleaseCadence({ report, repoAName, repoBName }: ReleaseCadenceProps) {
  const { locale, messages } = useLocale();
  const copy = locale === "tr"
    ? { kicker: "Teslimat ritmi", title: "Kararlı sürüm ritmi", description: "Son yıldaki yayınlanmış, ön sürüm olmayan GitHub Releases kayıtları.", table: "Kararlı sürüm ritmi karşılaştırması", signal: "Sürüm sinyali", latest: "Son kararlı sürüm", published: "Yayınlandı", year: "Son 12 ay", interval: "Ortalama aralık", unavailable: "Kullanılamıyor", unknown: "GitHub sürüm verisini hâlâ hazırlıyor.", configured: "GitHub Releases bu depo için yapılandırılmadı.", notApplicable: "Sürüm verisi bu depo için geçerli değil.", noStable: "Kararlı sürüm bulunamadı", stable: "kararlı sürüm", noHistory: "Yeterli sürüm geçmişi yok", average: "gün ortalaması", noPublished: "Yayınlanmış kararlı sürüm bulunamadı" }
    : { kicker: "Delivery cadence", title: "Stable release rhythm", description: "Published, non-prerelease GitHub Releases over the last year.", table: "Stable release cadence comparison", signal: "Release signal", latest: "Latest stable release", published: "Published", year: "Last 12 months", interval: "Average interval", unavailable: "Unavailable", unknown: "Release data is still being prepared by GitHub.", configured: "GitHub Releases was not configured for this repository.", notApplicable: "Release data is not applicable for this repository.", noStable: "No stable release found", stable: "stable releases", noHistory: "Not enough release history", average: "day average", noPublished: "No published stable release found" };
  const repoA = report.repoA.release;
  const repoB = report.repoB.release;
  const unavailableMessage = (metric: MetricValue<ReleaseValue>) => metric.status === "unknown" ? copy.unknown : metric.status === "not_configured" ? copy.configured : copy.notApplicable;
  const releaseValue = (metric: MetricValue<ReleaseValue>, field: "latestName" | "releasesLastYear" | "averageIntervalDays") => {
    if (metric.status !== "available" || metric.value === null) return copy.unavailable;
    if (field === "latestName") return metric.value.latestName ?? copy.noStable;
    if (field === "releasesLastYear") return `${metric.value.releasesLastYear} ${copy.stable}`;
    return metric.value.averageIntervalDays === null ? copy.noHistory : `${Math.round(metric.value.averageIntervalDays)} ${copy.average}`;
  };
  const releaseDate = (metric: MetricValue<ReleaseValue>) => metric.status !== "available" || metric.value === null ? unavailableMessage(metric) : metric.value.latestPublishedAt === null ? copy.noPublished : new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(metric.value.latestPublishedAt));

  return (
    <section className="report-panel release-cadence" aria-labelledby="release-cadence-title">
      <div className="report-panel-intro">
        <p className="eyebrow">{copy.kicker}</p><h2 id="release-cadence-title">{copy.title}</h2><p>{copy.description}</p>
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
              <th scope="row">{copy.latest}</th>
              <td>{releaseValue(repoA, "latestName")}</td>
              <td>{releaseValue(repoB, "latestName")}</td>
            </tr>
            <tr>
              <th scope="row">{copy.published}</th>
              <td>{releaseDate(repoA)}</td>
              <td>{releaseDate(repoB)}</td>
            </tr>
            <tr>
              <th scope="row">{copy.year}</th>
              <td>{releaseValue(repoA, "releasesLastYear")}</td>
              <td>{releaseValue(repoB, "releasesLastYear")}</td>
            </tr>
            <tr>
              <th scope="row">{copy.interval}</th>
              <td>{releaseValue(repoA, "averageIntervalDays")}</td>
              <td>{releaseValue(repoB, "averageIntervalDays")}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {(repoA.status !== "available" || repoB.status !== "available") ? <p className="report-panel-note">{messages.report.neutralEvidence}</p> : null}
    </section>
  );
}
