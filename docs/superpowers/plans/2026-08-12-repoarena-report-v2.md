# RepoArena Report V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a source-backed repository comparison report with public GitHub evidence, purpose-aware reading, shareable snapshots, and an honest authenticated-history boundary.

**Architecture:** Expand the server-side GitHub service into a bounded set of typed, cached evidence fetches. Preserve the existing score contract while returning a separate report model with explicit data status. Compose focused report panels from that model; use deterministic insight functions rather than generated prose.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod, Vitest, GitHub REST API, CSS custom properties.

## Global Constraints

- Public comparisons query only public metadata and return aggregates, never GitHub tokens, issue/PR text, author identities, or commit messages.
- Every unavailable secondary signal is typed as `unknown`, `not_configured`, or `not_applicable`, never converted into a numeric zero.
- Keep the seven default score weights in `src/lib/scoring/config.ts`; show new signals as evidence before adding any score rule.
- Bound each comparison to a fixed number of parallel GitHub calls and cache evidence for 15 minutes.
- Do not enable real saved history, OAuth, Dependabot, traffic, or owner-only data without server-side provider credentials.

---

### Task 1: Report metric contract and cache boundary

**Files:**
- Modify: `src/types/comparison.ts`
- Create: `src/lib/github/cache.ts`
- Create: `src/lib/github/cache.test.ts`

**Interfaces:**
- Produces `MetricStatus`, `MetricValue<T>`, `RepositoryReportMetrics`, and `ComparisonReport`.
- Produces `getCachedValue<T>(key, loader)` with 15-minute TTL and no cached rejected promises.

- [ ] **Step 1: Write the failing cache tests**

```ts
it('returns a cached value while its TTL is valid', async () => {
  const loader = vi.fn().mockResolvedValue({ value: 1 });
  await getCachedValue('react', loader);
  await getCachedValue('react', loader);
  expect(loader).toHaveBeenCalledTimes(1);
});

it('does not cache a rejected request', async () => {
  const loader = vi.fn().mockRejectedValue(new Error('GitHub unavailable'));
  await expect(getCachedValue('react', loader)).rejects.toThrow('GitHub unavailable');
  await expect(getCachedValue('react', loader)).rejects.toThrow('GitHub unavailable');
  expect(loader).toHaveBeenCalledTimes(2);
});
```

- [ ] **Step 2: Run the cache test to verify it fails**

Run: `npm run test -- src/lib/github/cache.test.ts`

- [ ] **Step 3: Implement the typed metric contract and cache**

```ts
export type MetricStatus = 'available' | 'unknown' | 'not_configured' | 'not_applicable';
export type MetricValue<T> = { value: T | null; status: MetricStatus; sourceUrl: string | null };
```

Use a module-local `Map<string, { expiresAt: number; value: unknown }>` and delete the cache entry when the loader rejects.

- [ ] **Step 4: Run the focused tests**

Run: `npm run test -- src/lib/github/cache.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/types/comparison.ts src/lib/github/cache.ts src/lib/github/cache.test.ts
git commit -m "feat: add report metric contract"
```

### Task 2: Fetch typed public GitHub evidence

**Files:**
- Modify: `src/lib/github/repositories.ts`
- Modify: `src/lib/github/client.ts`
- Modify: `src/lib/github/__tests__/repositories.test.ts`
- Modify: `src/types/comparison.ts`

**Interfaces:**
- Consumes `MetricValue<T>` and `getCachedValue`.
- Produces `RepositoryReportMetrics` for community profile, workflow runs, releases, issues, PRs, languages, contributors, and commit activity.

- [ ] **Step 1: Add failing repository-service tests**

```ts
it('maps a missing Actions run list to not_configured without failing a comparison', async () => {
  // mock core metadata and a 404 Actions response
  const result = await fetchRepositoryData(ref);
  expect(result.report.workflow.status).toBe('not_configured');
});

it('maps a delayed commit statistics response to unknown', async () => {
  const result = await fetchRepositoryData(ref);
  expect(result.report.activity.status).toBe('unknown');
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm run test -- src/lib/github/__tests__/repositories.test.ts`

- [ ] **Step 3: Add bounded parallel evidence requests**

Use these relative REST paths per repository:

```ts
`/repos/${owner}/${name}/community/profile`
`/repos/${owner}/${name}/actions/runs?status=completed&per_page=20`
`/repos/${owner}/${name}/releases?per_page=100`
`/repos/${owner}/${name}/issues?state=all&since=${since90Days}&per_page=100`
`/repos/${owner}/${name}/pulls?state=closed&sort=updated&direction=desc&per_page=100`
`/repos/${owner}/${name}/languages`
`/repos/${owner}/${name}/stats/contributors`
`/repos/${owner}/${name}/stats/commit_activity`
```

Keep core metadata required. Map expected secondary 404/202 responses to metric status; preserve real rate-limit failures. Derive only aggregates: counts, dates, medians, shares, and language percentages.

- [ ] **Step 4: Run repository and client tests**

Run: `npm run test -- src/lib/github/__tests__/repositories.test.ts src/lib/github/__tests__/client.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/github/repositories.ts src/lib/github/client.ts src/lib/github/__tests__/repositories.test.ts src/types/comparison.ts
git commit -m "feat: fetch repository report evidence"
```

### Task 3: Score evidence, confidence, and deterministic insight engine

**Files:**
- Modify: `src/lib/scoring/engine.ts`
- Modify: `src/lib/scoring/categories.ts`
- Modify: `src/lib/scoring/reasons.ts`
- Create: `src/lib/report/insights.ts`
- Create: `src/lib/report/insights.test.ts`
- Modify: `src/types/comparison.ts`

**Interfaces:**
- Produces `ComparisonReport` with coverage, source ledger, decision drivers, strengths, risks, and intent-specific reading.
- `generateReportInsights(result, intent)` is pure and returns at most three decision drivers per result.

- [ ] **Step 1: Write failing insight tests**

```ts
it('does not penalize a repository when workflow data is not configured', () => {
  const report = generateReportInsights(fixtureWithNoActions, 'general');
  expect(report.repoA.workflow.status).toBe('not_configured');
  expect(report.repoA.risks).not.toContain('No CI');
});

it('uses release cadence as a decision driver only when both sides have data', () => {
  const report = generateReportInsights(fixtureWithReleases, 'adopting_library');
  expect(report.decisionDrivers[0]?.category).toBe('release');
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm run test -- src/lib/report/insights.test.ts`

- [ ] **Step 3: Implement coverage and deterministic insight rules**

Coverage is `available signal count / total signal count`. Use raw report metrics for strengths and risks. Only add an activity/maintenance score reason when a defined available metric has an explicit threshold in `config.ts`; retain all existing weights.

- [ ] **Step 4: Run scoring and report tests**

Run: `npm run test -- src/lib/scoring/__tests__ src/lib/report/insights.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring src/lib/report src/types/comparison.ts
git commit -m "feat: add report confidence and insights"
```

### Task 4: Return report data and intent validation from the compare API

**Files:**
- Modify: `src/app/api/compare/route.ts`
- Modify: `src/app/api/compare/__tests__/route.test.ts`
- Modify: `src/types/comparison.ts`

**Interfaces:**
- Request accepts optional `intent: 'general' | 'adopting_library' | 'contributing' | 'reference_project'`.
- Response returns the score result plus `report` and `createdAt`.

- [ ] **Step 1: Add failing route tests**

```ts
it('returns an evidence report for a valid intent', async () => {
  const response = await POST(requestWithIntent('adopting_library'));
  expect((await response.json()).report.coverage.total).toBeGreaterThan(0);
});

it('rejects an unknown intent with the existing stable invalid-input error', async () => {
  const response = await POST(requestWithIntent('unsupported'));
  expect(response.status).toBe(400);
});
```

- [ ] **Step 2: Run the route test to verify it fails**

Run: `npm run test -- src/app/api/compare/__tests__/route.test.ts`

- [ ] **Step 3: Extend the strict Zod schema and JSON response**

Do not accept any raw GitHub URLs in source fields. Keep failure messages stable and never expose GitHub bodies.

- [ ] **Step 4: Run the route test**

Run: `npm run test -- src/app/api/compare/__tests__/route.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/compare/route.ts src/app/api/compare/__tests__/route.test.ts src/types/comparison.ts
git commit -m "feat: return evidence reports from compare API"
```

### Task 5: Build report evidence panels

**Files:**
- Create: `src/components/report/evidence-coverage.tsx`
- Create: `src/components/report/decision-drivers.tsx`
- Create: `src/components/report/activity-timeline.tsx`
- Create: `src/components/report/workflow-health.tsx`
- Create: `src/components/report/release-cadence.tsx`
- Create: `src/components/report/continuous-integration.tsx`
- Create: `src/components/report/project-health-checklist.tsx`
- Create: `src/components/report/technology-footprint.tsx`
- Create: `src/components/report/comparison-intent.tsx`
- Modify: `src/components/comparison/comparison-view.tsx`
- Modify: `src/components/comparison/live-comparison.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/report/report-panels.test.tsx`

**Interfaces:**
- Consumes `ComparisonReport` and the selected comparison intent.
- All panel state uses `MetricStatus`; no component infers missing data from `null` alone.

- [ ] **Step 1: Write failing UI tests**

```tsx
it('labels unavailable evidence without presenting it as a score penalty', () => {
  render(<EvidenceCoverage coverage={partialCoverage} />);
  expect(screen.getByText('Some signals could not be retrieved. Scores use only available evidence.')).toBeVisible();
});

it('shows neutral GitHub Actions copy when no workflow run was found', () => {
  render(<ContinuousIntegration report={noActionsReport} />);
  expect(screen.getByText('Other CI providers may be in use.')).toBeVisible();
});
```

- [ ] **Step 2: Run the panel test to verify it fails**

Run: `npm run test -- src/components/report/report-panels.test.tsx`

- [ ] **Step 3: Implement the panels in report hierarchy order**

Render `EvidenceCoverage` and `DecisionDrivers` after `OverallScore`; then activity/release, workflow/CI, technology, and checklist panels before score reasons. Use paired rows on desktop and labelled stacked rows below 720px. Present a native table alternative for every visual bar or timeline. Intent selection updates the query string and repeats the existing API request without moving focus.

- [ ] **Step 4: Run component tests**

Run: `npm run test -- src/components/report/report-panels.test.tsx src/components/comparison`

- [ ] **Step 5: Commit**

```bash
git add src/components/report src/components/comparison src/app/globals.css
git commit -m "feat: add source-backed report panels"
```

### Task 6: Add shareable snapshots and honest history boundary

**Files:**
- Create: `src/lib/report/snapshot.ts`
- Create: `src/lib/report/snapshot.test.ts`
- Create: `src/components/report/share-comparison.tsx`
- Create: `src/components/report/comparison-history.tsx`
- Modify: `src/components/comparison/comparison-view.tsx`
- Modify: `.env.example`

**Interfaces:**
- `buildComparisonShareUrl({ repoA, repoB, intent })` creates a stable public URL without report data or credentials.
- `ComparisonHistory` returns `null` until `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured and a real authenticated server route exists.

- [ ] **Step 1: Write failing snapshot tests**

```ts
it('preserves both repositories and intent in a share URL', () => {
  expect(buildComparisonShareUrl(input)).toContain('intent=contributing');
});

it('does not include report payloads or credentials in a share URL', () => {
  expect(buildComparisonShareUrl(input)).not.toContain('report=');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- src/lib/report/snapshot.test.ts`

- [ ] **Step 3: Implement public sharing and the provider guard**

Use `navigator.clipboard` only after an explicit user action and announce success in an `aria-live` region. Document Supabase/GitHub OAuth variables as optional server-side setup requirements; do not render a sign-in or history control until that provider exists.

- [ ] **Step 4: Run snapshot and component tests**

Run: `npm run test -- src/lib/report/snapshot.test.ts src/components/report`

- [ ] **Step 5: Commit**

```bash
git add src/lib/report src/components/report src/components/comparison/comparison-view.tsx .env.example
git commit -m "feat: add shareable comparison snapshots"
```

### Task 7: Full verification and PR update

**Files:**
- Modify: `CHANGELOG.md`
- Modify: PR #5 description

- [ ] **Step 1: Add a concise changelog entry**

Record the new evidence report, cache policy, source links, intent reading, and snapshot sharing.

- [ ] **Step 2: Run complete checks**

Run:

```bash
npm run test
npm run lint
npm run build
```

- [ ] **Step 3: Verify the live comparison path**

Compare `kutluhangil/Astrobender` with `gokcank/ProjectNucleus`; confirm evidence panels render, unavailable states are neutral, and sharing copies a comparison URL.

- [ ] **Step 4: Commit and push**

```bash
git add CHANGELOG.md
git commit -m "docs: record report v2"
git push origin codex/revise-gokcan-backend
```

- [ ] **Step 5: Update draft PR #5**

Replace the PR summary with the completed user-visible features and exact verification commands/results.
