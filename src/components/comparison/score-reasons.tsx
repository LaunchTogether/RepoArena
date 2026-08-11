import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ScoreReason } from "@/lib/preview/types";

type ScoreReasonsProps = {
  title: string;
  reasons: ScoreReason[];
};

export function ScoreReasons({ title, reasons }: ScoreReasonsProps) {
  return (
    <section className="score-reasons" aria-label={title}>
      <h3>{title}</h3>
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
