"use client";

import { Suspense } from "react";
import { ComparisonForm } from "@/components/landing/comparison-form";
import { ExamplePanel } from "@/components/landing/example-panel";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MetricsIndex } from "@/components/landing/metrics-index";
import { SiteHeader } from "@/components/landing/site-header";
import { AmbientSignalGrid } from "@/components/landing/ambient-signal-grid";
import { useLocale } from "@/components/locale/locale-provider";

export default function HomePage() {
  const { messages } = useLocale();

  return (
    <main>
      <div className="page-frame">
        <SiteHeader />
        <section className="hero" aria-labelledby="hero-title">
          <AmbientSignalGrid />
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span aria-hidden="true" /> {messages.landing.eyebrow}</p>
            <h1 id="hero-title">{messages.landing.title} <em>{messages.landing.titleEmphasis}</em></h1>
            <p className="hero-description">{messages.landing.description}</p>
          </div>
          <Suspense fallback={<div className="comparison-form" aria-busy="true" />}>
            <ComparisonForm />
          </Suspense>
        </section>
        <HowItWorks />
        <MetricsIndex />
        <ExamplePanel />
      </div>
    </main>
  );
}
