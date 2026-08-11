# RepoArena Report V2 Design

## Goal

Turn a single, explainable repository score into a source-backed decision report that makes its evidence, gaps, freshness, and intended use visible.

## Scope

1. Add data coverage, freshness, source links, and a detailed project-health checklist.
2. Fetch and show repository activity, releases, issue/PR flow, GitHub Actions, language distribution, and contributor concentration.
3. Add deterministic strengths, risks, and a purpose-aware reading of the same evidence.
4. Make a public comparison reproducible through a shareable snapshot payload and prepare a server-side persistence boundary for authenticated history.

## Constraints

- Only aggregate public GitHub metadata in the default comparison flow; never expose tokens or retain issue/PR text, author identities, or commit messages.
- `unknown`, `not configured`, `not applicable`, and `rate limited` are separate report states and never become zero-score penalties.
- Every fetched metric includes a source URL or documented source label.
- Public GitHub calls are parallel, bounded, cached by repository reference, and surfaced as unavailable rather than silently substituted.
- GitHub Actions signals describe GitHub Actions only; absence is neutral because a repository may use another CI provider.
- Dependabot, traffic, branch-protection detail, and persistent account history remain owner-authorized capabilities and require server-side OAuth/Supabase configuration before enabling real data.

## Data Model

`RepositoryMetrics` grows into focused immutable subrecords: `communityHealth`, `activity`, `release`, `workFlow`, `languages`, `contributorConcentration`, and `projectFiles`.

Each external metric is wrapped by `MetricValue<T>`:

```ts
type MetricStatus = 'available' | 'unknown' | 'not_configured' | 'not_applicable';
type MetricValue<T> = {
  value: T | null;
  status: MetricStatus;
  sourceUrl: string | null;
};
```

The API returns a `report` object alongside the existing score result. Scores can consume only defined, documented metrics; the report renders all metric states.

## Report Hierarchy

1. Overall verdict and score difference.
2. Confidence strip: data coverage, generated time, rate-limit-safe source note, and direct GitHub links.
3. Evidence dashboard: activity, delivery, collaboration, codebase, community health, and project files.
4. Existing category battles and score explanations.
5. Deterministic strengths, watch-outs, and purpose-aware decision summary.
6. Snapshot/share controls; authenticated history is hidden until a real server-side provider is configured.

Desktop uses paired repository columns within each evidence panel. Mobile changes each panel to a vertical A/B sequence and preserves labels before values. Missing data uses muted text and a status icon, never empty whitespace or red failure styling.

## Error and Cache Policy

The repository core metadata request remains mandatory. Secondary evidence calls are individually captured as typed unavailable report metrics, except explicit rate-limit failures, which preserve the existing actionable API error. GitHub's delayed statistics (`202`) become `unknown` with a retry-oriented label. A 15-minute in-memory TTL cache avoids duplicate public requests during a short comparison session.

## Scoring Policy

The existing seven categories and documented weights remain the default. New signals first appear as report evidence. Only activity, maintenance, documentation, and health get explicit, tested incremental score rules after their raw values and missing-data behavior are visible.

## Snapshot and Account Boundary

The public URL continues to identify two repositories and dynamically fetches current data. A share action copies that stable comparison URL and generated timestamp. Persisted history, favourites, OAuth, and owner-only security data require a configured Supabase project and GitHub OAuth client; no local or fabricated account history is shown before those credentials exist.

## Verification

- Unit tests cover mapping, metric state, cache behavior, score normalization, and deterministic insights.
- Route tests cover secondary evidence partial availability and rate-limit propagation.
- Component tests cover available, unknown, and neutral-not-configured presentations.
- A real public-repository comparison validates report rendering.
