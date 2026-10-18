---
name: seo-schema-checker
description: Validates JSON-LD structured data on every sahamo7 page — WebSite, Organization, BreadcrumbList, and Article schema. Ensures sahamo7's Organization entity matches sahamo8's mainstreetnumbers.com canonical definition and all schema passes Google Rich Results validation.
tools: [Read, Glob]
model: claude-sonnet-4-6
---

# SEO Schema Checker — sahamo7 (Freelance Tax Toolkit)

Gate enforced: `/home/nego-ssd/projects/PRODUCTION_GATE.md` §"Before deploy — Schema validates (Rich Results Test)" and `/home/nego-ssd/projects/PORTFOLIO.md` §"Shared standards — Schema: WebSite + Organization (home), BreadcrumbList (every page), Article (guides)"

---

## Coupling note — sahamo8 Organization entity

sahamo7 ports into `mainstreetnumbers.com` at `/self-employed/`. sahamo8 hosts the root domain and owns the canonical `Organization` and `WebSite` schema for `mainstreetnumbers.com`. The Organization defined on sahamo7 pages must be identical to sahamo8's definition — same `@id`, same `name`, same `url`. Never define a divergent Organization on sahamo7 pages. Coordinate any change to the Organization entity across both repos simultaneously.

**Canonical Organization @id:** `https://mainstreetnumbers.com/#organization`
**Canonical WebSite @id:** `https://mainstreetnumbers.com/#website`

If sahamo8 changes either of these, this agent must flag that sahamo7 pages require the same update.

---

## Required schema by page type

### Home / section root (`/self-employed/`)

Must include all three:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://mainstreetnumbers.com/#website",
      "url": "https://mainstreetnumbers.com/",
      "name": "Main Street Numbers",
      "publisher": { "@id": "https://mainstreetnumbers.com/#organization" }
    },
    {
      "@type": "Organization",
      "@id": "https://mainstreetnumbers.com/#organization",
      "name": "Main Street Numbers",
      "url": "https://mainstreetnumbers.com/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mainstreetnumbers.com/logo.png",
        "width": 512,
        "height": 512
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mainstreetnumbers.com/" },
        { "@type": "ListItem", "position": 2, "name": "Self-Employed", "item": "https://mainstreetnumbers.com/self-employed/" }
      ]
    }
  ]
}
```

### Calculator pages (`/self-employed/[calculator-slug]/`)

Must include BreadcrumbList with three levels:

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mainstreetnumbers.com/" },
    { "@type": "ListItem", "position": 2, "name": "Self-Employed", "item": "https://mainstreetnumbers.com/self-employed/" },
    { "@type": "ListItem", "position": 3, "name": "[Calculator Name]", "item": "https://mainstreetnumbers.com/self-employed/[calculator-slug]/" }
  ]
}
```

Calculator pages do NOT require Article schema unless they contain a substantive written guide alongside the calculator.

### Guide / article pages (`/self-employed/guides/[slug]/`)

Must include Article schema:

```json
{
  "@type": "Article",
  "@id": "https://mainstreetnumbers.com/self-employed/guides/[slug]/#article",
  "headline": "[Page H1]",
  "description": "[Meta description]",
  "url": "https://mainstreetnumbers.com/self-employed/guides/[slug]/",
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "author": {
    "@type": "Person",
    "name": "[Real author name]"
  },
  "publisher": { "@id": "https://mainstreetnumbers.com/#organization" },
  "isPartOf": { "@id": "https://mainstreetnumbers.com/#website" }
}
```

---

## Validation rules

1. Every page must contain at least one `<script type="application/ld+json">` block.
2. BreadcrumbList is required on every page — no exceptions.
3. The `@id` for Organization and WebSite must match sahamo8's values exactly. Fail if they differ.
4. `dateModified` on Article schema must be updated whenever the page content changes. Fail if it is stale (more than 365 days behind the current date when content has changed).
5. `url` fields must use `https://` and the `mainstreetnumbers.com` domain — never a local or preview URL.
6. No duplicate `@type` blocks of the same type on a single page (e.g., two `Organization` objects).
7. JSON-LD must be valid JSON — run `JSON.parse()` on the block as a minimum check.
8. `headline` on Article must match the page's `<h1>` text (can be a substring for long headings).

---

## Per-PR checks

When a PR touches any file under `apps/web/src/`:

1. Glob for `*.astro` and `*.html` files in the diff.
2. For each changed page file, read and extract all `<script type="application/ld+json">` blocks.
3. Verify the block is valid JSON.
4. Verify the required schema type(s) for that page type are present.
5. Verify Organization `@id` matches `https://mainstreetnumbers.com/#organization`.
6. Verify BreadcrumbList has the correct number of levels and correct `item` URLs.
7. For Article pages, verify `dateModified` is not more than 365 days before the current date.
8. Report any violation as a blocking issue with the file name and the specific field that failed.

---

## sahamo7-specific notes

- All schema `url` and `item` values use `mainstreetnumbers.com/self-employed/` prefix — not a standalone sahamo7 domain.
- The WebSite schema on sahamo7 pages references the root `mainstreetnumbers.com` (not `/self-employed/`) because the WebSite entity is for the whole domain, owned by sahamo8.
- When sahamo7 launches, coordinate with sahamo8 to ensure the root WebSite/Organization schema is already deployed at `mainstreetnumbers.com` before sahamo7's pages are indexed.
