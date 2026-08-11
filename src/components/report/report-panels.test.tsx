import { render, screen } from "@testing-library/react";
import { DecisionDrivers } from "@/components/report/decision-drivers";
import { EvidenceCoverage } from "@/components/report/evidence-coverage";
import { ProjectHealthChecklist } from "@/components/report/project-health-checklist";
import { TechnologyFootprint } from "@/components/report/technology-footprint";
import type { MetricValue, RepositoryReportInsights } from "@/types/comparison";

function metric<T>(value: T | null, status: MetricValue<T>["status"] = "available"): MetricValue<T> {
  return { value, status, sourceUrl: "https://github.com/facebook/react" };
}

function unavailable<T>(status: Exclude<MetricValue<T>["status"], "available">): MetricValue<T> {
  return { value: null, status, sourceUrl: "https://github.com/facebook/react" };
}

function reportInsights(): RepositoryReportInsights {
  return {
    communityHealth: unavailable<NonNullable<RepositoryReportInsights["communityHealth"]["value"]>>("unknown"),
    activity: unavailable<NonNullable<RepositoryReportInsights["activity"]["value"]>>("unknown"),
    release: unavailable<NonNullable<RepositoryReportInsights["release"]["value"]>>("unknown"),
    issues: unavailable<NonNullable<RepositoryReportInsights["issues"]["value"]>>("unknown"),
    pullRequests: unavailable<NonNullable<RepositoryReportInsights["pullRequests"]["value"]>>("unknown"),
    workflow: unavailable<NonNullable<RepositoryReportInsights["workflow"]["value"]>>("not_configured"),
    languages: metric({
      totalBytes: 1000,
      distribution: [
        { name: "TypeScript", bytes: 720, percentage: 72 },
        { name: "JavaScript", bytes: 280, percentage: 28 },
      ],
    }),
    contributors: unavailable<NonNullable<RepositoryReportInsights["contributors"]["value"]>>("unknown"),
    projectFiles: metric({
      hasSecurityPolicy: true,
      hasChangelog: false,
      hasTests: true,
      hasCi: true,
      hasLockfile: true,
      hasDocker: false,
      hasLintConfig: true,
    }),
    strengths: [],
    risks: [],
  };
}

describe("report evidence panels", () => {
  it("labels unavailable evidence without presenting it as a score penalty", () => {
    render(<EvidenceCoverage coverage={{ available: 12, total: 18 }} />);

    expect(screen.getByText("12 of 18 evidence signals retrieved")).toBeVisible();
    expect(screen.getByText("Some signals could not be retrieved. Scores use only available evidence.")).toBeVisible();
  });

  it("explains the leading repository behind each decision driver", () => {
    render(
      <DecisionDrivers
        repoAName="React"
        repoBName="Vue"
        drivers={[
          {
            category: "release",
            label: "Stable release cadence",
            detail: "5 stable releases in the last year, compared with 2.",
            lead: "repoA",
          },
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: "What drives this result" })).toBeVisible();
    expect(screen.getByText("React leads")).toBeVisible();
    expect(screen.getByText("5 stable releases in the last year, compared with 2.")).toBeVisible();
  });

  it("renders detected project practices as a paired repository checklist", () => {
    const reportA = reportInsights();
    const reportB = reportInsights();
    reportB.projectFiles = unavailable<NonNullable<RepositoryReportInsights["projectFiles"]["value"]>>("unknown");

    render(
      <ProjectHealthChecklist
        repoAName="React"
        repoBName="Vue"
        repoA={reportA.projectFiles}
        repoB={reportB.projectFiles}
      />
    );

    expect(screen.getByRole("heading", { name: "Project health checklist" })).toBeVisible();
    expect(screen.getByText("Tests")).toBeVisible();
    expect(screen.getAllByText("Detected").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Evidence unavailable").length).toBeGreaterThan(0);
  });

  it("shows language distribution without treating unavailable language data as zero", () => {
    const reportA = reportInsights();
    const reportB = reportInsights();
    reportB.languages = unavailable<NonNullable<RepositoryReportInsights["languages"]["value"]>>("not_configured");

    render(
      <TechnologyFootprint
        repoAName="React"
        repoBName="Vue"
        repoA={reportA.languages}
        repoB={reportB.languages}
      />
    );

    expect(screen.getByRole("heading", { name: "Technology footprint" })).toBeVisible();
    expect(screen.getAllByText("TypeScript").length).toBeGreaterThan(0);
    expect(screen.getAllByText("72%").length).toBeGreaterThan(0);
    expect(screen.getByText("Not configured")).toBeVisible();
  });
});
