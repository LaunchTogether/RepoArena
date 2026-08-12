"use client";

import { useLocale } from "@/components/locale/locale-provider";

const metricKeys = ["A", "M", "C", "D", "H"];

export function MetricsIndex() {
  const { messages } = useLocale();

  return (
    <section className="metrics-section" aria-labelledby="metrics-title">
      <div className="section-intro metrics-intro">
        <p className="eyebrow">{messages.landing.metricsKicker}</p>
        <h2 id="metrics-title">{messages.landing.metricsTitle}</h2>
      </div>
      <div className="metrics-list">
        {messages.landing.metrics.map(({ title, description }, index) => (
          <article className="metric-row" key={metricKeys[index]}>
            <span className="metric-key" aria-hidden="true">{metricKeys[index]}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
