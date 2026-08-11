import type { MetricStatus, RepositoryReportInsights } from "@/types/comparison";

type LanguagesMetric = RepositoryReportInsights["languages"];

type TechnologyFootprintProps = {
  repoA: LanguagesMetric;
  repoB: LanguagesMetric;
  repoAName: string;
  repoBName: string;
};

function statusLabel(status: MetricStatus): string {
  if (status === "unknown") return "Evidence unavailable";
  if (status === "not_configured") return "Not configured";
  if (status === "not_applicable") return "Not applicable";
  return "Available";
}

function LanguageList({ metric }: { metric: LanguagesMetric }) {
  if (metric.status !== "available" || metric.value === null) {
    return <p className="metric-status" data-status={metric.status}>{statusLabel(metric.status)}</p>;
  }

  if (metric.value.distribution.length === 0) {
    return <p className="metric-status">No language distribution was returned.</p>;
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

function LanguageTable({ metric, repositoryName }: { metric: LanguagesMetric; repositoryName: string }) {
  if (metric.status !== "available" || metric.value === null) return null;

  return (
    <table className="language-table">
      <caption>{repositoryName} language distribution</caption>
      <thead><tr><th scope="col">Language</th><th scope="col">Share</th></tr></thead>
      <tbody>
        {metric.value.distribution.map((language) => (
          <tr key={language.name}><th scope="row">{language.name}</th><td>{Math.round(language.percentage)}%</td></tr>
        ))}
      </tbody>
    </table>
  );
}

export function TechnologyFootprint({ repoA, repoB, repoAName, repoBName }: TechnologyFootprintProps) {
  return (
    <section className="report-panel technology-footprint" aria-labelledby="technology-footprint-title">
      <div className="report-panel-intro">
        <p className="eyebrow">Codebase evidence</p>
        <h2 id="technology-footprint-title">Technology footprint</h2>
      </div>
      <div className="technology-columns">
        <article>
          <h3>{repoAName}</h3>
          <LanguageList metric={repoA} />
          <LanguageTable metric={repoA} repositoryName={repoAName} />
        </article>
        <article>
          <h3>{repoBName}</h3>
          <LanguageList metric={repoB} />
          <LanguageTable metric={repoB} repositoryName={repoBName} />
        </article>
      </div>
    </section>
  );
}
