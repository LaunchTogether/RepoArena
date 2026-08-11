"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type ShareComparisonProps = {
  path: string;
};

export function ShareComparison({ path }: ShareComparisonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyComparison() {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="share-comparison">
      <button type="button" className="share-button" onClick={copyComparison}>
        {status === "copied" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        {status === "copied" ? "Link copied" : "Copy comparison link"}
      </button>
      <p aria-live="polite" className="share-status">
        {status === "failed" ? "Your browser could not copy the link. Copy the address from the browser instead." : null}
      </p>
    </div>
  );
}
