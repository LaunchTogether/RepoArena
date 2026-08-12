"use client";

import { useLocale } from "@/components/locale/locale-provider";

export function HowItWorks() {
  const { messages } = useLocale();

  return (
    <section className="method-section" id="method" aria-labelledby="method-title">
      <div className="section-intro">
        <p className="eyebrow">{messages.landing.methodKicker}</p>
        <h2 id="method-title">{messages.landing.methodTitle}</h2>
      </div>
      <ol className="method-list">
        {messages.landing.methodSteps.map(({ title, description }, index) => (
          <li className="method-item" key={title}>
            <span className="method-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
