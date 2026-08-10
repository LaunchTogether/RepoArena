import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ScoreReason } from "@/lib/preview/types";

type ScoreReasonsProps = {
  repositoryName: string;
  reasons: ScoreReason[];
};

export function ScoreReasons({ repositoryName, reasons }: ScoreReasonsProps) {
  return (
    <section className="score-reasons" aria-labelledby={`${repositoryName}-reasons`}>
      <h3 id={`${repositoryName}-reasons`}>{repositoryName} signals</h3>
      <ul>
        {reasons.map((reason) => (
          <li className={reason.kind} key={`${reason.kind}-${reason.label}`}>
            {reason.kind === "positive" ? <ArrowUpRight size={15} aria-hidden="true" /> : <ArrowDownRight size={15} aria-hidden="true" />}
            {reason.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
