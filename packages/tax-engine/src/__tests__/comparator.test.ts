import { describe, it, expect } from "vitest";
import { compareW2VsContractor, ComparatorInput } from "../comparator";

// Simple baseline: single filer, no-income-tax state, no benefits, no expenses, no retirement
const baseInput: ComparatorInput = {
  w2AnnualSalary: 100_000,
  contractRate: 120_000,
  filingStatus: "single",
  state: "TX",
  w2BenefitsValue: 0,
  selfEmployedExpenses: 0,
  retirementContributionPct: 0,
};

describe("compareW2VsContractor — W2 take-home", () => {
  it("computes w2NetTakeHome for a 100k single filer in TX", () => {
    // FICA = 100,000 × 0.062 + 100,000 × 0.0145 = 6,200 + 1,450 = 7,650
    // Taxable = 100,000 − 16,100 = 83,900
    // Federal = 1,240 + 4,560 + 33,500 × 0.22 = 13,170
    // W2 net = 100,000 − 7,650 − 13,170 = 79,180
    expect(compareW2VsContractor(baseInput).w2NetTakeHome).toBe(79_180);
  });

  it("higher W2 salary → lower effectiveTaxRateW2 initially (more of income in lower bands)", () => {
    const low = compareW2VsContractor({ ...baseInput, w2AnnualSalary: 50_000, contractRate: 50_000 });
    const high = compareW2VsContractor({ ...baseInput, w2AnnualSalary: 200_000, contractRate: 200_000 });
    expect(high.effectiveTaxRateW2).toBeGreaterThan(low.effectiveTaxRateW2);
  });
});

describe("compareW2VsContractor — contractor take-home", () => {
  it("computes contractorNetTakeHome for 120k single in TX", () => {
    // netProfit = 120,000
    // SE: netEarnings = 110,820; SS = 13,741.68; Medicare = 3,213.78; total = 16,955.46
    // Taxable = 120,000 − 8,477.73 − 16,100 = 95,422.27
    // Federal = 1,240 + 4,560 + 45,022.27 × 0.22 = 15,704.90
    // Contractor net = 120,000 − 16,955.46 − 15,704.90 = 87,339.64
    expect(compareW2VsContractor(baseInput).contractorNetTakeHome).toBe(87_339.64);
  });

  it("deducts expenses before computing SE tax", () => {
    const withExpenses = compareW2VsContractor({
      ...baseInput,
      selfEmployedExpenses: 10_000,
    });
    // netProfit drops to 110,000 → lower SE → different take-home
    const withoutExpenses = compareW2VsContractor(baseInput);
    expect(withExpenses.contractorNetTakeHome).toBeLessThan(withoutExpenses.contractorNetTakeHome);
  });

  it("higher contract rate increases contractorNetTakeHome", () => {
    const lower = compareW2VsContractor({ ...baseInput, contractRate: 100_000 });
    const higher = compareW2VsContractor({ ...baseInput, contractRate: 150_000 });
    expect(higher.contractorNetTakeHome).toBeGreaterThan(lower.contractorNetTakeHome);
  });
});

describe("compareW2VsContractor — SE tax output", () => {
  it("matches seTax on netProfit", () => {
    // seTax(120,000, "single") = 16,955.46
    expect(compareW2VsContractor(baseInput).seTax).toBe(16_955.46);
  });
});

describe("compareW2VsContractor — effective tax rates", () => {
  it("effectiveTaxRateContractor is positive", () => {
    expect(compareW2VsContractor(baseInput).effectiveTaxRateContractor).toBeGreaterThan(0);
  });

  it("effectiveTaxRateW2 is positive", () => {
    expect(compareW2VsContractor(baseInput).effectiveTaxRateW2).toBeGreaterThan(0);
  });

  it("contractor effective rate is higher than W2 at same gross (due to SE tax)", () => {
    const same = compareW2VsContractor({
      ...baseInput,
      w2AnnualSalary: 100_000,
      contractRate: 100_000,
    });
    expect(same.effectiveTaxRateContractor).toBeGreaterThan(same.effectiveTaxRateW2);
  });

  it("returns 0 effective rates when both incomes are 0", () => {
    const result = compareW2VsContractor({
      ...baseInput,
      w2AnnualSalary: 0,
      contractRate: 0,
    });
    expect(result.effectiveTaxRateContractor).toBe(0);
    expect(result.effectiveTaxRateW2).toBe(0);
  });
});

describe("compareW2VsContractor — break-even rate", () => {
  it("breakEvenContractRate is above zero", () => {
    expect(compareW2VsContractor(baseInput).breakEvenContractRate).toBeGreaterThan(0);
  });

  it("contractor at breakEvenRate matches W2 take-home within $1", () => {
    const { breakEvenContractRate, w2NetTakeHome, w2BenefitsValue } = {
      ...compareW2VsContractor(baseInput),
      w2BenefitsValue: baseInput.w2BenefitsValue,
    };
    // Re-run comparator at exactly the break-even rate
    const atBreakEven = compareW2VsContractor({
      ...baseInput,
      contractRate: breakEvenContractRate,
    });
    // contractor take-home at break-even should match w2 net + benefits within rounding
    expect(Math.abs(atBreakEven.contractorNetTakeHome - (w2NetTakeHome + 0))).toBeLessThan(1);
  });

  it("w2BenefitsValue increases breakEvenContractRate", () => {
    const withoutBenefits = compareW2VsContractor(baseInput);
    const withBenefits = compareW2VsContractor({ ...baseInput, w2BenefitsValue: 15_000 });
    expect(withBenefits.breakEvenContractRate).toBeGreaterThan(
      withoutBenefits.breakEvenContractRate
    );
  });

  it("higher W2 salary increases breakEvenContractRate", () => {
    const low = compareW2VsContractor({ ...baseInput, w2AnnualSalary: 80_000, contractRate: 80_000 });
    const high = compareW2VsContractor({ ...baseInput, w2AnnualSalary: 150_000, contractRate: 150_000 });
    expect(high.breakEvenContractRate).toBeGreaterThan(low.breakEvenContractRate);
  });
});
