import Link from "next/link";
import { ArrowUpRight, GitCompareArrows } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="RepoArena ana sayfa">
        <span className="brand-mark" aria-hidden="true">
          <GitCompareArrows size={17} strokeWidth={2.2} />
        </span>
        <span>RepoArena</span>
      </Link>
      <div className="header-status" aria-label="Ürün durumu">
        <span className="status-dot" aria-hidden="true" />
        <span>Public repositories</span>
      </div>
      <a className="header-link" href="#method">
        Method <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </header>
  );
}
