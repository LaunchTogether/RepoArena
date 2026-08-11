import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ExamplePanel() {
  return (
    <section className="example-panel" aria-labelledby="example-title">
      <div>
        <p className="eyebrow">Live comparison</p>
        <h2 id="example-title">React vs Vue</h2>
        <p>See a live GitHub API comparison with the same evidence and scoring pipeline used by the form.</p>
      </div>
      <Link className="text-link" href="/compare/facebook/react/vs/vuejs/core">
        Open live comparison <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
