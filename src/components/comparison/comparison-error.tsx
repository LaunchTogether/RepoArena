"use client";

import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";

type ComparisonErrorProps = {
  title?: string;
  detail?: string;
  variant?: "invalid-url" | "route-error";
};

export function ComparisonError({ title, detail, variant }: ComparisonErrorProps) {
  const { messages } = useLocale();
  const variantCopy = variant === "invalid-url"
    ? { title: messages.comparison.invalidUrlTitle, detail: messages.comparison.invalidUrlDetail }
    : variant === "route-error"
      ? { title: messages.comparison.routeErrorTitle, detail: messages.comparison.routeErrorDetail }
      : { title: title ?? messages.comparison.fallbackErrorTitle, detail: detail ?? messages.comparison.fallbackErrorDetail };

  return (
    <section className="comparison-error" aria-labelledby="comparison-error-title">
      <TriangleAlert size={25} aria-hidden="true" />
      <p className="eyebrow">{messages.comparison.errorKicker}</p>
      <h1 id="comparison-error-title">{variantCopy.title}</h1>
      <p>{variantCopy.detail}</p>
      <Link className="primary-button" href="/"><ArrowLeft size={17} aria-hidden="true" /> {messages.comparison.retry}</Link>
    </section>
  );
}
