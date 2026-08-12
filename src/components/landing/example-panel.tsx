"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";

export function ExamplePanel() {
  const { messages } = useLocale();

  return (
    <section className="example-panel" aria-labelledby="example-title">
      <div>
        <p className="eyebrow">{messages.landing.exampleKicker}</p>
        <h2 id="example-title">React vs Vue</h2>
        <p>{messages.landing.exampleDescription}</p>
      </div>
      <Link className="text-link" href="/compare/facebook/react/vs/vuejs/core">
        {messages.landing.openExample} <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
