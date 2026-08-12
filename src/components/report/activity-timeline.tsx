"use client";

import type { ComparisonReport, MetricValue } from "@/types/comparison";
import { useLocale } from "@/components/locale/locale-provider";

type ActivityTimelineProps = {
  report: ComparisonReport;
  repoAName: string;
  repoBName: string;
};

type ActivityValue = NonNullable<ComparisonReport["repoA"]["activity"]["value"]>;

function activityCopy(locale: string) {
  return locale === "tr"
    ? { kicker: "Kanıt panosu", title: "Geliştirme aktivitesi", description: "Yakın teslimat dönemlerindeki commit hacmi. GitHub bu kanıtı döndürmediğinde skor değişmez.", table: "Commit aktivitesi karşılaştırması", window: "Dönem", windows: ["Son 7 gün", "Son 30 gün", "Son 90 gün"], weeks: "Son yıldaki aktif haftalar", trend: "Mevcut eğilim", unknown: "GitHub aktivite verisini hâlâ hazırlıyor.", configured: "Aktivite verisi bu depo için yapılandırılmadı.", notApplicable: "Aktivite verisi bu depo için geçerli değil.", up: "Yükselen aktivite", down: "Yavaşlayan aktivite", steady: "Dengeli aktivite", unavailable: "Kullanılamıyor" }
    : { kicker: "Evidence dashboard", title: "Development activity", description: "Commit volume across recent delivery windows. This evidence does not change the score when GitHub has not returned it.", table: "Commit activity comparison", window: "Window", windows: ["Last 7 days", "Last 30 days", "Last 90 days"], weeks: "Active weeks, last year", trend: "Current trend", unknown: "Activity data is still being prepared by GitHub.", configured: "Activity data was not configured for this repository.", notApplicable: "Activity data is not applicable for this repository.", up: "Rising activity", down: "Slowing activity", steady: "Steady activity", unavailable: "Unavailable" };
}

export function ActivityTimeline({ report, repoAName, repoBName }: ActivityTimelineProps) {
  const { locale, messages } = useLocale();
  const copy = activityCopy(locale);
  const repoA = report.repoA.activity;
  const repoB = report.repoB.activity;
  const unavailableMessage = (metric: MetricValue<ActivityValue>) => metric.status === "unknown" ? copy.unknown : metric.status === "not_configured" ? copy.configured : copy.notApplicable;
  const trendLabel = (metric: MetricValue<ActivityValue>) => metric.status !== "available" || metric.value === null ? unavailableMessage(metric) : metric.value.trend === "up" ? copy.up : metric.value.trend === "down" ? copy.down : copy.steady;
  const activityValue = (metric: MetricValue<ActivityValue>, key: keyof Pick<ActivityValue, "commitsLast7Days" | "commitsLast30Days" | "commitsLast90Days">) => metric.status === "available" && metric.value !== null ? String(metric.value[key]) : copy.unavailable;
  const windows: Array<{ key: keyof Pick<ActivityValue, "commitsLast7Days" | "commitsLast30Days" | "commitsLast90Days">; label: string }> = [
    { key: "commitsLast7Days", label: copy.windows[0] }, { key: "commitsLast30Days", label: copy.windows[1] }, { key: "commitsLast90Days", label: copy.windows[2] },
  ];

  return (
    <section className="report-panel activity-timeline" aria-labelledby="activity-timeline-title">
      <div className="report-panel-intro">
        <p className="eyebrow">{copy.kicker}</p><h2 id="activity-timeline-title">{copy.title}</h2><p>{copy.description}</p>
      </div>
      <div className="report-table-wrap">
        <table aria-label={copy.table}>
          <thead>
            <tr>
              <th scope="col">{copy.window}</th>
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
              <th scope="row">{copy.weeks}</th>
              <td>{repoA.status === "available" && repoA.value !== null ? repoA.value.activeWeeksLast52 : copy.unavailable}</td>
              <td>{repoB.status === "available" && repoB.value !== null ? repoB.value.activeWeeksLast52 : copy.unavailable}</td>
            </tr>
            <tr>
              <th scope="row">{copy.trend}</th>
              <td>{trendLabel(repoA)}</td>
              <td>{trendLabel(repoB)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {(repoA.status !== "available" || repoB.status !== "available") ? <p className="report-panel-note">{messages.report.neutralEvidence}</p> : null}
    </section>
  );
}
