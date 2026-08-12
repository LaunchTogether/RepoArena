"use client";

import type { ComparisonIntent } from "@/types/comparison";
import { useLocale } from "@/components/locale/locale-provider";

const optionValues: ComparisonIntent[] = ["general", "adopting_library", "contributing", "reference_project"];

type ComparisonIntentProps = {
  intent: ComparisonIntent;
  onChange: (intent: ComparisonIntent) => void;
};

export function ComparisonIntentControl({ intent, onChange }: ComparisonIntentProps) {
  const { messages } = useLocale();

  return (
    <section className="comparison-intent" aria-labelledby="comparison-intent-title">
      <div>
        <p className="eyebrow">{messages.report.intentKicker}</p>
        <h2 id="comparison-intent-title">{messages.report.intentTitle}</h2>
      </div>
      <label>
        <span className="sr-only">{messages.report.intentLabel}</span>
        <select value={intent} onChange={(event) => onChange(event.target.value as ComparisonIntent)}>
          {optionValues.map((value) => <option key={value} value={value}>{messages.report.intents[value]}</option>)}
        </select>
      </label>
    </section>
  );
}
