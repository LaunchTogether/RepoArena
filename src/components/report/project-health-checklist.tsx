import type { MetricStatus, RepositoryReportInsights } from "@/types/comparison";

type ProjectFilesMetric = RepositoryReportInsights["projectFiles"];

type ProjectHealthChecklistProps = {
  repoA: ProjectFilesMetric;
  repoB: ProjectFilesMetric;
  repoAName: string;
  repoBName: string;
};

const practices = [
  ["Security policy", "hasSecurityPolicy"],
  ["Changelog", "hasChangelog"],
  ["Tests", "hasTests"],
  ["Continuous integration", "hasCi"],
  ["Lockfile", "hasLockfile"],
  ["Docker", "hasDocker"],
  ["Lint configuration", "hasLintConfig"],
] as const;

function statusLabel(status: MetricStatus): string {
  if (status === "unknown") return "Evidence unavailable";
  if (status === "not_configured") return "Not configured";
  if (status === "not_applicable") return "Not applicable";
  return "Available";
}

function practiceLabel(metric: ProjectFilesMetric, key: (typeof practices)[number][1]): string {
  if (metric.status !== "available" || metric.value === null) return statusLabel(metric.status);
  return metric.value[key] ? "Detected" : "Not detected";
}

export function ProjectHealthChecklist({ repoA, repoB, repoAName, repoBName }: ProjectHealthChecklistProps) {
  return (
    <section className="report-panel project-health-checklist" aria-labelledby="project-health-title">
      <div className="report-panel-intro">
        <p className="eyebrow">Engineering safeguards</p>
        <h2 id="project-health-title">Project health checklist</h2>
      </div>
      <div className="report-table-wrap">
        <table>
          <caption>Detected project practices for each repository</caption>
          <thead>
            <tr><th scope="col">Practice</th><th scope="col">{repoAName}</th><th scope="col">{repoBName}</th></tr>
          </thead>
          <tbody>
            {practices.map(([label, key]) => (
              <tr key={key}>
                <th scope="row">{label}</th>
                <td data-status={repoA.status}>{practiceLabel(repoA, key)}</td>
                <td data-status={repoB.status}>{practiceLabel(repoB, key)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
