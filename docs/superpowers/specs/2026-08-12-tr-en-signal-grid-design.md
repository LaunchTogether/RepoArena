# TR/EN Localization and Signal Grid Design

## Goal

Make the public RepoArena experience usable in Turkish and English without changing shareable comparison URLs, and add a restrained animated visual signature that reinforces the idea of live engineering signals.

## Product decisions

- English remains the initial locale to preserve the current public experience. Users can change to Turkish at any time.
- The language control sits beside the existing theme control in the header and exposes two equal `TR` / `EN` buttons.
- Locale is stored only in the browser under `repoarena-locale`; it is not included in repository URLs, API payloads, analytics, or GitHub requests.
- The selected locale updates visible interface copy, accessible labels, `document.documentElement.lang`, and the document title. GitHub repository names, descriptions, topics, evidence URLs, and API-originated values are never translated or altered.
- The client receives a compact typed message catalog rather than a localization dependency. This keeps the existing Next.js App Router route structure intact and avoids a locale-route migration.

## Coverage

The following user-facing surfaces must use the locale catalog:

- Site header, theme toggle, language selector, landing thesis, form states, example action, method, metric, and example sections.
- Invalid comparison route, analysis progress, comparison errors, score summary/category labels, and repository metadata labels.
- Intent selector, evidence/report panels, share control, unavailable-data notes, tables, and accessible labels.

Stable raw values remain as-is: GitHub owner/repository identifiers, numbers, dates where already formatted by the server, metric names returned by GitHub, and technical error codes. Client-facing errors are selected by code, not by a raw server error string.

## Visual direction

The existing warm-orange score accent remains the action and score color. A new subdued green signal color is used only for the atmospheric field, so it does not compete with CTA hierarchy or the existing live-status dot.

`AmbientSignalGrid` is a decorative, reusable component placed behind the landing hero copy and form. It uses two CSS-gradient layers:

- A sparse static layer establishes a quiet data-field texture.
- A second low-opacity layer drifts diagonally with a linear 32-second transform animation. It is clipped to the hero, has no pulse or flash, and never receives pointer or accessibility events.

The grid is lower-density and shorter on mobile. With `prefers-reduced-motion: reduce`, it remains visible but fully static. Content always paints above it and maintains the existing contrast.

## Accessibility and resilience

- The signal field is `aria-hidden` and uses `pointer-events: none`.
- The language selector uses buttons with `aria-pressed`, localized accessible names, keyboard support, and the existing focus treatment.
- Locale changes preserve the current page and query string. It uses an external-store subscription so controls on any route stay in sync with browser storage changes.
- Server-rendered markup uses English until hydration; the provider applies the selected browser locale immediately after mount without changing URL routing.

## Validation

- Test language persistence, document language/title updates, and translated controls on landing and comparison states.
- Test the decorative grid is present, hidden from assistive technology, and has reduced-motion-safe CSS.
- Run targeted component tests, the complete test suite, lint, TypeScript checking, production build, and a live local browser smoke pass in dark/light and TR/EN modes.
