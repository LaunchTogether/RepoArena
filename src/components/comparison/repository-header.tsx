import { GitFork, Star } from "lucide-react";
import type { RepositoryPreview } from "@/lib/preview/types";

type RepositoryHeaderProps = {
  repository: RepositoryPreview;
  position: "A" | "B";
};

function compactNumber(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function RepositoryHeader({ repository, position }: RepositoryHeaderProps) {
  return (
    <article className="repository-header">
      <div className="repo-identity">
        <span className="repo-badge" aria-hidden="true">{position}</span>
        <div>
          <p className="repo-owner">{repository.owner}</p>
          <h2>{repository.name}</h2>
        </div>
      </div>
      <p className="repo-description">{repository.description ?? "No repository description is available."}</p>
      <dl className="repo-meta">
        <div><dt><Star size={14} aria-hidden="true" /> Stars</dt><dd>{compactNumber(repository.stars)}</dd></div>
        <div><dt><GitFork size={14} aria-hidden="true" /> Forks</dt><dd>{compactNumber(repository.forks)}</dd></div>
        <div><dt>Issues</dt><dd>{compactNumber(repository.openIssues)}</dd></div>
        <div><dt>Language</dt><dd>{repository.primaryLanguage ?? "—"}</dd></div>
      </dl>
    </article>
  );
}
