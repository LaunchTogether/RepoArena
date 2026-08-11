import { render, screen } from "@testing-library/react";
import type { ComparisonReport, RepositoryReportInsights } from "@/types/comparison";
import { ActivityTimeline } from "./activity-timeline";
import { ContinuousIntegration } from "./continuous-integration";
import { ReleaseCadence } from "./release-cadence";
import { WorkflowHealth } from "./workflow-health";

function available<T>(value: T) {
  return { value, status: "available" as const, sourceUrl: "https://github.com/acme/repository" };
}

const repositoryReport: RepositoryReportInsights = {
  communityHealth: available({ healthPercentage: 76, hasIssueTemplate: true, hasPullRequestTemplate: true }),
  activity: available({ commitsLast7Days: 5, commitsLast30Days: 21, commitsLast90Days: 65, activeWeeksLast52: 32, trend: "up" }),
  release: available({ latestName: "v2.4.0", latestPublishedAt: "2026-08-01T00:00:00Z", releasesLastYear: 4, averageIntervalDays: 76 }),
  issues: available({ openedLast90Days: 17, closedLast90Days: 14, openOlderThan90Days: 3, medianCloseDays: 5 }),
  pullRequests: available({ mergedLast90Days: 11, openOlderThan30Days: 2, medianMergeDays: 3 }),
  workflow: available({ completedRuns: 20, successfulRuns: 18, lastConclusion: "success", lastRunAt: "2026-08-11T00:00:00Z" }),
  languages: available({ totalBytes: 100, distribution: [{ name: "TypeScript", bytes: 100, percentage: 100 }] }),
  contributors: available({ activeContributors: 4, topContributorShare: 55 }),
  projectFiles: available({
    hasSecurityPolicy: true,
    hasChangelog: true,
    hasTests: true,
    hasCi: true,
    hasLockfile: true,
    hasDocker: false,
    hasLintConfig: true,
  }),
  strengths: [],
  risks: [],
};

function createReport(overrides: Partial<ComparisonReport> = {}): ComparisonReport {
  return {
    intent: "general",
    generatedAt: "2026-08-12T00:00:00Z",
    intentSummary: "Balances recent delivery, maintenance signals, and project health evidence.",
    coverage: { available: 18, total: 18 },
    repoA: repositoryReport,
    repoB: repositoryReport,
    sourceLedger: [],
    decisionDrivers: [],
    ...overrides,
  };
}

const repositories = { repoAName: "Atlas", repoBName: "Beacon" };

describe("delivery report panels", () => {
  it("renders the 7, 30, and 90 day activity comparison as an accessible table", () => {
    render(<ActivityTimeline report={createReport()} {...repositories} />);

    expect(screen.getByRole("heading", { name: "Development activity" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Commit activity comparison" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Last 30 days.*21.*21/ })).toBeInTheDocument();
    expect(screen.getAllByText("Rising activity")).toHaveLength(2);
  });

  it("renders stable release cadence without treating unavailable data as a penalty", () => {
    const unavailableRelease = {
      ...repositoryReport,
      release: { value: null, status: "unknown" as const, sourceUrl: "https://github.com/acme/repository/releases" },
    };

    render(<ReleaseCadence report={createReport({ repoA: unavailableRelease })} {...repositories} />);

    expect(screen.getByText("Release data is still being prepared by GitHub.")).toBeInTheDocument();
    expect(screen.getByText(/No score penalty/)).toBeInTheDocument();
  });

  it("shows issue and pull request flow with median delivery times", () => {
    render(<WorkflowHealth report={createReport()} {...repositories} />);

    expect(screen.getByRole("heading", { name: "Collaboration flow" })).toBeInTheDocument();
    expect(screen.getAllByText("11 merged")).toHaveLength(2);
    expect(screen.getAllByText("3 day median")).toHaveLength(2);
    expect(screen.getByRole("table", { name: "Issue and pull request flow comparison" })).toBeInTheDocument();
  });

  it("shows neutral GitHub Actions copy when workflow data is not configured", () => {
    const noActions = {
      ...repositoryReport,
      workflow: { value: null, status: "not_configured" as const, sourceUrl: "https://github.com/acme/repository/actions" },
    };

    render(<ContinuousIntegration report={createReport({ repoA: noActions, repoB: noActions })} {...repositories} />);

    expect(screen.getAllByText("GitHub Actions was not configured for this repository.")).toHaveLength(2);
    expect(screen.getByText("Other CI providers may be in use.")).toBeInTheDocument();
    expect(screen.getByText(/No score penalty/)).toBeInTheDocument();
  });
});
