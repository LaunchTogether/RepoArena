"use client";

import type { ComparisonIntent } from "@/types/comparison";

const options: Array<{ value: ComparisonIntent; label: string }> = [
  { value: "general", label: "General assessment" },
  { value: "adopting_library", label: "Adopting a library" },
  { value: "contributing", label: "Contributing" },
  { value: "reference_project", label: "Reference project" },
];

type ComparisonIntentProps = {
  intent: ComparisonIntent;
  onChange: (intent: ComparisonIntent) => void;
};

export function ComparisonIntentControl({ intent, onChange }: ComparisonIntentProps) {
  return (
    <section className="comparison-intent" aria-labelledby="comparison-intent-title">
      <div>
        <p className="eyebrow">Decision context</p>
        <h2 id="comparison-intent-title">Read the same evidence for your goal.</h2>
      </div>
      <label>
        <span className="sr-only">Comparison intent</span>
        <select value={intent} onChange={(event) => onChange(event.target.value as ComparisonIntent)}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </section>
  );
}
