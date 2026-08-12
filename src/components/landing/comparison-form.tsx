"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check, GitBranch, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale/locale-provider";

type FormErrors = {
  repoA?: string;
  repoB?: string;
};

const defaultRepos = {
  repoA: "https://github.com/facebook/react",
  repoB: "https://github.com/vuejs/core",
};

function toPathPart(value: string) {
  const normalized = value.trim().replace(/\.git\/?$/, "").replace(/\/$/, "");
  const shortForm = normalized.replace(/^https?:\/\/github\.com\//, "");
  const segments = shortForm.split("/");

  if (segments.length !== 2 || !segments[0] || !segments[1]) {
    return null;
  }

  return { owner: segments[0], repository: segments[1] };
}

export function ComparisonForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [repoA, setRepoA] = useState(() => searchParams.get("repo-a") ?? "");
  const [repoB, setRepoB] = useState(() => searchParams.get("repo-b") ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { messages } = useLocale();

  function fillExample() {
    setRepoA(defaultRepos.repoA);
    setRepoB(defaultRepos.repoB);
    setErrors({});
  }

  function submitComparison(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const parsedA = toPathPart(repoA);
    const parsedB = toPathPart(repoB);

    if (!repoA.trim()) {
      nextErrors.repoA = messages.landing.invalidFirst;
    } else if (!parsedA) {
      nextErrors.repoA = messages.landing.invalidFormat;
    }

    if (!repoB.trim()) {
      nextErrors.repoB = messages.landing.invalidSecond;
    } else if (!parsedB) {
      nextErrors.repoB = messages.landing.invalidFormat;
    }

    if (Object.keys(nextErrors).length > 0 || !parsedA || !parsedB) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsAnalyzing(true);
    router.push(`/compare/${parsedA.owner}/${parsedA.repository}/vs/${parsedB.owner}/${parsedB.repository}`);
  }

  return (
    <form className="comparison-form" onSubmit={submitComparison} noValidate>
      <div className="form-heading">
        <div>
          <p className="form-kicker">{messages.landing.formKicker}</p>
          <p className="form-note">{messages.landing.formNote}</p>
        </div>
        <button className="example-button" type="button" onClick={fillExample} disabled={isAnalyzing}>
          {messages.landing.example}
        </button>
      </div>

      <div className="repo-input-grid">
        <div className="repo-field">
          <label htmlFor="repo-a">{messages.landing.repositoryA}</label>
          <div className="input-shell">
            <GitBranch size={17} aria-hidden="true" />
            <input
              id="repo-a"
              name="repo-a"
              autoComplete="url"
              value={repoA}
              onChange={(event) => setRepoA(event.target.value)}
              placeholder="github.com/owner/repository"
              aria-describedby={errors.repoA ? "repo-a-error" : undefined}
              aria-invalid={Boolean(errors.repoA)}
              disabled={isAnalyzing}
            />
          </div>
          {errors.repoA ? <p className="field-error" id="repo-a-error">{errors.repoA}</p> : null}
        </div>

        <div className="form-vs" aria-hidden="true"><span>VS</span></div>

        <div className="repo-field">
          <label htmlFor="repo-b">{messages.landing.repositoryB}</label>
          <div className="input-shell">
            <GitBranch size={17} aria-hidden="true" />
            <input
              id="repo-b"
              name="repo-b"
              autoComplete="url"
              value={repoB}
              onChange={(event) => setRepoB(event.target.value)}
              placeholder="github.com/owner/repository"
              aria-describedby={errors.repoB ? "repo-b-error" : undefined}
              aria-invalid={Boolean(errors.repoB)}
              disabled={isAnalyzing}
            />
          </div>
          {errors.repoB ? <p className="field-error" id="repo-b-error">{errors.repoB}</p> : null}
        </div>
      </div>

      <div className="form-footer">
        <p aria-live="polite" className="form-status">
          {isAnalyzing ? <><LoaderCircle size={15} className="spin" aria-hidden="true" /> {messages.landing.preparing}</> : <><Check size={15} aria-hidden="true" /> {messages.landing.publicOnly}</>}
        </p>
        <button className="primary-button" type="submit" disabled={isAnalyzing}>
          {isAnalyzing ? messages.landing.opening : messages.landing.compare}
          {isAnalyzing ? <LoaderCircle size={17} className="spin" aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
