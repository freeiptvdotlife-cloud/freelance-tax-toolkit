# Freelance Tax Toolkit (working title)

Self-Employment & Freelance Tax Suite — the winning niche from `docs/09-autonomous-deep-research.md`. Four client-side calculators (1099 vs W2, quarterly estimated tax, S-corp savings, freelance rate) sharing one TypeScript tax engine, deployed as an Astro static site (web) and an Expo/Capacitor-wrapped app with native AdMob (Android).

## Structure

- `packages/tax-engine/` — pure TypeScript calculation engine, no DOM/UI deps. Start here; this is the part that's actually built.
- `apps/web/` — Astro site (not yet built, Phase 2).
- `apps/android/` — native shell (not yet built, Phase 5).
- `data/keyword-research/` — real keyword/CPC exports; see its README for format.
- `scripts/` — Google Ads API OAuth + keyword-pull tooling.
- `docs/09-autonomous-deep-research.md` — the full spec: niche research, scoring, tool formulas, ad layout, SEO plan, phased checklist.

## Status

Phase 0/1 scaffolding in progress. Domain not yet chosen. See Section 13 (Open Questions) in the research doc for what's still blocking full build-out — most urgently: re-pulling keyword data with US geo-targeting confirmed, and verifying the placeholder Head-of-Household tax brackets and the partial state-tax table in `packages/tax-engine/src/data/` against real sources before any of this ships.

## Run tests

```bash
cd packages/tax-engine
npm test
```
