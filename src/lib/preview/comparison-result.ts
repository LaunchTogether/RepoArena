import type { ComparisonResultPreview } from "@/lib/preview/types";

export const previewComparison: ComparisonResultPreview = {
  repoA: {
    repository: {
      fullName: "facebook/react",
      owner: "facebook",
      name: "react",
      description: "The library for web and native user interfaces.",
      avatarUrl: "https://github.com/facebook.png?size=96",
      stars: 245000,
      forks: 51000,
      openIssues: 1100,
      primaryLanguage: "JavaScript",
    },
    scores: {
      activity: 87,
      maintenance: 82,
      community: 95,
      codebase: 84,
      documentation: 88,
      popularity: 98,
      health: 86,
      overall: 87,
    },
    reasons: {
      activity: [
        { kind: "positive", label: "Consistent release cadence" },
        { kind: "positive", label: "Active maintenance signals" },
      ],
      maintenance: [
        { kind: "positive", label: "Established maintenance process" },
        { kind: "negative", label: "Large open issue backlog" },
      ],
      community: [
        { kind: "positive", label: "Broad contributor ecosystem" },
        { kind: "positive", label: "High issue and PR participation" },
      ],
      codebase: [
        { kind: "positive", label: "Mature tooling footprint" },
        { kind: "negative", label: "Large multi-package surface" },
      ],
      documentation: [
        { kind: "positive", label: "Extensive developer documentation" },
        { kind: "positive", label: "Clear onboarding resources" },
      ],
      popularity: [
        { kind: "positive", label: "Strong long-term adoption" },
        { kind: "positive", label: "Large ecosystem reach" },
      ],
      health: [
        { kind: "positive", label: "Core project standards present" },
        { kind: "positive", label: "Maintained contribution workflow" },
      ],
    },
  },
  repoB: {
    repository: {
      fullName: "vuejs/core",
      owner: "vuejs",
      name: "core",
      description: "The progressive JavaScript framework for building web UI.",
      avatarUrl: "https://github.com/vuejs.png?size=96",
      stars: 52000,
      forks: 9200,
      openIssues: 690,
      primaryLanguage: "TypeScript",
    },
    scores: {
      activity: 91,
      maintenance: 90,
      community: 86,
      codebase: 93,
      documentation: 89,
      popularity: 89,
      health: 92,
      overall: 91,
    },
    reasons: {
      activity: [
        { kind: "positive", label: "Strong recent development signal" },
        { kind: "positive", label: "Regular release practice" },
      ],
      maintenance: [
        { kind: "positive", label: "Well-maintained issue workflow" },
        { kind: "positive", label: "Recent release signal" },
      ],
      community: [
        { kind: "positive", label: "Active maintainer interaction" },
        { kind: "negative", label: "Smaller contributor pool" },
      ],
      codebase: [
        { kind: "positive", label: "TypeScript-first core" },
        { kind: "positive", label: "Clear repository conventions" },
      ],
      documentation: [
        { kind: "positive", label: "Structured learning path" },
        { kind: "positive", label: "Strong API reference coverage" },
      ],
      popularity: [
        { kind: "positive", label: "Sustained ecosystem adoption" },
        { kind: "positive", label: "Healthy community visibility" },
      ],
      health: [
        { kind: "positive", label: "Maintained project standards" },
        { kind: "positive", label: "Clear contribution surface" },
      ],
    },
  },
  winner: "repoB",
  generatedAt: "Preview fixture — awaiting live GitHub analysis API",
};
