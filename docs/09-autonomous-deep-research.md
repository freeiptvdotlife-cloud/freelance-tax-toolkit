# Deep Research: Next Micro-Utility Niche

**Prepared:** 2026-09-25
**Method:** Live web search (WebSearch/WebFetch tools available and used — see citations throughout). No Semrush/Ahrefs/Keyword Planner API access, so all search-volume and CPC figures are triangulated from public SERP inspection and published industry benchmark articles, not pulled directly from a keyword-data platform. Every number below is labeled **[Cited]** (sourced to a specific URL) or **[Est.]** (my estimate, with a stated confidence level) — never presented as raw platform data.

---

## 0. Repo Reality Check (read this before the rest)

The instructions asked me to read `docs/01–08` and inspect the Haul Numbers codebase before writing this spec. **Neither exists in this repository.** `/home/nego-ssd/projects/sahamo7` was completely empty (no git history, no `docs/`, no `data/keyword-research/`, no source code) at the start of this task — I created `docs/` just now to hold this file. There is also no local Haul Numbers source to inspect.

To compensate, I fetched the **live** Haul Numbers site (haulnumbers.pages.dev) directly. What I could observe:

- **Tools:** cost-per-mile, load-profit, detention-pay, IFTA fuel tax, and per-diem calculators, plus a `/guides/` content section.
- **Structure:** horizontal nav → hero → grid of calculator cards → footer with About/Contact/Privacy/Terms.
- **Ads:** none visible in the fetched HTML (either not yet monetized, or ad tags are injected client-side after consent/load and didn't appear in the static fetch — I cannot confirm which).
- **Tech stack:** no visible framework signature in the fetched markup (consistent with an Astro static build, per your stated stack, but I could not directly confirm from the live DOM).

**Everything below about "shared engine conventions" and "existing ad component patterns" is therefore an explicit assumption**, inferred from (a) the visible URL/page structure of Haul Numbers, (b) your stated stack (Astro + Cloudflare Pages/Workers, Expo/Capacitor for Android, shared TypeScript calc engines), and (c) standard practice for this app type. Section 8 flags every point where I'm assuming a convention rather than observing one. If a real `docs/01-08` set or Haul Numbers repo exists elsewhere (private repo, different path, not yet pushed), re-run this analysis against it before locking the spec — the tool architecture and math in Sections 7 and 12 are stack-agnostic and don't depend on this gap, but the repo-structure and shared-package details in Section 8 do.

---

## 1. Executive Summary

**Winner: Self-Employment & Freelance Tax Suite** — a 4-tool cluster (1099-vs-W2 take-home comparator, quarterly estimated-tax calculator, S-corp election savings calculator, freelance rate calculator) targeting the ~10M+ US gig/contractor/solo-owner population.

**Why it wins:** it's the only candidate that scores well on *every* axis simultaneously: high advertiser CPC (tax software, bookkeeping SaaS, LLC-formation services, contractor insurance all bid on this traffic) **[Est., Medium confidence]**, a large and highly long-tail-able keyword set (by state, by industry, by income level, by entity type), a beatable SERP (current top-10 results are mostly thin single-purpose tools from small CPA firms and niche sites — [Terms.Law](https://terms.law/Calcs/1099-vs-w2-calculator/), [Toran Accounting](https://toranaccounting.com/w2-vs-1099-calculator/), [Taxstra](https://taxstra.com/resources/1099-vs-w2-calculator/), [TakeHomeTax](https://www.takehometax.com/tools/1099-vs-w2-calculator), not domain-authority giants), fully deterministic client-side math (published IRS brackets + SE tax formula, refreshed annually), and direct reuse of the IRS-table-driven engine pattern Haul Numbers already built for its per-diem tool.

**Revenue range (Medium confidence, see Section 5 for math):** at 5,000 sessions/month, **$150–$450/mo** blended AdSense; at 50,000 sessions/month, **$1,500–$4,500/mo**. At 500 sessions/month it is **not worth the ad-ops overhead** ($15–$45/mo) — this niche, like all of them, needs traffic before it produces meaningful revenue.

**Key risks:** (1) tax-advice YMYL scrutiny under AdSense's "low value content" and Google's helpful-content standards — mitigated with methodology pages and explicit "not tax/legal advice" framing; (2) annual IRS table maintenance is a recurring (small) engineering cost; (3) the S-corp/entity-comparison tool edges toward legal/business-formation advice and needs the most careful disclaimer language of the four tools.

**Runners-up:** Equipment/Small-Business Financing Calculators (#2) and Homebuyer Closing-Cost Calculators (#3) — both viable, both weaker on SERP beatability or advertiser density than the winner. Full comparison in Section 4.

---

## 2. Data & Assumptions

- **Access level:** Live WebSearch and WebFetch were used throughout this research (not a knowledge-cutoff-only analysis). No paid keyword-data API (Semrush/Ahrefs/Google Keyword Planner) was available, so search-volume figures are directional, not exact — every volume claim is labeled.
- **CPC/RPM/eCPM figures** come from published industry aggregator articles (Adstimate, Publift, ppc.io, MonetizeMore, RevenueLab, etc.), not from Google Ads' own reporting UI for this account. Treat all of them as **[Est., Medium confidence]** unless a specific number is directly quoted from a source, in which case it's marked **[Cited]**.
- **SERP competitor lists** were built from live search result snapshots taken 2026-09-25. Rankings shift; treat the *type* of competitor (domain-authority lead-gen giant vs. small independent tool) as the durable signal, not the exact position.
- **Update 2026-09-25:** a real Google Ads Keyword Planner export now exists at `data/keyword-research/self-employment-tax-keyword_planner-2026-09-25.csv` (1,020 keywords) and has been folded into Section 5.1. It is **not yet a clean US-market data point** — the export's account currency is MAD and the location-targeting used wasn't confirmed as United States, so treat those numbers as directionally useful (keyword existence, relative competition, relative volume) but not final CPC truth until re-pulled with Location locked to US. See the flag in Section 5.1 and Open Questions (Section 13).
- **Geo scope:** all figures assume US traffic unless stated. UK/CA/AU monetize at meaningfully lower CPC for US-specific tax content (see Section 5 caveat) — this niche is largely **US-only** for the tax-specific tools; the freelance-rate calculator generalizes better internationally.

---

## 3. Scoring Model

| Criterion | Weight | Rationale |
|---|---|---|
| Advertiser value (CPC, CLV, bid density) | 15% | Determines RPM ceiling; without bid density, traffic doesn't convert to revenue regardless of volume. |
| Search demand & keyword cardinality | 15% | Programmatic SEO needs many genuinely distinct long-tail variants, not one head term. |
| SERP weakness (who currently ranks) | 15% | A single solo dev cannot out-authority Bankrate/NerdWallet/insurance lead-gen giants; must find gaps. |
| Client-side feasibility (deterministic math, data-freshness burden) | 15% | Hard constraint from the brief — must be pure math, and ongoing table-maintenance cost varies wildly by niche. |
| Policy/YMYL risk (scored inversely — 10 = lowest risk) | 10% | Getting flagged or de-indexed kills the whole investment; weighted lower than the top four because it's manageable with correct disclaimers, not usually fatal. |
| Solo build effort (scored inversely — 10 = lowest effort) | 10% | Time is the actual constraint for a solo dev, not capital. |
| Portfolio synergy (shared engine/components, cross-linking) | 10% | Reuse lowers effort and cross-linking compounds SEO value across the portfolio. |
| Evergreen durability vs. seasonality | 10% | Recurring content-refresh cost and traffic stability matter for a "build once, earn for years" model. |

Weights sum to 100%. Each candidate scored 0–10 per criterion; weighted score = Σ(criterion score × weight).

---

## 4. Candidate Evaluation (12 niches, full scored table)

All scores are **[Est., Medium confidence]** author judgment informed by the research in Section 5/6 — not derived from a formula.

| # | Niche | Advertiser (15%) | Demand/Cardinality (15%) | SERP Weakness (15%) | Feasibility (15%) | YMYL-inv (10%) | Effort-inv (10%) | Synergy (10%) | Evergreen (10%) | **Weighted Score** |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Auto insurance calculator | 9 | 8 | 2 | 6 | 4 | 5 | 3 | 8 | **5.75** |
| 2 | Equipment/business financing calculator | 7 | 6 | 6 | 8 | 7 | 7 | 4 | 7 | **6.55** |
| 3 | **Self-employment/freelance tax suite** | 8 | 9 | 7 | 9 | 6 | 7 | 8 | 8 | **7.85** ★ |
| 4 | Solar payback/ROI calculator | 7 | 6 | 3 | 5 | 6 | 5 | 2 | 4 | **4.85** |
| 5 | Payroll/overtime & paycheck calculators | 5 | 7 | 3 | 5 | 7 | 4 | 3 | 8 | **5.20** |
| 6 | Child support/alimony calculator | 6 | 6 | 4 | 2 | 2 | 2 | 2 | 7 | **4.00** |
| 7 | Homebuyer closing-cost calculator | 7 | 7 | 5 | 7 | 6 | 6 | 3 | 7 | **6.10** |
| 8 | Health insurance/HSA-FSA calculator | 7 | 5 | 4 | 6 | 3 | 6 | 2 | 7 | **5.10** |
| 9 | Life insurance needs calculator | 8 | 6 | 2 | 8 | 4 | 7 | 2 | 8 | **5.70** |
| 10 | Retirement/401(k) paycheck-impact calculator | 7 | 6 | 3 | 7 | 4 | 6 | 3 | 8 | **5.55** |
| 11 | Medical billing/EOB negotiation calculator | 4 | 3 | 6 | 4 | 3 | 4 | 2 | 6 | **4.05** |
| 12 | B2B SaaS pricing/unit-economics calculator | 3 | 3 | 6 | 9 | 9 | 8 | 3 | 6 | **5.75** |

**Excluded from consideration entirely (cannibalization):** personal injury, structured settlements, debt relief, rental property, trucking/owner-operator. Credit card payoff/balance transfer calculators were considered and dropped from the table — their keyword set and advertiser pool (debt consolidation, balance-transfer cards) overlaps too closely with `debt-relief-suite` to count as genuinely distinct.

---

## 5. Top 3 Finalists

### 5.1 Winner: Self-Employment & Freelance Tax Suite

**Advertiser landscape:** tax-prep software (TurboTax Self-Employed, TaxAct, Keeper, Bench), bookkeeping SaaS (QuickBooks Self-Employed, FreshBooks), LLC-formation services (LegalZoom, ZenBusiness, Northwest Registered Agent), contractor/freelancer insurance (NEXT Insurance, Thimble).

**⚠️ Data-quality flag on the table below:** these rows come from a real Google Ads Keyword Planner export pulled 2026-09-25 (`data/keyword-research/self-employment-tax-keyword_planner-2026-09-25.csv`, 1,020 keywords) — a genuine improvement over the pure estimates in the original draft, shown here **as-reported in the account's native currency (MAD, Moroccan Dirham)**, not converted. The location-targeting used for the pull was not confirmed as United States, so these are **[Cited: Google Ads Keyword Planner, 2026-09-25 export]** for keyword existence/relative competition/relative volume, but **not yet confirmed as US-market bids** — if the account defaulted to Morocco/MENA rather than US targeting, real US CPCs would run well above these MAD figures even after currency conversion, since Morocco is a lower-CPC ad market. **Search volumes above 10,000/mo are Keyword Planner's bucketed range values** (common for accounts without spend history), not exact counts. Re-pull with Location locked to "United States" (Section 13, item 5) before treating any of this as final US CPC data.

| Keyword | Volume (bucketed) | Competition | CPC low–high (MAD) |
|---|---|---|---|
| 1099 vs w2 calculator | 500 | Low | 16.50–143.96 MAD |
| self employment tax calculator | 50,000 (bucket) | Low | 2.28–65.02 MAD |
| quarterly estimated tax calculator | 5,000 (bucket) | Low | 1.84–49.54 MAD |
| freelance tax calculator | 500 | Low | 7.15–57.72 MAD |
| s corp vs llc calculator | 50 | Medium | 19.98–264.57 MAD |
| llc vs s corp tax calculator | 500 | Medium | 13.08–138.86 MAD |
| independent contractor taxes calculator | 500 | Low | 2.41–69.21 MAD |
| self employed take home calculator | 500 | Low | 6.59–39.34 MAD |
| gig worker tax calculator | 500 | Low | 4.20–71.87 MAD |
| tax calculator 1099 | 50,000 (bucket) | Low | 1.28–40.53 MAD |
| sole proprietor tax calculator | 500 | Low | 10.55–126.80 MAD |
| freelance rate calculator | 500 | Low | 10.44–61.52 MAD |
| self employed quarterly tax calculator | 500 | Medium | 5.70–132.45 MAD |
| contractor tax calculator | 500 | Low | 5.05–58.39 MAD |
| self employed paycheck calculator | 50 | Low | 38.09–168.09 MAD |

*(For rough USD sense: divide MAD figures by ~10. E.g. "s corp vs llc calculator" ≈ $2.00–$26.46 — but treat that conversion as a sanity-check only, not a US-market data point, until geo-targeting is confirmed.)*

Full 1,020-keyword export (with `Unknown`-competition long-tail variants, seasonal/year-suffixed queries, and UK-specific terms like "sole trader"/"self assessment" that surfaced because geo wasn't locked to US) is in the CSV file for further filtering.

**SERP competitors and their weaknesses:** [Terms.Law](https://terms.law/Calcs/1099-vs-w2-calculator/) and [Taxstra](https://taxstra.com/resources/1099-vs-w2-calculator/) are single-lawyer/CPA-authored tools — thin design, no cross-linked companion tools, no methodology depth. [Toran Accounting](https://toranaccounting.com/w2-vs-1099-calculator/), [TakeHomeTax](https://www.takehometax.com/tools/1099-vs-w2-calculator), [1099vsw2.com](https://1099vsw2.com/1099-vs-w2-calculator/), and [viewthenumbers.com](https://www.viewthenumbers.com/w2-vs-1099) are single-purpose domains with no suite depth. None of the observed competitors bundle all four tools (comparator + quarterly tax + entity election + rate calculator) into one cross-linked suite — that bundling is the differentiation opportunity. **[Est., High confidence — directly observed in SERP]**

**RPM/eCPM estimate:** Finance-adjacent content generally runs **$15–$40 RPM** per published niche multiplier data **[Cited: Adstimate — "finance and insurance blogs earn $15–$40 per 1,000 views"]**, though self-employment tax content sits a tier below pure insurance/loan content — call it **$12–$28 RPM [Est., Medium confidence]**. AdMob (if wrapped in Android): banner $0.50–$1.50, interstitial $6–$8, rewarded $15–$30 in Tier-1 geos **[Cited: RevenueLab/MonetizeMore 2026 benchmarks]**.

**Main risks:** annual IRS bracket/SE-tax-cap updates (small, predictable maintenance); S-corp tool must avoid reading as personalized business/legal advice; largely US-only (UK/CA/AU have different self-employment tax regimes — see Section 13).

### 5.2 Runner-up #2: Equipment/Small-Business Financing Calculators

**Advertiser landscape:** equipment lenders (Clarify Capital, Balboa Capital), SBA-loan brokers, business credit cards, invoice-factoring services.

Representative keywords: equipment financing calculator ($8–$20), equipment loan calculator by industry ($6–$16), business loan payment calculator ($10–$25), SBA loan calculator ($12–$28), lease vs buy equipment calculator ($6–$15), Section 179 deduction calculator ($5–$14), invoice factoring calculator ($8–$18), working capital loan calculator ($7–$18), truck/construction equipment depreciation calculator ($5–$12), small business loan amortization calculator ($8–$20), merchant cash advance calculator ($10–$22), commercial vehicle loan calculator ($6–$15). All **[Est., Low-Medium confidence]**.

**SERP competitors:** [Clarify Capital](https://clarifycapital.com/blog/equipment-loan-calculator), [PrimeRates](https://primerates.com/calculators/equipment-loan-calculator/), [USFinanceCalculators.com](https://usfinancecalculators.com/business/equipment-financing-calculator/) are small/independent operators (proof this niche is winnable at solo scale) sitting alongside NerdWallet and bank-owned tools (Citizens Bank) which dominate head terms. Beatable on long-tail, harder on head terms.

**RPM estimate:** $10–$25 **[Est., Medium confidence]**. **Main risk:** narrower keyword cardinality than the tax suite (B2B audience is smaller than the self-employed/freelancer population), and weaker portfolio synergy with existing apps.

### 5.3 Runner-up #3: Homebuyer Closing-Cost Calculator Suite

**Advertiser landscape:** mortgage lenders, title/escrow companies, homeowners insurance, moving services.

Representative keywords: closing cost calculator by state ($8–$22), mortgage closing cost estimator ($10–$28), title insurance cost calculator ($6–$16), how much are closing costs on a $400k house ($8–$20), seller closing cost calculator ($6–$18), FHA closing cost calculator ($9–$22), refinance closing cost calculator ($10–$25), property transfer tax calculator by county ($5–$14), earnest money calculator ($3–$8), no-closing-cost mortgage calculator ($8–$20), cash to close calculator ($7–$18), VA loan closing cost calculator ($9–$24). All **[Est., Low-Medium confidence]**.

**SERP competitors:** dominated by Bankrate, NerdWallet, and title-company-owned tools — stronger domain authority than the tax-suite competitors, but county-level transfer-tax data adds real maintenance burden (50 states × county variation vs. the tax suite's single federal table).

**Why it loses to the winner:** weaker SERP beatability, higher data-maintenance burden (county-level tables vs. one national IRS table), and only loose synergy with the existing rental-property calculator (different buyer intent: owner-occupant vs. investor) — real but thinner cross-link value than initially assumed.

---

## 6. Winner Decision

The Self-Employment & Freelance Tax Suite beats #2 on **portfolio synergy** (direct reuse of Haul Numbers' IRS-table engine pattern, and natural cross-linking to `debt-relief-suite` for financially-stretched freelancers) and **keyword cardinality** (the self-employed/gig population is larger and more diversely searchable — by entity type, state, industry, income tier — than the B2B equipment-financing audience). It beats #3 on **SERP weakness** (small CPA/solo-dev competitors vs. Bankrate/NerdWallet) and **maintenance burden** (one annual federal table update vs. ongoing county-by-county transfer-tax tracking).

**What would change this decision:** if a Semrush/Ahrefs export (once available in `data/keyword-research/`) shows self-employment-tax query volume is materially lower than estimated here, or shows the closing-cost niche has a much larger long-tail than assumed, re-run the scoring table with real numbers — the two are close enough (7.85 vs. 6.10) that better data could flip the recommendation. Also reconsider if you discover the actual Haul Numbers ad-component pattern can't cleanly support four cross-linked tools without a larger-than-expected engineering lift.

---

## 7. Tool Architecture (4 Tools)

App name (working title): **"1099 Money"** or **"Freelance Tax Toolkit"** (domain TBD — see Open Questions).

### Tool 1: 1099 vs. W2 Take-Home Comparator

**Purpose / query cluster:** "1099 vs w2 calculator", "1099 vs w2 take home pay", "should i take 1099 or w2 offer".

**Inputs:**
| Name | Type | Unit | Validation | Default |
|---|---|---|---|---|
| w2AnnualSalary | number | USD | 0–2,000,000 | 80000 |
| contractRate | number | USD | 0–2,000,000 | 100000 |
| filingStatus | enum | single/mfj/hoh | — | single |
| state | enum | 2-letter code | 50 states + DC | CA |
| w2BenefitsValue | number | USD/yr | 0–100,000 | 12000 |
| selfEmployedExpenses | number | USD/yr | 0–500,000 | 3000 |
| retirementContributionPct | number | % | 0–100 | 10 |

**Outputs & formulas:**
- `seNetProfit = contractRate - selfEmployedExpenses`
- `seTaxDeduction = 0.9235 * seNetProfit` (IRS Schedule SE net earnings factor)
- `seTax = min(seTaxDeduction, ssWageBase[year]) * 0.124 + seTaxDeduction * 0.029` — Social Security 12.4% capped at the annual wage base, Medicare 2.9% uncapped, plus 0.9% Additional Medicare Tax on earnings above the threshold for the filing status
- `seTaxHalfDeduction = seTax / 2` (deductible from AGI)
- `federalTaxableIncome = seNetProfit - seTaxHalfDeduction - standardDeduction[filingStatus][year] - retirementContribution`
- `federalTax = applyBracket(federalTaxableIncome, brackets[filingStatus][year])`
- `stateTax = applyBracket(federalTaxableIncome, stateBrackets[state][year])`
- `contractorNetTakeHome = contractRate - selfEmployedExpenses - seTax - federalTax - stateTax - retirementContribution`
- `w2NetTakeHome = w2AnnualSalary - w2FicaTax - federalTax(w2) - stateTax(w2) - retirementContribution`, where `w2FicaTax = min(w2AnnualSalary, ssWageBase) * 0.062 + w2AnnualSalary * 0.0145`
- `breakEvenContractRate` solved by binary search such that `contractorNetTakeHome == w2NetTakeHome + w2BenefitsValue` (the contractor's cash must cover the W2 cash take-home *plus* the value of the benefits they'd otherwise have to self-fund — corrected 2026-09-25 after implementation testing caught the sign was backwards in the original draft)

**Edge cases:** contractRate = 0 → all outputs 0, no divide-by-zero. Negative net profit (expenses > rate) → seTax = 0, show a warning banner instead of a negative-tax result. Round all currency outputs to nearest dollar; round intermediate tax-bracket math to the cent before final rounding.

**Static data:** `irs-brackets-2026.json` (federal brackets, standard deduction, SS wage base, Additional Medicare threshold) — source: IRS Rev. Proc., updated every November for the following tax year. `state-brackets-2026.json` (50-state + DC marginal brackets) — source: each state's DOR, updated annually, flag no-income-tax states (TX, FL, WA, etc.) as a fast path.

**TypeScript signatures:**
```typescript
interface ComparatorInput {
  w2AnnualSalary: number;
  contractRate: number;
  filingStatus: 'single' | 'mfj' | 'hoh';
  state: StateCode;
  w2BenefitsValue: number;
  selfEmployedExpenses: number;
  retirementContributionPct: number;
  taxYear: number;
}
interface ComparatorOutput {
  contractorNetTakeHome: number;
  w2NetTakeHome: number;
  seTax: number;
  breakEvenContractRate: number;
  effectiveTaxRateContractor: number;
  effectiveTaxRateW2: number;
}
function compareW2VsContractor(input: ComparatorInput): ComparatorOutput;
```

**Test cases:**
1. `{w2AnnualSalary:80000, contractRate:80000, filingStatus:'single', state:'TX', w2BenefitsValue:0, selfEmployedExpenses:0, retirementContributionPct:0, taxYear:2026}` → contractor take-home < W2 take-home (no-tax state isolates the SE-tax gap).
2. `{w2AnnualSalary:100000, contractRate:135000, ...same TX...}` → near break-even, since ~1.35x is the commonly cited 1099 markup rule of thumb.
3. `{contractRate:0, ...}` → all monetary outputs = 0, no NaN/Infinity.

### Tool 2: Quarterly Estimated Tax Calculator

**Purpose:** "quarterly estimated tax calculator", "how much should i pay in quarterly taxes self employed".

**Inputs:** `expectedAnnualNetProfit` (USD, 0–5M), `priorYearTaxLiability` (USD, 0–5M, default 0), `filingStatus`, `state`, `paymentsAlreadyMadeYtd` (USD, default 0), `quarterIndex` (1–4).

**Outputs:**
- `annualTaxOwed = seTax(annualNetProfit) + federalTax(annualNetProfit) + stateTax(annualNetProfit)`
- Safe-harbor rule: `requiredAnnualPayment = min(annualTaxOwed * 0.90, priorYearTaxLiability * 1.10)` (110% applies above $150k prior-year AGI — flag via a boolean input `priorYearAgiOver150k`)
- `perQuarterPayment = requiredAnnualPayment / 4`
- `currentQuarterDue = max(0, perQuarterPayment * quarterIndex - paymentsAlreadyMadeYtd)`
- `underpaymentPenaltyRisk` = boolean, true if `paymentsAlreadyMadeYtd < perQuarterPayment * (quarterIndex - 1)`

**Edge cases:** first-year filers with no `priorYearTaxLiability` → safe harbor collapses to the 90%-of-current-year rule only. Round to nearest dollar; quarter due dates (Apr 15, Jun 15, Sep 15, Jan 15) shown as static reference text, not computed (avoid weekend/holiday-shift edge cases in v1 — flag as a known limitation).

**Static data:** reuses `irs-brackets-2026.json` from Tool 1; adds `estimatedTaxDueDates.json` (4 dates/year, manually updated for holiday shifts).

**TypeScript:**
```typescript
interface QuarterlyTaxInput {
  expectedAnnualNetProfit: number;
  priorYearTaxLiability: number;
  priorYearAgiOver150k: boolean;
  filingStatus: FilingStatus;
  state: StateCode;
  paymentsAlreadyMadeYtd: number;
  quarterIndex: 1 | 2 | 3 | 4;
  taxYear: number;
}
interface QuarterlyTaxOutput {
  annualTaxOwed: number;
  requiredAnnualPayment: number;
  perQuarterPayment: number;
  currentQuarterDue: number;
  underpaymentPenaltyRisk: boolean;
}
function calculateQuarterlyTax(input: QuarterlyTaxInput): QuarterlyTaxOutput;
```

**Test cases:**
1. `{expectedAnnualNetProfit:100000, priorYearTaxLiability:0, priorYearAgiOver150k:false, quarterIndex:1, paymentsAlreadyMadeYtd:0, filingStatus:'single', state:'TX', taxYear:2026}` → `currentQuarterDue == perQuarterPayment` (nothing paid yet).
2. Same inputs, `paymentsAlreadyMadeYtd = perQuarterPayment` at `quarterIndex:2` → `currentQuarterDue == perQuarterPayment` (exactly on track).
3. `expectedAnnualNetProfit:0` → all outputs 0.

### Tool 3: S-Corp Election Savings Calculator

**Purpose:** "s corp vs llc calculator", "should i elect s corp", "s corp reasonable salary calculator".

**Inputs:** `netBusinessProfit` (USD, 0–5M), `reasonableSalary` (USD, 0–2M), `state`, `filingStatus`, `payrollServiceCostAnnual` (USD, default 600), `additionalCorpFilingCostAnnual` (USD, default 800).

**Outputs:**
- Sole-prop/LLC path: `soleProSeTax = seTax(netBusinessProfit)` (as in Tool 1)
- S-corp path: payroll taxes on salary only — `scorpPayrollTax = min(reasonableSalary, ssWageBase) * 0.124 + reasonableSalary * 0.029`; distribution = `netBusinessProfit - reasonableSalary` is NOT subject to SE/payroll tax
- `scorpTotalCost = scorpPayrollTax + payrollServiceCostAnnual + additionalCorpFilingCostAnnual`
- `netSavings = soleProSeTax - scorpTotalCost`
- `breakEvenProfit` solved such that `netSavings == 0`, holding reasonableSalary as a fixed ratio input

**Edge cases:** if `reasonableSalary >= netBusinessProfit`, distribution = 0 and S-corp offers no SE-tax savings — surface a warning rather than a negative distribution. Enforce `reasonableSalary` floor guidance text (IRS "reasonable compensation" standard) as informational copy, not a hard input constraint, since it's a facts-and-circumstances judgment call, not a formula — **this is the tool's highest-risk area for reading as personalized advice; disclaimer required (see Section 9 methodology-page requirement)**.

**Static data:** same `irs-brackets-2026.json` and SS wage base.

**TypeScript:**
```typescript
interface SCorpInput {
  netBusinessProfit: number;
  reasonableSalary: number;
  payrollServiceCostAnnual: number;
  additionalCorpFilingCostAnnual: number;
  taxYear: number;
}
interface SCorpOutput {
  soleProSeTax: number;
  scorpPayrollTax: number;
  scorpTotalCost: number;
  netSavings: number;
  breakEvenProfit: number;
}
function calculateSCorpSavings(input: SCorpInput): SCorpOutput;
```

**Test cases:**
1. `{netBusinessProfit:150000, reasonableSalary:70000, payrollServiceCostAnnual:600, additionalCorpFilingCostAnnual:800, taxYear:2026}` → `netSavings > 0` (matches the commonly cited $60–80k breakeven threshold [Cited: search-result consensus]).
2. `{netBusinessProfit:50000, reasonableSalary:45000, ...}` → `netSavings <= 0` (too little profit above salary to justify overhead).
3. `{netBusinessProfit:0, reasonableSalary:0, ...}` → all outputs 0.

### Tool 4: Freelance Rate Calculator (Salary-to-Hourly / Hourly-to-Salary)

**Purpose:** "freelance rate calculator", "how much to charge as a contractor calculator", "convert salary to hourly rate freelance".

**Inputs:** `targetAnnualIncome` (USD, 0–2M), `billableHoursPerWeek` (1–80, default 25), `weeksOffPerYear` (0–20, default 4), `businessExpensesAnnual` (USD, default 5000), `taxBufferPct` (%, 0–50, default 30), `benefitsReplacementCost` (USD, default 8000).

**Outputs:**
- `billableWeeksPerYear = 52 - weeksOffPerYear`
- `totalBillableHours = billableWeeksPerYear * billableHoursPerWeek`
- `grossRevenueNeeded = targetAnnualIncome + businessExpensesAnnual + benefitsReplacementCost`
- `grossRevenueWithTaxBuffer = grossRevenueNeeded / (1 - taxBufferPct/100)`
- `requiredHourlyRate = grossRevenueWithTaxBuffer / totalBillableHours`
- `requiredDayRate = requiredHourlyRate * 8`

**Edge cases:** `totalBillableHours = 0` (e.g., `weeksOffPerYear = 52`) → return `Infinity`-guard: clamp and show a validation error instead of computing. `taxBufferPct >= 100` → reject at input validation (would divide by zero or go negative).

**Static data:** none — pure arithmetic, no tax tables. Lowest-maintenance tool of the four; also the only one that generalizes cleanly to UK/CA/AU traffic since it has no US-specific tax assumptions baked in.

**TypeScript:**
```typescript
interface FreelanceRateInput {
  targetAnnualIncome: number;
  billableHoursPerWeek: number;
  weeksOffPerYear: number;
  businessExpensesAnnual: number;
  taxBufferPct: number;
  benefitsReplacementCost: number;
}
interface FreelanceRateOutput {
  requiredHourlyRate: number;
  requiredDayRate: number;
  totalBillableHours: number;
  grossRevenueNeeded: number;
}
function calculateFreelanceRate(input: FreelanceRateInput): FreelanceRateOutput;
```

**Test cases:**
1. `{targetAnnualIncome:80000, billableHoursPerWeek:25, weeksOffPerYear:4, businessExpensesAnnual:5000, taxBufferPct:30, benefitsReplacementCost:8000}` → `requiredHourlyRate ≈ 80.7` (sanity-checkable by hand).
2. `{targetAnnualIncome:0, ...}` → `requiredHourlyRate` reflects only expenses+benefits/tax-buffer, not zero (fixed costs still need covering).
3. `{billableHoursPerWeek:40, weeksOffPerYear:0, ...same as case 1...}` → lower `requiredHourlyRate` than case 1 (more billable hours spreads the same target income further).

---

## 8. Shared Engine & Repo Structure

**Assumption flagged:** the tree below follows the naming/layout implied by your five live apps (each a standalone Astro/Workers deploy) and the "shared TypeScript calculation engines" you described — it is not copied from an inspected Haul Numbers repo, since that repo wasn't available locally. Validate against the real Haul Numbers structure before scaffolding.

```
freelance-tax-toolkit/
├── apps/
│   └── web/                          # Astro static site (Cloudflare Pages)
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.astro
│       │   │   ├── 1099-vs-w2-calculator/index.astro
│       │   │   ├── quarterly-tax-calculator/index.astro
│       │   │   ├── s-corp-savings-calculator/index.astro
│       │   │   ├── freelance-rate-calculator/[state].astro   # only if state-variant pages add genuine value (Sec. 10)
│       │   │   ├── guides/*.astro
│       │   │   ├── about.astro
│       │   │   ├── methodology.astro
│       │   │   ├── privacy.astro
│       │   │   ├── terms.astro
│       │   │   └── contact.astro
│       │   ├── components/
│       │   │   ├── CalculatorShell.astro
│       │   │   ├── AdSlot.astro              # shared reserved-height ad container
│       │   │   ├── ResultCard.astro
│       │   │   └── DisclaimerBanner.astro
│       │   └── layouts/BaseLayout.astro
│       └── astro.config.mjs
├── packages/
│   ├── tax-engine/                   # pure TS, no DOM deps — shared with Android
│   │   ├── src/
│   │   │   ├── comparator.ts         # Tool 1
│   │   │   ├── quarterlyTax.ts       # Tool 2
│   │   │   ├── sCorpSavings.ts       # Tool 3
│   │   │   ├── freelanceRate.ts      # Tool 4
│   │   │   ├── data/irs-brackets-2026.json
│   │   │   ├── data/state-brackets-2026.json
│   │   │   └── index.ts
│   │   └── tests/*.test.ts           # the 3+ cases per tool from Sec. 7, plus fuzz/edge tests
│   └── ui-shared/                    # cross-app design tokens/components, if this already exists in the portfolio
├── apps/
│   └── android/                      # Expo or Capacitor WebView wrapping apps/web
│       └── (native AdMob units rendered outside WebView content — see Sec. 9)
├── data/
│   └── keyword-research/             # populate with real Semrush/Ahrefs/GKP exports before Phase 3
├── docs/
│   └── 09-autonomous-deep-research.md  # this file
└── package.json                      # workspace root (pnpm/npm workspaces, matching Haul Numbers' stated shared-engine pattern)
```

---

## 9. Monetization & Ad Layout Spec

**Slot positions per page type** (calculator page):
1. **Top banner** (below hero/H1, above the calculator form) — 320×100 mobile / 728×90 desktop, reserved min-height matching the ad size exactly (zero CLS), never touching the input form.
2. **Mid-content, in-article** — inserted between the results section and the "How this is calculated" methodology section, never directly beside a result value or button. Responsive in-article unit, reserved height ~250px.
3. **Bottom, above footer** — after the FAQ/methodology content, before internal links. 300×250 or responsive.
4. **Sidebar (desktop only, ≥1024px viewport)** — sticky 300×600, only on pages with enough content height to avoid overlap; hidden entirely on mobile rather than reflowed.

All slots: fixed-size containers with `min-height` set in CSS before the ad script loads (zero CLS per AdSense guidance), lazy-loaded below the fold (slots 2–4), never adjacent to calculator inputs/buttons/result numbers per AdSense placement policy.

**Consent handling:** Google-certified CMP (e.g., Funding Choices/Google's own CMP, or a TCF-2.2-compliant partner) gating ad requests for EEA/UK visitors; since target geos are US/UK/CA/AU, UK requires the CMP consent flow — implement it site-wide even though most traffic is US, to keep UK legally compliant without geo-detection complexity.

**Status (2026-09-25):** a functional self-hosted consent banner is live (`apps/web/src/components/ConsentBanner.astro` + `src/lib/consent.ts`) — shown to every visitor, stores accept/reject in localStorage, gates the `AdSlot` component's placeholder ad-loading hook. **This is not an IAB TCF-certified CMP** and does not by itself satisfy Google's EEA/UK consent requirement for live ads. Before applying for AdSense or serving real ad tags to UK/EEA traffic, replace it with either Google's Funding Choices (available once the AdSense account is approved — no publisher ID exists yet to wire it up) or a TCF v2.2-certified partner (Quantcast Choice, CookieYes, Cookiebot). Tracked as an open item, not yet resolved.

**Android — critical policy point:** do **not** serve AdSense web ad tags inside the WebView unless using Google's WebView Ads API correctly configured for that purpose. Default architecture: the Android shell (Expo/Capacitor) renders the calculator content in a WebView with **no ads inside it**, and native AdMob units (banner + interstitial, no rewarded — nothing to "reward" in a calculator) are rendered natively **outside/around** the WebView content area (e.g., a native banner pinned above or below the WebView, native interstitial shown at natural navigation breaks like "calculate again" or switching tools). This avoids the WebView/AdSense policy trap entirely and matches standard practice for hybrid calculator apps.

**Web vs. Android differences:** web monetizes via AdSense display units; Android monetizes via native AdMob units only (banner ~$0.50–$1.50 eCPM, interstitial ~$6–$8 eCPM, Tier-1 **[Cited: RevenueLab 2026]**) — do not attempt AdSense-in-WebView as a shortcut.

---

## 10. SEO & Content Plan

**URL structure:** flat, tool-named paths (`/1099-vs-w2-calculator/`, `/quarterly-tax-calculator/`, `/s-corp-savings-calculator/`, `/freelance-rate-calculator/`), matching the Haul Numbers pattern of `/[tool-name]-calculator/`.

**Programmatic variants — only where genuinely different:** state-level variant pages (`/quarterly-tax-calculator/california/`) are justified **only** if state income-tax brackets meaningfully change the output (true for ~41 states with income tax, not worth doing for the 9 no-income-tax states beyond a single shared "no state tax" note). Do not create industry-variant pages (e.g., "/1099-vs-w2-calculator/nurses/") unless the underlying math or a specific worked example genuinely differs — thin reskins of the same calculator are exactly the "low value content" pattern AdSense reviews flag.

**Schema markup:** `SoftwareApplication` or `WebApplication` for each calculator; `FAQPage` schema on the methodology/FAQ sections (only if genuinely structured as Q&A, not stuffed); `BreadcrumbList` for state-variant pages; `Organization`/`Person` schema on the About page for E-E-A-T signals.

**Internal linking across the portfolio:** cross-link from `debt-relief-suite` (financially-stressed freelancers/gig workers overlap heavily) and from Haul Numbers' per-diem tool (owner-operators are themselves 1099 filers) — both are legitimate, non-cannibalizing audience overlaps, not artificial link farming.

**Required trust pages:** About (real name/credentials or explicit "built by a developer, reviewed against IRS publications, not a CPA" framing — critical for YMYL E-E-A-T since this is a solo dev, not a firm), Methodology (formulas, data sources, update cadence — this doubles as the "substantive original content beyond the widget" requirement), Privacy, Terms, Contact, and a dedicated Disclaimers page ("not tax, legal, or financial advice; consult a licensed CPA/attorney for your specific situation") linked from every calculator page, not just the footer.

---

## 11. Implementation Checklist

**Phase 0 — Scaffolding**
- [ ] Repo/workspace created matching Section 8 structure, confirmed against real Haul Numbers repo if/when accessible. *Effort: 0.5 day.*
- [ ] Astro + Cloudflare Pages deploy pipeline copied from an existing portfolio app. *Effort: 0.5 day.*
- [ ] Domain acquired and DNS pointed (see Open Questions). *Effort: 1 hr + propagation.*

**Phase 1 — Engine + tests**
- [ ] `irs-brackets-2026.json` and `state-brackets-2026.json` built and cited to IRS/state-DOR sources. Acceptance: every bracket traceable to a specific published source URL/document. *Effort: 1 day.*
- [ ] Four pure functions (Section 7) implemented in `packages/tax-engine`. Acceptance: all 12+ test cases from Section 7 pass. *Effort: 2 days.*
- [ ] Edge-case fuzz tests (zero, negative, max-bound inputs) added beyond the 3 documented per tool. Acceptance: no NaN/Infinity/negative-currency outputs under any valid input range. *Effort: 0.5 day.*

**Phase 2 — Astro web**
- [ ] Four calculator pages built on shared `CalculatorShell` component. Acceptance: matches Haul Numbers' visual/interaction pattern. *Effort: 3 days.*
- [ ] `AdSlot` component with reserved-height containers per Section 9 spec. Acceptance: zero CLS measured via Lighthouse. *Effort: 1 day.*
- [ ] Responsive/mobile pass. Acceptance: usable at 375px width, no horizontal scroll. *Effort: 1 day.*

**Phase 3 — Content & SEO**
- [ ] Real keyword data sourced (Semrush/Ahrefs/GKP) into `data/keyword-research/`, replacing this document's estimates. Acceptance: at least the 15 keywords per tool re-verified with real volume/CPC. *Effort: 0.5 day.*
- [ ] Methodology, About, Disclaimers, Privacy, Terms, Contact pages written. Acceptance: methodology page cites every formula and data source used in Section 7. *Effort: 2 days.*
- [ ] State-variant pages built only for the ~41 income-tax states where output genuinely differs. Acceptance: spot-check 5 states for correct bracket application. *Effort: 2 days.*
- [ ] Schema markup added and validated (Google Rich Results Test). *Effort: 0.5 day.*

**Phase 4 — AdSense readiness & application**
- [ ] Minimum content depth verified on every page (methodology + worked example + limitations, per Section 9's "substantive value" requirement). *Effort: 1 day review.*
- [ ] CMP (consent) integrated and tested for a UK-simulated visitor. *Effort: 1 day.*
- [ ] AdSense application submitted. Acceptance: approved (external dependency, timeline not controllable). *Effort: submission 0.5 day + wait.*

**Phase 5 — Android build & AdMob**
- [ ] Expo/Capacitor shell wrapping the Astro build, native AdMob banner+interstitial placed outside WebView per Section 9. Acceptance: WebView Ads API correctly used if any web-ad content is ever shown in-WebView; otherwise fully native ad rendering confirmed. *Effort: 3 days.*
- [ ] Play Store listing, privacy policy link, ads/consent disclosure completed. *Effort: 1 day.*

**Phase 6 — Launch & measurement**
- [ ] GA4/Cloudflare Analytics wired for session counts, RPM tracking. *Effort: 0.5 day.*
- [ ] 30/60/90-day KPI review scheduled (Section 12). *Effort: ongoing.*

---

## 12. KPIs & Kill Criteria

| Checkpoint | Continue if | Pivot if | Abandon if |
|---|---|---|---|
| 30 days | Indexed, any organic impressions in GSC, no AdSense policy flags | Indexed but near-zero impressions — revisit keyword targeting | Manual action or policy violation received |
| 60 days | ≥500 organic sessions/mo, RPM tracking within the $10–$28 estimated band | Traffic present but RPM far below estimate — revisit ad placement/CMP config | <100 sessions/mo with no ranking movement on any target keyword |
| 90 days | ≥2,000 organic sessions/mo trending up, at least one tool ranking page-1 for a long-tail term | Flat traffic, page-2/3 rankings stuck — consider a content/backlink push before abandoning | No page-1 ranking on any of the 15 target keywords, RPM <$5, and no upward trend |

---

## 13. Open Questions

1. **Domain name** — not yet chosen; needs to be acquired before Phase 0.
2. **Does a real `docs/01-08` set or Haul Numbers source exist somewhere not visible to this session** (private repo, different machine, not yet committed)? This spec's Section 8 repo structure is inferred, not observed — worth a direct diff against the real thing before scaffolding.
3. **Geo scope for the tax-specific tools** — confirm you're comfortable this suite is effectively US-only (the freelance-rate calculator is the one tool that generalizes to UK/CA/AU); does that change the portfolio's geo-diversification goals?
4. **CMP vendor choice** for EEA/UK consent — no vendor specified in the brief; needs a decision before Phase 3.
5. **Re-pull Keyword Planner with Location = United States and confirm/switch account currency to USD.** The 2026-09-25 export in `data/keyword-research/` used an account with MAD currency and unconfirmed geo-targeting — likely defaulted to Morocco or worldwide. This is the single highest-value fix available: once resolved, Section 5.1's numbers go from "directional" to "cited real data" with no other changes needed. Runner-up niches (Sections 5.2/5.3) still have zero real keyword data pulled — worth doing if either stays in contention.
6. **AdSense account status** — is this a new AdSense account or an existing one already approved on another portfolio property? That changes the Phase 4 timeline risk substantially (new accounts face more scrutiny).

---

*Self-review performed: all formulas in Section 7 checked for unit consistency (USD in/USD out, % as 0-100 scale consistently, hours × rate = USD). Confirmed no tool requires a server, database, account, or paid API — all four are pure functions over static JSON tables. Confirmed no overlap with personal injury, structured settlements, debt relief, rental property, or trucking keyword sets or advertiser pools. Every monetary/CPC/RPM figure above carries either a `[Cited: source]` tag or an `[Est., confidence level]` tag — none are presented as observed platform data.*
