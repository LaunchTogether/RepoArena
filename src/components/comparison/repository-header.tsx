"use client";

import { GitFork, Star } from "lucide-react";
import type { RepositoryPreview } from "@/lib/preview/types";
import { useLocale } from "@/components/locale/locale-provider";

type RepositoryHeaderProps = {
  repository: RepositoryPreview;
  position: "A" | "B";
};

function compactNumber(value: number | null, locale: string) {
  if (value === null) return "—";
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function RepositoryHeader({ repository, position }: RepositoryHeaderProps) {
  const { locale, messages } = useLocale();

  return (
    <article className="repository-header">
      <div className="repo-identity">
        <span className="repo-badge" aria-hidden="true">{position}</span>
        <div>
          <p className="repo-owner">{repository.owner}</p>
          <h2>{repository.name}</h2>
        </div>
      </div>
      <p className="repo-description">{repository.description ?? messages.comparison.noDescription}</p>
      <dl className="repo-meta">
        <div><dt><Star size={14} aria-hidden="true" /> {messages.comparison.stars}</dt><dd>{compactNumber(repository.stars, locale)}</dd></div>
        <div><dt><GitFork size={14} aria-hidden="true" /> {messages.comparison.forks}</dt><dd>{compactNumber(repository.forks, locale)}</dd></div>
        <div><dt>{messages.comparison.issues}</dt><dd>{compactNumber(repository.openIssues, locale)}</dd></div>
        <div><dt>{messages.comparison.language}</dt><dd>{repository.primaryLanguage ?? "—"}</dd></div>
      </dl>
    </article>
  );
}
