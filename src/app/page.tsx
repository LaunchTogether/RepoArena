import { ComparisonForm } from "@/components/landing/comparison-form";
import { ExamplePanel } from "@/components/landing/example-panel";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MetricsIndex } from "@/components/landing/metrics-index";
import { SiteHeader } from "@/components/landing/site-header";

export default function HomePage() {
  return (
    <main>
      <div className="page-frame">
        <SiteHeader />
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span aria-hidden="true" /> Engineering signals, made comparable</p>
            <h1 id="hero-title">Which repository <em>wins?</em></h1>
            <p className="hero-description">Compare GitHub repositories using real engineering metrics — not just stars.</p>
          </div>
          <ComparisonForm />
        </section>
        <HowItWorks />
        <MetricsIndex />
        <ExamplePanel />
      </div>
    </main>
  );
}
