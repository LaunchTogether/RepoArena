"use client";

import { useLocale } from "@/components/locale/locale-provider";

type CategoryBattleProps = {
  label: string;
  repoAScore: number;
  repoBScore: number;
  repoAName: string;
  repoBName: string;
};

export function CategoryBattle({ label, repoAScore, repoBScore, repoAName, repoBName }: CategoryBattleProps) {
  const { messages } = useLocale();
  const winner = repoAScore === repoBScore ? null : repoAScore > repoBScore ? "A" : "B";
  const difference = Math.abs(repoAScore - repoBScore);

  return (
    <article className="category-battle">
      <header>
        <h3>{label}</h3>
        <p>{winner ? messages.comparison.leadsBy(winner === "A" ? repoAName : repoBName, difference) : messages.comparison.evenlyMatched}</p>
      </header>
      <div className="battle-bars">
        <div className={winner === "A" ? "battle-side is-winner" : "battle-side"}>
          <span>{repoAName}</span><b>{repoAScore}</b>
          <i><i style={{ width: `${repoAScore}%` }} /></i>
        </div>
        <div className={winner === "B" ? "battle-side is-winner" : "battle-side"}>
          <span>{repoBName}</span><b>{repoBScore}</b>
          <i><i style={{ width: `${repoBScore}%` }} /></i>
        </div>
      </div>
    </article>
  );
}
