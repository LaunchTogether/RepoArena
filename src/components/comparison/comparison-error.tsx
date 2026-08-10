import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";

type ComparisonErrorProps = {
  title: string;
  detail: string;
};

export function ComparisonError({ title, detail }: ComparisonErrorProps) {
  return (
    <section className="comparison-error" aria-labelledby="comparison-error-title">
      <TriangleAlert size={25} aria-hidden="true" />
      <p className="eyebrow">Comparison unavailable</p>
      <h1 id="comparison-error-title">{title}</h1>
      <p>{detail}</p>
      <Link className="primary-button" href="/"><ArrowLeft size={17} aria-hidden="true" /> Start another comparison</Link>
    </section>
  );
}
