import { Check, LoaderCircle } from "lucide-react";

const stages = ["Repository metadata", "Activity and maintenance signals", "Community and project health", "Calculating scores"];

export function AnalysisProgress() {
  return (
    <section className="analysis-progress" aria-label="Repository analysis in progress" aria-live="polite">
      <p className="eyebrow">Analysis in progress</p>
      <h1>Reading the repository signals.</h1>
      <ol>
        {stages.map((stage, index) => (
          <li key={stage} className={index < 2 ? "complete" : index === 2 ? "active" : ""}>
            {index < 2 ? <Check size={16} aria-hidden="true" /> : index === 2 ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <span aria-hidden="true" />}
            {stage}
          </li>
        ))}
      </ol>
    </section>
  );
}
