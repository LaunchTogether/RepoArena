import type { ComparisonReport, ReportSourceLedgerEntry } from "@/types/comparison";

type EvidenceCoverageProps = {
  coverage: ComparisonReport["coverage"];
  generatedAt?: string;
  sourceLedger?: ReportSourceLedgerEntry[];
};

function formatGeneratedAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function uniqueSourceUrls(sourceLedger: ReportSourceLedgerEntry[]): string[] {
  return [...new Set(sourceLedger.flatMap((entry) => entry.sourceUrl ? [entry.sourceUrl] : []))];
}

export function EvidenceCoverage({ coverage, generatedAt, sourceLedger = [] }: EvidenceCoverageProps) {
  const complete = coverage.available === coverage.total;
  const sources = uniqueSourceUrls(sourceLedger);

  return (
    <section className="report-panel evidence-coverage" aria-labelledby="evidence-coverage-title">
      <div className="report-panel-intro">
        <p className="eyebrow">Evidence coverage</p>
        <h2 id="evidence-coverage-title">How complete is this read?</h2>
      </div>
      <div className="evidence-coverage-body">
        <p className="coverage-value"><strong>{coverage.available} of {coverage.total} evidence signals retrieved</strong></p>
        <p className="coverage-note">
          {complete
            ? "All requested signals were retrieved. Scores use only available evidence."
            : "Some signals could not be retrieved. Scores use only available evidence."}
        </p>
        <dl className="coverage-details">
          {generatedAt ? <div><dt>Generated</dt><dd>{formatGeneratedAt(generatedAt)}</dd></div> : null}
          <div><dt>Source policy</dt><dd>Public GitHub metadata only</dd></div>
        </dl>
        {sources.length > 0 ? (
          <details className="coverage-sources">
            <summary>View evidence sources</summary>
            <ul>
              {sources.map((sourceUrl) => <li key={sourceUrl}><a href={sourceUrl} target="_blank" rel="noreferrer">GitHub source</a></li>)}
            </ul>
          </details>
        ) : null}
      </div>
    </section>
  );
}
