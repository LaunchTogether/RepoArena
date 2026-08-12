"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";

export function AnalysisProgress() {
  const { messages } = useLocale();

  return (
    <section className="analysis-progress" aria-label={messages.comparison.analysisLabel} aria-live="polite">
      <p className="eyebrow">{messages.comparison.analysisKicker}</p>
      <h1>{messages.comparison.analysisTitle}</h1>
      <ol>
        {messages.comparison.stages.map((stage, index) => (
          <li key={stage} className={index < 2 ? "complete" : index === 2 ? "active" : ""}>
            {index < 2 ? <Check size={16} aria-hidden="true" /> : index === 2 ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <span aria-hidden="true" />}
            {stage}
          </li>
        ))}
      </ol>
    </section>
  );
}
