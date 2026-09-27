import { describe, it, expect } from "vitest";
import { compareW2VsContractor } from "../src/comparator";

describe("compareW2VsContractor", () => {
  it("case 1: equal gross pay, no-tax state — contractor take-home is lower due to SE tax", () => {
    const result = compareW2VsContractor({
      w2AnnualSalary: 80000,
      contractRate: 80000,
      filingStatus: "single",
      state: "TX",
      w2BenefitsValue: 0,
      selfEmployedExpenses: 0,
      retirementContributionPct: 0,
    });
    expect(result.contractorNetTakeHome).toBeLessThan(result.w2NetTakeHome);
    expect(Number.isFinite(result.contractorNetTakeHome)).toBe(true);
  });

  it("case 2: with benefits replacement included, break-even lands in the commonly-cited 1.2x-1.6x-of-salary range", () => {
    const result = compareW2VsContractor({
      w2AnnualSalary: 100000,
      contractRate: 100000,
      filingStatus: "single",
      state: "TX",
      w2BenefitsValue: 12000, // doc's own default (docs/09-autonomous-deep-research.md Section 7, Tool 1 defaults)
      selfEmployedExpenses: 0,
      retirementContributionPct: 0,
    });
    // Sanity check against the "1099 rates should run 25-40% higher than W2" rule of thumb
    // cited in Section 5.1 (Indeed Flex, TakeHomeTax) — that rule bakes in lost benefits,
    // hence w2BenefitsValue must be nonzero here for the multiplier to land in range.
    // This validates the engine's own break-even search, not the rule of thumb itself.
    const multiplier = result.breakEvenContractRate / 100000;
    expect(multiplier).toBeGreaterThan(1.2);
    expect(multiplier).toBeLessThan(1.6);
  });

  it("case 3: zero contract rate produces all-zero, finite outputs", () => {
    const result = compareW2VsContractor({
      w2AnnualSalary: 0,
      contractRate: 0,
      filingStatus: "single",
      state: "TX",
      w2BenefitsValue: 0,
      selfEmployedExpenses: 0,
      retirementContributionPct: 0,
    });
    expect(result.contractorNetTakeHome).toBe(0);
    expect(result.w2NetTakeHome).toBe(0);
    expect(result.seTax).toBe(0);
    expect(Number.isFinite(result.breakEvenContractRate)).toBe(true);
    expect(Number.isNaN(result.breakEvenContractRate)).toBe(false);
  });
});
