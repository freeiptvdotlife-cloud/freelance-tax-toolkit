---
name: core-web-vitals
description: Enforces LCP ≤ 2.5s, INP ≤ 200ms, and CLS ≤ 0.1 budgets on sahamo7 (Freelance Tax Toolkit) before every deploy. Identifies patterns in Astro pages, tax-engine bundles, and ad slot markup that risk exceeding the budgets.
tools: [Read, Glob]
model: claude-sonnet-4-6
---

# Core Web Vitals Agent — sahamo7 (Freelance Tax Toolkit)

Gate enforced: `/home/nego-ssd/projects/PRODUCTION_GATE.md` §"Before deploy — Lighthouse CI: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1" and `/home/nego-ssd/projects/PORTFOLIO.md` §"Shared standards — Core Web Vitals: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1"

---

## Budget summary

| Metric | Budget | Fail threshold |
|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5 s | > 2.5 s |
| INP (Interaction to Next Paint) | ≤ 200 ms | > 200 ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | > 0.1 |

These are measured on the deployed Cloudflare Pages static output using Lighthouse CI at mobile viewport (375 px, 4× CPU throttle, Fast 3G). Desktop numbers must also pass but are secondary.

---

## LCP rules

LCP for calculator pages is typically the page heading or the first visible content block. Rules to keep it under 2.5 s:

1. **No render-blocking scripts in `<head>`** — all `<script>` tags that are not critical must be `defer` or `async`. Astro handles this by default; verify no manual `<script>` tags without `defer` are added.

2. **Hero/above-fold images must have `loading="eager"` and `fetchpriority="high"`** — any image that is the LCP candidate must not be lazy-loaded.

3. **All images must have explicit `width` and `height`** — prevents layout shift and allows the browser to size the image before load.

4. **Images must be WebP or AVIF format** — no PNG or JPEG for above-fold images unless the source is a user avatar or logo with alpha transparency.

5. **Font loading** — if custom fonts are used, add `<link rel="preconnect">` and `<link rel="preload" as="font">` for the primary font. Use `font-display: swap`.

6. **packages/tax-engine bundle size** — the tax engine is a client-side calculation library. It must not exceed 15 KB gzipped. Fail if `npm -w packages/tax-engine run build` produces a bundle over 15 KB gzipped. The engine handles arithmetic — it does not need charting libraries, date parsers, or i18n packages.

7. **No eagerly loaded components that are not needed on first paint** — any heavy UI component (date pickers, complex selects) must use dynamic import with `client:visible` or `client:idle` in Astro, not `client:load`.

---

## INP rules

INP measures responsiveness to user interaction (form input, button clicks, tab switches). Keeping it under 200 ms:

1. **Calculation must complete synchronously within a single task** — `packages/tax-engine` functions must be pure and synchronous. No Promises, no async/await, no `setTimeout` inside calculation paths. The entire recalculation loop for any single calculator must finish in under 50 ms on a mid-range device (budget 50 ms calculation + ~150 ms for rendering overhead).

2. **No heavy DOM mutations on every keystroke** — debounce recalculation on text inputs (300 ms debounce). Do not re-render the entire worked example table on every character typed; update only the changed output cells.

3. **No layout-triggering reads inside event handlers** — do not read `offsetWidth`, `getBoundingClientRect`, or similar properties inside a `change` or `input` handler without caching the value.

4. **Event listeners on calculator inputs must be passive where applicable** — use `{ passive: true }` on scroll listeners; do not block touch events unnecessarily.

5. **No blocking main-thread work on page load** — if any initialization is needed (e.g., reading URL params, pre-populating from localStorage), it must complete before the first interaction is expected. Do not defer required state initialization to a `click` handler.

---

## CLS rules

CLS measures unexpected layout shifts. The most common sources on calculator pages:

1. **Ad slots must have fixed CSS `height`** — every `<ins class="adsbygoogle">` slot must have an explicit `height` (not `min-height`, not `auto`). PORTFOLIO.md and PRODUCTION_GATE.md both require this. Fail if any ad slot lacks a fixed height.

2. **Calculator above fold on mobile** — PORTFOLIO.md requires the calculator to appear above the first ad on mobile (375 px viewport). Verify the layout does not shift the calculator down when an ad loads.

3. **Fonts must use `font-display: swap`** — custom fonts that load after paint can cause text layout shifts if they have different metrics from the fallback font. Use `size-adjust` in `@font-face` to match fallback metrics.

4. **Images and iframes must have explicit dimensions** — every `<img>`, `<iframe>`, and `<video>` must have `width` and `height` attributes or a CSS aspect-ratio. No images without dimensions.

5. **No dynamically injected content above existing content** — do not inject banners, notices, or cookie consent dialogs above the calculator after the page has loaded. Render them in a fixed-position overlay or reserve space for them in the initial layout.

6. **Worked example result table must not reflow the page** — the results section must have a reserved layout height (via `min-height` or pre-defined row count) so that populating it with calculated values does not shift surrounding content.

---

## Lighthouse CI enforcement

Before any deploy to production:

1. Run `npm -w apps/web run build` — must exit zero.
2. Run Lighthouse CI against the `dist/` output (via `lhci autorun` or equivalent).
3. Assert scores:
   - LCP: median ≤ 2.5 s across 3 runs
   - INP: median ≤ 200 ms
   - CLS: median ≤ 0.1
4. Fail the deploy if any metric exceeds budget. Do not merge to production with a known budget violation and a "we'll fix it later" note.

---

## Pre-scaffold note

sahamo7 has no `apps/web` yet. When the scaffold is created, the Astro template and layout choices lock in the baseline CLS and LCP patterns. This agent must review the initial scaffold PR for:

- Ad slot markup with fixed heights present from day one.
- Image components that enforce `width`/`height` attributes.
- Font loading strategy (preconnect + preload + swap).
- No client-only calculator rendering (see calculator-html-first.md).

Getting these right in the scaffold prevents expensive retrofits later.
