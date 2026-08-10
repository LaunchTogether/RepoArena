import Link from "next/link";
import { ArrowUpRight, GitCompareArrows } from "lucide-react";
import { ThemeToggle } from "@/components/landing/theme-toggle";

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
      <div className="header-actions">
        <ThemeToggle />
        <a className="header-link" href="#method">
          Method <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
