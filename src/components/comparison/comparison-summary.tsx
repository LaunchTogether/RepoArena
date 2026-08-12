"use client";

import { useLocale } from "@/components/locale/locale-provider";

type ComparisonSummaryProps = {
  winnerName: string | null;
  winnerLead: string;
  otherLead: string;
};

export function ComparisonSummary({ winnerName, winnerLead, otherLead }: ComparisonSummaryProps) {
  const { messages } = useLocale();

  return (
    <section className="comparison-summary" aria-labelledby="summary-title">
      <p className="eyebrow">{messages.comparison.decisionKicker}</p>
      <h2 id="summary-title">{winnerName ? messages.comparison.decisionLead(winnerName) : messages.comparison.closeDecision}</h2>
      <p>{winnerName ? messages.comparison.decisionDetail(winnerName, winnerLead, otherLead) : messages.comparison.closeDetail}</p>
    </section>
  );
}
