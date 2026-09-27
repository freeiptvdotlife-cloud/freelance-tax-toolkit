# Keyword Research Data

Drop CSV exports here. Filename pattern: `<niche-slug>-<source>-<YYYY-MM-DD>.csv` (e.g. `self-employment-tax-semrush-2026-09-25.csv`).

## Expected columns (match your export tool's headers where possible)

| Column | Type | Notes |
|---|---|---|
| `keyword` | string | exact query |
| `search_volume` | number | monthly, target geo |
| `geo` | string | US / UK / CA / AU |
| `cpc_low` | number | USD, low end of bid range |
| `cpc_high` | number | USD, high end of bid range |
| `competition` | number/string | Keyword Planner 0–1 or Semrush/Ahrefs 0–100 difficulty — note which scale in the filename or a comment row |
| `top_ranking_domain` | string | #1 result, if the export includes it |
| `source` | string | `keyword_planner` / `semrush` / `ahrefs` / `spyfu` / `ubersuggest` |
| `pulled_date` | date | YYYY-MM-DD |

## Sources this feeds

- Google Keyword Planner (Google Ads account, free)
- Semrush / Ahrefs (paid, most complete — includes competitor traffic estimates)
- SpyFu / Ubersuggest (cheaper, directional only)

## How it's used

Any file here supersedes the `[Est.]`-labeled CPC/volume figures in [`docs/09-autonomous-deep-research.md`](../../docs/09-autonomous-deep-research.md). When new exports land, re-score the candidate table in Section 4 and tighten Section 5's keyword tables using real numbers instead of estimates.
