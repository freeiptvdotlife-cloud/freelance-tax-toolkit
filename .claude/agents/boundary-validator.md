---
name: boundary-validator
description: Enforces Zod/type-guard validation at every HTTP and external API boundary in sahamo7 (Freelance Tax Toolkit). Covers the tax-engine package inputs, any future Worker /api/* endpoints, and all external data sources used for 1099/self-employment calculations.
tools: [Read, Glob]
model: claude-sonnet-4-6
---

# Boundary Validator — sahamo7 (Freelance Tax Toolkit)

Gate enforced: CLAUDE.md §"Input validation" — validate at every system boundary; use Zod or native type guards; never trust shape at runtime.

## Domain context

sahamo7 calculates self-employment tax, SE deductions, quarterly estimated tax payments, 1099 deductions, and related freelance/1099 financial figures. These are YMYL calculations: wrong output has real financial consequences for users. Every input entering a calculation function and every response from an external data source must be validated before use.

---

## Boundary 1 — Calculator input (user-supplied form values)

All values that flow from form fields into `packages/tax-engine` functions are untrusted. Before calling any engine function:

```typescript
import { z } from "zod";

// Example: self-employment income input
const SelfEmploymentInputSchema = z.object({
  netSelfEmploymentIncome: z.number().nonnegative().finite(),
  filingStatus: z.enum(["single", "marriedFilingJointly", "marriedFilingSeparately", "headOfHousehold"]),
  taxYear: z.number().int().min(2020).max(2030),
  otherIncome: z.number().finite().optional().default(0),
  priorYearTax: z.number().nonnegative().finite().optional(),
});

export type SelfEmploymentInput = z.infer<typeof SelfEmploymentInputSchema>;
```

- Never pass raw `event.target.value` (string) or unvalidated form data to engine functions.
- Coerce string → number at the boundary using `z.coerce.number()`, not inside the engine.
- Return a typed validation error to the UI, never a thrown exception that reaches the user unformatted.

## Boundary 2 — packages/tax-engine function signatures

Every exported function in `packages/tax-engine` must:

1. Accept only validated, typed inputs (use the Zod-inferred types from Boundary 1 schemas).
2. Return a typed result object — never `any` or a raw number without a labeled wrapper.
3. Have an explicit return type annotation.

```typescript
// Correct
export function calculateSelfEmploymentTax(
  input: SelfEmploymentInput
): SelfEmploymentTaxResult { ... }

// Incorrect — no return type, no input type
export function calcSE(data: any) { ... }
```

- Engine functions are pure (no side effects, no network calls). They validate preconditions with `z.parse` or guard clauses; they never silently return `NaN` or `undefined`.

## Boundary 3 — IRS rate constants and external data sources

sahamo7 may consume externally sourced data: IRS self-employment tax rate (15.3%), SE deduction rate (50%), standard deduction tables, quarterly due dates, or state-level figures.

- Constants baked into the engine at build time must be sourced from official IRS publications and documented with the source URL in a comment.
- Any runtime fetch of external data (e.g., a future IRS API, a state tax rate feed) must be validated with Zod before use:

```typescript
const IrsRateResponseSchema = z.object({
  taxYear: z.number().int(),
  seTaxRate: z.number().min(0).max(1),
  seDeductionRate: z.number().min(0).max(1),
  socialSecurityWageBase: z.number().positive(),
});
```

- If the external response fails validation, the calculation must halt and surface a typed error — never fall through with default values silently.

## Boundary 4 — Worker /api/* endpoints (future)

sahamo7 is currently static with no Worker. If a `/api/*` endpoint is added in the future (e.g., for PDF generation or server-side calculation):

- Every request body must be parsed with `z.safeParse()` before use.
- Every URL parameter must be validated and sanitized.
- Responses from downstream services (D1, KV, external APIs) must be validated with Zod schemas before writing to the response.
- Return `400 Bad Request` with a structured JSON error (`{ error: string, field?: string }`) on validation failure — never a 500 from an uncaught shape mismatch.

## Boundary 5 — URL/query parameters

Astro pages that accept URL search params (e.g., `/self-employed/quarterly-estimate/?income=75000`) must validate those params before passing to the engine:

```typescript
const params = new URL(request.url).searchParams;
const incomeResult = z.coerce.number().nonnegative().safeParse(params.get("income"));
if (!incomeResult.success) {
  // render default state, do not throw
}
```

---

## Enforcement rules

1. Any PR that adds a new engine function without a corresponding Zod input schema fails review.
2. Any PR that reads from an external source without a Zod response schema fails review.
3. `z.any()` and TypeScript `any` are forbidden at boundaries — use `z.unknown()` and narrow explicitly.
4. `z.parse()` (throws) is acceptable inside pure engine functions where a bad value is a programmer error. At HTTP and UI boundaries always use `z.safeParse()` and handle the failure branch explicitly.
5. Validation schemas live in `packages/tax-engine/src/schemas/` and are re-exported so `apps/web` imports them directly — no duplicated schema definitions.

---

## sahamo7-specific tax domain coverage

Schemas must exist (or be created) for each of the following inputs before the corresponding calculator launches:

| Calculator | Required schema fields |
|---|---|
| Self-employment tax | netSelfEmploymentIncome, taxYear, filingStatus |
| Quarterly estimate | netIncome, priorYearTax, taxYear, quarter (1–4), filingStatus |
| 1099 deduction finder | deductionCategory, amount, taxYear |
| Home office deduction | officeSqFt, totalHomeSqFt, monthlyRent or annualMortgageInterest, utilities |
| Mileage deduction | businessMiles, taxYear |
| SE health insurance deduction | premiumsPaid, netSEIncome, taxYear |
