# Freelance Tax Toolkit

> Four free tax calculators for freelancers and 1099 workers — all powered by a rigorously tested TypeScript engine with 2026 IRS data.

**Status:** 🚧 In Development &nbsp;|&nbsp; **Domain:** [mainstreetnumbers.com/self-employed](https://mainstreetnumbers.com/self-employed)

---

## Why

Self-employed income is taxed differently — and more heavily — than W2 income, but most tax calculators treat both the same. A freelancer needs to know their self-employment tax, safe-harbor quarterly payments, whether an S-corp makes sense at their income level, and what hourly rate actually covers their take-home target. This toolkit answers all four questions with full transparency into the math.

## Calculators

| Tool | What it answers |
|------|----------------|
| **1099 vs W2 Comparator** | True after-tax take-home for contractor vs. employee at the same gross, with break-even contract rate |
| **Freelance Rate Calculator** | Minimum hourly rate to hit a target annual income after taxes, expenses, and benefits replacement |
| **Quarterly Tax Estimator** | Q1–Q4 estimated tax payments with safe-harbor rules (90% current year / 100–110% prior year) |
| **S-Corp Savings Estimator** | How much an S-corp election saves in self-employment tax, and the profit level where it breaks even |

## Tech

Built with Astro (static site) and a TypeScript tax engine (`packages/tax-engine`) with 97 Vitest tests covering 2026 IRS bracket data, SE tax, state flat rates, and safe-harbor calculation. Deployed on Cloudflare Pages.

## Contact

[freeiptvdotlife@gmail.com](mailto:freeiptvdotlife@gmail.com)
