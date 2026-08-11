"use client";

import { useEffect, useState } from "react";
import type { CompareErrorResponse, ComparisonResult } from "@/types/comparison";
import { AnalysisProgress } from "./analysis-progress";
import { ComparisonError } from "./comparison-error";
import { ComparisonView } from "./comparison-view";

type LiveComparisonProps = {
  repoA: string;
  repoB: string;
};

type ComparisonState =
  | { kind: "loading" }
  | { kind: "success"; result: ComparisonResult }
  | { kind: "error"; title: string; detail: string };

function isCompareErrorResponse(value: unknown): value is CompareErrorResponse {
  return typeof value === "object" && value !== null && "error" in value;
}

export function LiveComparison({ repoA, repoB }: LiveComparisonProps) {
  const [state, setState] = useState<ComparisonState>({ kind: "loading" });

  useEffect(() => {
    let active = true;

    async function loadComparison() {
      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoA, repoB }),
        });
        const payload: unknown = await response.json();

        if (!response.ok) {
          const detail = isCompareErrorResponse(payload)
            ? payload.error.message
            : "Repository data could not be loaded. Please try again.";
          if (active) {
            setState({ kind: "error", title: "We could not compare these repositories.", detail });
          }
          return;
        }

        if (active) {
          setState({ kind: "success", result: payload as ComparisonResult });
        }
      } catch {
        if (active) {
          setState({
            kind: "error",
            title: "The comparison request could not be completed.",
            detail: "Check your connection and try the comparison again.",
          });
        }
      }
    }

    void loadComparison();
    return () => {
      active = false;
    };
  }, [repoA, repoB]);

  if (state.kind === "loading") return <AnalysisProgress />;
  if (state.kind === "error") return <ComparisonError title={state.title} detail={state.detail} />;

  return <ComparisonView result={state.result} />;
}
