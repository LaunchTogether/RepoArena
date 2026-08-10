type ComparisonSummaryProps = {
  winnerName: string | null;
  winnerLead: string;
  otherLead: string;
};

export function ComparisonSummary({ winnerName, winnerLead, otherLead }: ComparisonSummaryProps) {
  return (
    <section className="comparison-summary" aria-labelledby="summary-title">
      <p className="eyebrow">Decision note</p>
      <h2 id="summary-title">{winnerName ? `Why ${winnerName} leads` : "A close comparison"}</h2>
      <p>{winnerName ? `${winnerName} comes out ahead on ${winnerLead}. The opposing repository still leads in ${otherLead}.` : "Neither repository separates itself on the overall score; inspect individual categories to decide what matters for your context."}</p>
    </section>
  );
}
