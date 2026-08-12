"use client";

import { useEffect, useState } from "react";
import type { CompareErrorResponse, ComparisonIntent, ComparisonResult } from "@/types/comparison";
import { AnalysisProgress } from "./analysis-progress";
import { ComparisonError } from "./comparison-error";
import { ComparisonView } from "./comparison-view";
import { useLocale } from "@/components/locale/locale-provider";

type LiveComparisonProps = {
  repoA: string;
  repoB: string;
  initialIntent?: ComparisonIntent;
};

type ComparisonState =
  | { kind: "loading" }
  | { kind: "success"; result: ComparisonResult }
  | { kind: "error"; title: string; detail: string };

function isCompareErrorResponse(value: unknown): value is CompareErrorResponse {
  return typeof value === "object" && value !== null && "error" in value;
}

export function LiveComparison({ repoA, repoB, initialIntent = "general" }: LiveComparisonProps) {
  const [state, setState] = useState<ComparisonState>({ kind: "loading" });
  const [intent, setIntent] = useState<ComparisonIntent>(initialIntent);
  const { messages } = useLocale();

  useEffect(() => {
    let active = true;

    async function loadComparison() {
      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoA, repoB, intent }),
        });
        const payload: unknown = await response.json();

        if (!response.ok) {
          const detail = isCompareErrorResponse(payload) ? messages.comparison.fallbackErrorDetail : messages.comparison.fallbackErrorDetail;
          if (active) {
            setState({ kind: "error", title: messages.comparison.fallbackErrorTitle, detail });
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
            title: messages.comparison.requestErrorTitle,
            detail: messages.comparison.requestErrorDetail,
          });
        }
      }
    }

    void loadComparison();
    return () => {
      active = false;
    };
  }, [repoA, repoB, intent, messages]);

  function changeIntent(nextIntent: ComparisonIntent) {
    if (nextIntent === intent) return;

    const nextUrl = new URL(window.location.href);
    if (nextIntent === "general") {
      nextUrl.searchParams.delete("intent");
    } else {
      nextUrl.searchParams.set("intent", nextIntent);
    }

    window.history.replaceState(null, "", nextUrl);
    setIntent(nextIntent);
    setState({ kind: "loading" });
  }

  if (state.kind === "loading") return <AnalysisProgress />;
  if (state.kind === "error") return <ComparisonError title={state.title} detail={state.detail} />;

  return <ComparisonView result={state.result} intent={intent} onIntentChange={changeIntent} />;
}
