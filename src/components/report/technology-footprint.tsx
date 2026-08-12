"use client";

import type { MetricStatus, RepositoryReportInsights } from "@/types/comparison";
import { useLocale } from "@/components/locale/locale-provider";

type LanguagesMetric = RepositoryReportInsights["languages"];

type TechnologyFootprintProps = {
  repoA: LanguagesMetric;
  repoB: LanguagesMetric;
  repoAName: string;
  repoBName: string;
};

type TechnologyCopy = { unavailable: string; configured: string; notApplicable: string; available: string; empty: string; language: string; share: string; kicker: string; title: string };

function LanguageList({ metric, copy }: { metric: LanguagesMetric; copy: TechnologyCopy }) {
  const statusLabel = (status: MetricStatus) => status === "unknown" ? copy.unavailable : status === "not_configured" ? copy.configured : status === "not_applicable" ? copy.notApplicable : copy.available;
  if (metric.status !== "available" || metric.value === null) {
    return <p className="metric-status" data-status={metric.status}>{statusLabel(metric.status)}</p>;
  }

  if (metric.value.distribution.length === 0) {
    return <p className="metric-status">{copy.empty}</p>;
  }

  return (
    <ul className="language-list">
      {metric.value.distribution.map((language) => (
        <li key={language.name}>
          <span>{language.name}</span>
          <span>{Math.round(language.percentage)}%</span>
          <i aria-hidden="true"><i style={{ width: `${Math.min(100, Math.max(0, language.percentage))}%` }} /></i>
        </li>
      ))}
    </ul>
  );
}

function LanguageTable({ metric, repositoryName, copy }: { metric: LanguagesMetric; repositoryName: string; copy: TechnologyCopy }) {
  if (metric.status !== "available" || metric.value === null) return null;

  return (
    <table className="language-table">
      <caption>{repositoryName} {copy.language}</caption>
      <thead><tr><th scope="col">{copy.language}</th><th scope="col">{copy.share}</th></tr></thead>
      <tbody>
        {metric.value.distribution.map((language) => (
          <tr key={language.name}><th scope="row">{language.name}</th><td>{Math.round(language.percentage)}%</td></tr>
        ))}
      </tbody>
    </table>
  );
}

export function TechnologyFootprint({ repoA, repoB, repoAName, repoBName }: TechnologyFootprintProps) {
  const { locale } = useLocale();
  const copy: TechnologyCopy = locale === "tr"
    ? { kicker: "Kod tabanı kanıtı", title: "Teknoloji izi", unavailable: "Kanıt kullanılamıyor", configured: "Yapılandırılmadı", notApplicable: "Geçerli değil", available: "Mevcut", empty: "Dil dağılımı dönmedi.", language: "Dil dağılımı", share: "Pay" }
    : { kicker: "Codebase evidence", title: "Technology footprint", unavailable: "Evidence unavailable", configured: "Not configured", notApplicable: "Not applicable", available: "Available", empty: "No language distribution was returned.", language: "Language distribution", share: "Share" };

  return (
    <section className="report-panel technology-footprint" aria-labelledby="technology-footprint-title">
      <div className="report-panel-intro">
        <p className="eyebrow">{copy.kicker}</p><h2 id="technology-footprint-title">{copy.title}</h2>
      </div>
      <div className="technology-columns">
        <article>
          <h3>{repoAName}</h3>
          <LanguageList metric={repoA} copy={copy} />
          <LanguageTable metric={repoA} repositoryName={repoAName} copy={copy} />
        </article>
        <article>
          <h3>{repoBName}</h3>
          <LanguageList metric={repoB} copy={copy} />
          <LanguageTable metric={repoB} repositoryName={repoBName} copy={copy} />
        </article>
      </div>
    </section>
  );
}
