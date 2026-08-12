# TR/EN Localization and Signal Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent Turkish/English interface controls and an accessible signal-grid signature without changing comparison URLs or GitHub data.

**Architecture:** A compact, typed client-side locale store exposes message catalogs via `LocaleProvider` and `useLocale`. Visible interface copy consumes the catalog while source data remains untouched. A CSS-only `AmbientSignalGrid` uses two transformed gradient layers, clipped to the landing hero.

**Tech Stack:** Next.js App Router, React 19, TypeScript, custom CSS, Vitest, Testing Library, lucide-react.

## Global Constraints

- Keep all current route and comparison URL shapes unchanged.
- Persist the selected locale as `repoarena-locale`; use `en` as its default.
- Do not add a localization package.
- Translate UI, document metadata, and accessible names; never alter GitHub data or API payloads.
- Retain orange for score/actions; use low-opacity green exclusively for the ambient field.
- Respect `prefers-reduced-motion: reduce` with a static field.

---

### Task 1: Locale state, messages, and header controls

**Files:**
- Create: `src/components/locale/locale-provider.tsx`
- Create: `src/components/locale/messages.ts`
- Create: `src/components/locale/language-switch.tsx`
- Create: `src/components/locale/locale-provider.test.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/landing/site-header.tsx`
- Modify: `src/components/landing/theme-toggle.tsx`
- Test: `src/components/landing/theme-toggle.test.tsx`

**Interfaces:**
- Produces `Locale = "en" | "tr"`, `LocaleProvider`, and `useLocale()`.
- `useLocale()` returns `{ locale, messages, setLocale }`.

- [ ] **Step 1: Write failing tests for persistence and document updates**

```tsx
render(<LocaleProvider><LanguageSwitch /></LocaleProvider>);
fireEvent.click(screen.getByRole("button", { name: "Türkçe" }));
expect(document.documentElement.lang).toBe("tr");
expect(localStorage.getItem("repoarena-locale")).toBe("tr");
```

- [ ] **Step 2: Verify the tests fail**

Run: `npm run test -- src/components/locale/locale-provider.test.tsx`

Expected: FAIL because the locale modules are absent.

- [ ] **Step 3: Implement the typed provider and controls**

Create `messages.ts` with complete English/Turkish catalogs. Add `LocaleProvider` around the app root; after hydration update `document.documentElement.lang` and `document.title`. Add the `TR`/`EN` button pair beside `ThemeToggle`, use `aria-pressed`, and read theme labels through the same catalog.

- [ ] **Step 4: Verify focused tests pass**

Run: `npm run test -- src/components/locale/locale-provider.test.tsx src/components/landing/theme-toggle.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the foundation**

Run: `git add src/app/layout.tsx src/components/locale src/components/landing/site-header.tsx src/components/landing/theme-toggle.tsx src/components/landing/theme-toggle.test.tsx && git commit -m "feat: add persistent interface locale"`

### Task 2: Localize the landing surface and add the ambient grid

**Files:**
- Create: `src/components/landing/ambient-signal-grid.tsx`
- Create: `src/components/landing/ambient-signal-grid.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`
- Modify: `src/components/landing/comparison-form.tsx`
- Modify: `src/components/landing/comparison-form.test.tsx`
- Modify: `src/components/landing/how-it-works.tsx`
- Modify: `src/components/landing/metrics-index.tsx`
- Modify: `src/components/landing/example-panel.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- `AmbientSignalGrid` renders no interactive content and always has `aria-hidden="true"`.
- Landing components read `useLocale().messages` for their labels and feedback.

- [ ] **Step 1: Write failing localized landing and grid tests**

```tsx
render(<HomePage />);
fireEvent.click(screen.getByRole("button", { name: "Türkçe" }));
expect(screen.getByRole("heading", { name: /hangi depo kazanır/i })).toBeInTheDocument();
expect(screen.getByLabelText("Depo A")).toBeInTheDocument();
expect(screen.getByTestId("ambient-signal-grid")).toHaveAttribute("aria-hidden", "true");
```

- [ ] **Step 2: Verify the tests fail**

Run: `npm run test -- src/app/page.test.tsx src/components/landing/ambient-signal-grid.test.tsx`

Expected: FAIL because translated copy and the grid are missing.

- [ ] **Step 3: Implement localized landing content and CSS motion**

Render the grid as the first hero child; create a stacking context so copy and form remain above it. Use a sparse static radial-gradient layer and a lower-opacity second layer. Move only that second layer with `transform: translate3d(...)` and `animation: signal-drift 32s linear infinite`. Add mobile density/height limits and a reduced-motion rule that removes the animation but retains a static field.

- [ ] **Step 4: Verify focused tests pass**

Run: `npm run test -- src/app/page.test.tsx src/components/landing/comparison-form.test.tsx src/components/landing/ambient-signal-grid.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit landing work**

Run: `git add src/app/page.tsx src/app/page.test.tsx src/app/globals.css src/components/landing && git commit -m "feat: localize landing and add signal grid"`

### Task 3: Localize compare, loading, errors, and report panels

**Files:**
- Modify: `src/app/compare/[...slug]/page.tsx`
- Modify: `src/app/compare/[...slug]/error.tsx`
- Modify: `src/components/comparison/*.tsx`
- Modify: `src/components/report/*.tsx`
- Test: `src/components/comparison/comparison-view.test.tsx`
- Test: `src/components/comparison/live-comparison.test.tsx`
- Test: `src/components/report/report-panels.test.tsx`
- Test: `src/components/report/delivery-panels.test.tsx`

**Interfaces:**
- Client components use `useLocale().messages` for UI labels.
- `LiveComparison` maps known API failure codes to safe localized details; unknown failures use a catalog fallback.

- [ ] **Step 1: Write failing comparison-state tests**

```tsx
render(<AnalysisProgress />);
fireEvent.click(screen.getByRole("button", { name: "Türkçe" }));
expect(screen.getByText("Depo metaverisi")).toBeInTheDocument();
```

- [ ] **Step 2: Verify the tests fail**

Run: `npm run test -- src/components/comparison/comparison-view.test.tsx src/components/comparison/live-comparison.test.tsx src/components/report/report-panels.test.tsx src/components/report/delivery-panels.test.tsx`

Expected: FAIL because the existing states contain hard-coded English UI text.

- [ ] **Step 3: Implement complete UI catalog use**

Localize comparison headings, score/category labels, metadata labels, analysis stages, safe errors, intent options, report headings, table headings, unavailable-data notes, share feedback, and ARIA labels. Preserve GitHub names, descriptions, topics, URLs, raw metric values, and status semantics.

- [ ] **Step 4: Verify focused tests pass**

Run: `npm run test -- src/components/comparison/comparison-view.test.tsx src/components/comparison/live-comparison.test.tsx src/components/report/report-panels.test.tsx src/components/report/delivery-panels.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit comparison/report localization**

Run: `git add src/app/compare src/components/comparison src/components/report src/components/locale/messages.ts && git commit -m "feat: localize comparison reports"`

### Task 4: Verify and release

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Add a concise changelog entry**

Record that RepoArena now supports TR/EN interface controls and reduced-motion-safe signal grid ambience.

- [ ] **Step 2: Run verification**

Run: `npm run test && npm run lint && npx tsc --noEmit && npm run build`

Expected: all commands exit 0.

- [ ] **Step 3: Perform local browser QA**

Verify the landing page and one real comparison in both themes/locales; check locale persistence after reload, no console errors, mobile header fit, static grid under reduced motion, and unmodified GitHub source data.

- [ ] **Step 4: Commit and push**

Run: `git add CHANGELOG.md && git commit -m "docs: record localization release" && git push -u origin codex/tr-en-signal-grid`

## Self-review

Task 1 establishes a typed, persistent language boundary. Task 2 localizes every landing interaction and adds the design signature. Task 3 covers every comparison/report UI state without translating source data. Task 4 requires automated and live visual proof before release.
