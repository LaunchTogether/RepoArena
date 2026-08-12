"use client";

import type { MetricStatus, RepositoryReportInsights } from "@/types/comparison";
import { useLocale } from "@/components/locale/locale-provider";

type ProjectFilesMetric = RepositoryReportInsights["projectFiles"];

type ProjectHealthChecklistProps = {
  repoA: ProjectFilesMetric;
  repoB: ProjectFilesMetric;
  repoAName: string;
  repoBName: string;
};

const practiceKeys = ["hasSecurityPolicy", "hasChangelog", "hasTests", "hasCi", "hasLockfile", "hasDocker", "hasLintConfig"] as const;

export function ProjectHealthChecklist({ repoA, repoB, repoAName, repoBName }: ProjectHealthChecklistProps) {
  const { locale } = useLocale();
  const copy = locale === "tr"
    ? { kicker: "Mühendislik güvenceleri", title: "Proje sağlığı kontrol listesi", caption: "Her depo için algılanan proje uygulamaları", practice: "Uygulama", labels: ["Güvenlik politikası", "Değişiklik günlüğü", "Testler", "Sürekli entegrasyon", "Kilit dosyası", "Docker", "Lint yapılandırması"], unknown: "Kanıt kullanılamıyor", configured: "Yapılandırılmadı", notApplicable: "Geçerli değil", available: "Mevcut", detected: "Algılandı", notDetected: "Algılanmadı" }
    : { kicker: "Engineering safeguards", title: "Project health checklist", caption: "Detected project practices for each repository", practice: "Practice", labels: ["Security policy", "Changelog", "Tests", "Continuous integration", "Lockfile", "Docker", "Lint configuration"], unknown: "Evidence unavailable", configured: "Not configured", notApplicable: "Not applicable", available: "Available", detected: "Detected", notDetected: "Not detected" };
  const statusLabel = (status: MetricStatus) => status === "unknown" ? copy.unknown : status === "not_configured" ? copy.configured : status === "not_applicable" ? copy.notApplicable : copy.available;
  const practiceLabel = (metric: ProjectFilesMetric, key: (typeof practiceKeys)[number]) => metric.status !== "available" || metric.value === null ? statusLabel(metric.status) : metric.value[key] ? copy.detected : copy.notDetected;

  return (
    <section className="report-panel project-health-checklist" aria-labelledby="project-health-title">
      <div className="report-panel-intro">
        <p className="eyebrow">{copy.kicker}</p><h2 id="project-health-title">{copy.title}</h2>
      </div>
      <div className="report-table-wrap">
        <table>
          <caption>{copy.caption}</caption>
          <thead>
            <tr><th scope="col">{copy.practice}</th><th scope="col">{repoAName}</th><th scope="col">{repoBName}</th></tr>
          </thead>
          <tbody>
            {practiceKeys.map((key, index) => (
              <tr key={key}>
                <th scope="row">{copy.labels[index]}</th>
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
