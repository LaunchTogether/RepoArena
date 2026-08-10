type OverallScoreProps = {
  repoAName: string;
  repoBName: string;
  repoAScore: number;
  repoBScore: number;
  winner: "repoA" | "repoB" | null;
};

export function OverallScore({ repoAName, repoBName, repoAScore, repoBScore, winner }: OverallScoreProps) {
  const winnerName = winner === "repoA" ? repoAName : winner === "repoB" ? repoBName : null;
  const difference = Math.abs(repoAScore - repoBScore);

  return (
    <section className="overall-score" aria-labelledby="overall-title">
      <div className="overall-label">
        <p className="eyebrow">RepoArena score</p>
        <h2 id="overall-title">The overall read</h2>
      </div>
      <div className="score-pair">
        <div className={winner === "repoA" ? "score-number is-winner" : "score-number"}>
          <span>{repoAName}</span>
          <strong>{repoAScore}</strong>
        </div>
        <div className="score-separator" aria-hidden="true"><span>VS</span></div>
        <div className={winner === "repoB" ? "score-number is-winner" : "score-number"}>
          <span>{repoBName}</span>
          <strong>{repoBScore}</strong>
        </div>
      </div>
      <p className="winner-copy">
        {winnerName ? <><span>Winner</span> {winnerName} <b>+{difference}</b></> : "No overall winner — the scores are tied."}
      </p>
    </section>
  );
}
