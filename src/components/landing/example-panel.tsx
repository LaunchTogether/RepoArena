import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ExamplePanel() {
  return (
    <section className="example-panel" aria-labelledby="example-title">
      <div>
        <p className="eyebrow">Preview case</p>
        <h2 id="example-title">React vs Vue</h2>
        <p>Explore the UI with a clearly labelled preview result while live GitHub analysis is connected.</p>
      </div>
      <Link className="text-link" href="/compare/facebook/react/vs/vuejs/core">
        Open preview <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
