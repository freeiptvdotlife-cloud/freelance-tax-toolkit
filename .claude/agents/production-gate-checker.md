---
name: production-gate-checker
description: Enforces PRODUCTION_GATE.md before every commit on sahamo7 (Freelance Tax Toolkit). Activates fully once apps/web and packages/tax-engine are scaffolded; in pre-scaffold state it validates that no code committed would violate gate rules once the scaffold exists.
tools: [Read, Glob]
model: claude-sonnet-4-6
---

# Production Gate Checker — sahamo7 (Freelance Tax Toolkit)

Gate enforced: `/home/nego-ssd/projects/PRODUCTION_GATE.md`

## Pre-scaffold notice

sahamo7 has no `apps/web`, no `packages/tax-engine`, and no root `package.json` yet. In this state the agent still runs and verifies:

- No source files introduce `console.log`, hardcoded secrets, or dead code ahead of the scaffold.
- Any scaffolding PR itself passes all gate checks before it merges.

Once `apps/web/` and `packages/tax-engine/` exist, all checks below become mandatory on every commit.

---

## Before-commit checklist (run in order; fail fast on first violation)

### 1. Typecheck clean
- Command: `npm -w apps/web run typecheck` and `npm -w packages/tax-engine run typecheck`
- All TypeScript must compile with `strict: true`. No `any`, no non-null assertions without an explanatory comment.
- Fail if `tsc --noEmit` exits non-zero.

### 2. Lint clean
- Command: `npm -w apps/web run lint` and `npm -w packages/tax-engine run lint`
- Zero ESLint errors or warnings. The `@typescript-eslint/no-explicit-any` rule must remain on.
- Fail if lint exits non-zero.

### 3. Tests pass
- Command: `npm -w packages/tax-engine test`
- Every new calculation function in `tax-engine` (self-employment tax, SE deduction, quarterly estimate, 1099 deduction logic) must have a corresponding Vitest unit test.
- Fail if any test exits non-zero.

### 4. No `console.log` in committed code
- Scan: `grep -rn "console\.log" apps/ packages/` — must return empty.
- Exception: test files only, but prefer `console.error` in error paths and structured logging elsewhere.

### 5. No hardcoded secrets or URLs
- Scan: `grep -rn "VITE_\|secret\|apiKey\|token" apps/web/src packages/tax-engine/src` and verify any matches are only referencing `import.meta.env.*` keys, not literal values.
- PUBLIC_SITE_URL must be set via env var, never hardcoded.

### 6. No dead code
- No unused imports, commented-out blocks, or unreachable branches.
- ESLint `no-unused-vars` and `@typescript-eslint/no-unused-vars` must be on.

---

## Before-deploy checklist

### 7. Build clean
- Command: `npm -w apps/web run build`
- Astro must build with `output: "static"`. No SSR adapter. Build must exit zero.
- The `out/` (or `dist/`) directory must not contain any `.js` file that includes a Node.js built-in (`require('fs')`, `require('path')`, etc.).

### 8. Lighthouse CI
- LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 — as stated in PRODUCTION_GATE.md §Before deploy.
- Run against the built static output. Fail if any metric exceeds the budget.

### 9. Sitemap and robots.txt
- `dist/sitemap*.xml` must exist and contain URLs beginning with `https://mainstreetnumbers.com/self-employed/`.
- `dist/robots.txt` must exist. Staging builds must set `Disallow: /`.

### 10. Canonical tags
- Every `<head>` must contain `<link rel="canonical" href="https://mainstreetnumbers.com/self-employed/...">` matching the page's own URL (self-referencing, not pointing to sahamo8's root).

### 11. Schema validates
- JSON-LD on every page must be valid. Run against Google Rich Results Test or `schema-dts` validation.
- Required schema types: BreadcrumbList (every page), Article (guides), WebSite + Organization (home — shared with sahamo8's mainstreetnumbers.com Organization entity).

### 12. Ad slots have fixed height
- Every `<div>` containing an AdSense `<ins>` tag must have an explicit CSS `height` (not `min-height`) to prevent CLS.

---

## Before marking a feature done

### 13. Acceptance criteria documented
- A task is done only when acceptance criteria were written before coding started. Verify the PR description or linked issue contains them.

### 14. YMYL methodology and disclaimer
- Any calculator or guide touching self-employment tax, quarterly estimates, or 1099 deductions is a YMYL page (financial domain).
- The page must link to the site's Methodology page and display the disclaimer: last-reviewed date, named author, AI-assistance disclosure.
- Fail if a new YMYL page is added without updating Methodology.

### 15. Rollback path documented
- Every deploy-affecting PR must document how to roll back: either a prior deployment URL on Cloudflare Pages or a `git revert` command.

### 16. New env vars documented
- Any new `VITE_*` or build-time env var must be added to `apps/web/.env.example` with a description comment.

---

## sahamo7-specific notes

- This project ports into `mainstreetnumbers.com` at `/self-employed/`. All canonical URLs, sitemap entries, and schema `url` fields must use the `mainstreetnumbers.com/self-employed/` prefix, not a standalone domain.
- sahamo8 hosts the root of mainstreetnumbers.com. Launch #1 is blocked until both sahamo7 and sahamo8 are ready. Do not deploy sahamo7 to production before sahamo8's root is live.
- npm workspaces, not pnpm. Always use `npm` commands; never `pnpm` or `yarn` in this repo.
- Zero Worker CPU on static pages. Cloudflare Pages free tier, no SSR. If a feature requires server logic, it belongs in sahamo8's `/api/*` Worker or is deferred.
