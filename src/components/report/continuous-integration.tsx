"use client";

import type { ComparisonReport, MetricValue } from "@/types/comparison";
import { useLocale } from "@/components/locale/locale-provider";

type ContinuousIntegrationProps = {
  report: ComparisonReport;
  repoAName: string;
  repoBName: string;
};

type WorkflowValue = NonNullable<ComparisonReport["repoA"]["workflow"]["value"]>;

export function ContinuousIntegration({ report, repoAName, repoBName }: ContinuousIntegrationProps) {
  const { locale, messages } = useLocale();
  const copy = locale === "tr"
    ? { kicker: "Teslimat güvenilirliği", title: "Sürekli entegrasyon", description: "Tamamlanan GitHub Actions iş akışı çalıştırmaları. Bu panel dış CI sağlayıcılarını değerlendirmez.", table: "GitHub Actions iş akışı karşılaştırması", signal: "İş akışı sinyali", completed: "Örneklenen tamamlanmış çalıştırmalar", successful: "Başarılı çalıştırmalar", rate: "Başarı oranı", latest: "Son sonuç", unavailable: "Kullanılamıyor", none: "Tamamlanmış çalıştırma yok", noConclusion: "Tamamlanmış çalıştırma sonucu yok", configured: "GitHub Actions bu depo için yapılandırılmadı.", unknown: "GitHub Actions verisini hâlâ hazırlıyor.", notApplicable: "GitHub Actions verisi bu depo için geçerli değil.", otherCi: "Başka CI sağlayıcıları kullanılıyor olabilir." }
    : { kicker: "Delivery reliability", title: "Continuous integration", description: "Completed GitHub Actions workflow runs. This panel does not assess external CI providers.", table: "GitHub Actions workflow comparison", signal: "Workflow signal", completed: "Completed runs sampled", successful: "Successful runs", rate: "Success rate", latest: "Latest conclusion", unavailable: "Unavailable", none: "No completed runs", noConclusion: "No completed run conclusion", configured: "GitHub Actions was not configured for this repository.", unknown: "GitHub Actions data is still being prepared by GitHub.", notApplicable: "GitHub Actions data is not applicable for this repository.", otherCi: "Other CI providers may be in use." };
  const repoA = report.repoA.workflow;
  const repoB = report.repoB.workflow;
  const hasUnavailableEvidence = repoA.status !== "available" || repoB.status !== "available";
  const noGitHubActions = repoA.status === "not_configured" || repoB.status === "not_configured";
  const workflowStatus = (metric: MetricValue<WorkflowValue>) => metric.status === "not_configured" ? copy.configured : metric.status === "unknown" ? copy.unknown : copy.notApplicable;
  const runValue = (metric: MetricValue<WorkflowValue>, key: "completedRuns" | "successfulRuns") => metric.status !== "available" || metric.value === null ? copy.unavailable : String(metric.value[key]);
  const successRate = (metric: MetricValue<WorkflowValue>) => metric.status !== "available" || metric.value === null ? copy.unavailable : metric.value.completedRuns === 0 ? copy.none : `${Math.round((metric.value.successfulRuns / metric.value.completedRuns) * 100)}%`;
  const lastConclusion = (metric: MetricValue<WorkflowValue>) => metric.status !== "available" || metric.value === null ? workflowStatus(metric) : metric.value.lastConclusion ?? copy.noConclusion;

  return (
    <section className="report-panel continuous-integration" aria-labelledby="continuous-integration-title">
      <div className="report-panel-intro">
        <p className="eyebrow">{copy.kicker}</p><h2 id="continuous-integration-title">{copy.title}</h2><p>{copy.description}</p>
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
              <th scope="row">{copy.completed}</th>
              <td>{runValue(repoA, "completedRuns")}</td>
              <td>{runValue(repoB, "completedRuns")}</td>
            </tr>
            <tr>
              <th scope="row">{copy.successful}</th>
              <td>{runValue(repoA, "successfulRuns")}</td>
              <td>{runValue(repoB, "successfulRuns")}</td>
            </tr>
            <tr>
              <th scope="row">{copy.rate}</th>
              <td>{successRate(repoA)}</td>
              <td>{successRate(repoB)}</td>
            </tr>
            <tr>
              <th scope="row">{copy.latest}</th>
              <td>{lastConclusion(repoA)}</td>
              <td>{lastConclusion(repoB)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {noGitHubActions ? <p className="report-panel-note">{copy.otherCi}</p> : null}
      {hasUnavailableEvidence ? <p className="report-panel-note">{messages.report.neutralEvidence}</p> : null}
    </section>
  );
}
