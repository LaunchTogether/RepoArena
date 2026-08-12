"use client";

import Link from "next/link";
import { ArrowUpRight, GitCompareArrows } from "lucide-react";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { LanguageSwitch } from "@/components/locale/language-switch";
import { useLocale } from "@/components/locale/locale-provider";

export function SiteHeader() {
  const { messages } = useLocale();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label={messages.header.home}>
        <span className="brand-mark" aria-hidden="true">
          <GitCompareArrows size={17} strokeWidth={2.2} />
        </span>
        <span>RepoArena</span>
      </Link>
      <div className="header-status" aria-label={messages.header.status}>
        <span className="status-dot" aria-hidden="true" />
        <span>{messages.header.publicRepositories}</span>
      </div>
      <div className="header-actions">
        <ThemeToggle />
        <LanguageSwitch />
        <a className="header-link" href="#method">
          {messages.header.method} <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
