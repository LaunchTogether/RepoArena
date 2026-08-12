"use client";

import type { ComparisonReport, ReportSourceLedgerEntry } from "@/types/comparison";
import { useLocale } from "@/components/locale/locale-provider";

type EvidenceCoverageProps = {
  coverage: ComparisonReport["coverage"];
  generatedAt?: string;
  sourceLedger?: ReportSourceLedgerEntry[];
};

function formatGeneratedAt(value: string, locale: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(locale);
}

function uniqueSourceUrls(sourceLedger: ReportSourceLedgerEntry[]): string[] {
  return [...new Set(sourceLedger.flatMap((entry) => entry.sourceUrl ? [entry.sourceUrl] : []))];
}

export function EvidenceCoverage({ coverage, generatedAt, sourceLedger = [] }: EvidenceCoverageProps) {
  const { locale, messages } = useLocale();
  const complete = coverage.available === coverage.total;
  const sources = uniqueSourceUrls(sourceLedger);

  return (
    <section className="report-panel evidence-coverage" aria-labelledby="evidence-coverage-title">
      <div className="report-panel-intro">
        <p className="eyebrow">{messages.report.coverageKicker}</p>
        <h2 id="evidence-coverage-title">{messages.report.coverageTitle}</h2>
      </div>
      <div className="evidence-coverage-body">
        <p className="coverage-value"><strong>{messages.report.coverageCount(coverage.available, coverage.total)}</strong></p>
        <p className="coverage-note">
          {complete
            ? messages.report.coverageComplete
            : messages.report.coveragePartial}
        </p>
        <dl className="coverage-details">
          {generatedAt ? <div><dt>{messages.report.generated}</dt><dd>{formatGeneratedAt(generatedAt, locale)}</dd></div> : null}
          <div><dt>{messages.report.sourcePolicy}</dt><dd>{messages.report.sourcePolicyValue}</dd></div>
        </dl>
        {sources.length > 0 ? (
          <details className="coverage-sources">
            <summary>{messages.report.viewSources}</summary>
            <ul>
              {sources.map((sourceUrl) => <li key={sourceUrl}><a href={sourceUrl} target="_blank" rel="noreferrer">{messages.report.githubSource}</a></li>)}
            </ul>
          </details>
        ) : null}
      </div>
    </section>
  );
}
