import { describe, it, expect } from "vitest";
import { calculateSCorpSavings } from "../src/sCorpSavings";

describe("calculateSCorpSavings", () => {
  it("case 1: $150k profit, $70k reasonable salary — S-corp saves money", () => {
    const result = calculateSCorpSavings({
      netBusinessProfit: 150000,
      reasonableSalary: 70000,
      payrollServiceCostAnnual: 600,
      additionalCorpFilingCostAnnual: 800,
      filingStatus: "single",
    });
    expect(result.netSavings).toBeGreaterThan(0);
  });

  it("case 2: $50k profit, $45k salary — too little spread above salary to justify overhead", () => {
    const result = calculateSCorpSavings({
      netBusinessProfit: 50000,
      reasonableSalary: 45000,
      payrollServiceCostAnnual: 600,
      additionalCorpFilingCostAnnual: 800,
      filingStatus: "single",
    });
    expect(result.netSavings).toBeLessThanOrEqual(0);
  });

  it("case 3: zero profit and salary — all outputs zero", () => {
    const result = calculateSCorpSavings({
      netBusinessProfit: 0,
      reasonableSalary: 0,
      payrollServiceCostAnnual: 0,
      additionalCorpFilingCostAnnual: 0,
      filingStatus: "single",
    });
    expect(result.soleProSeTax).toBe(0);
    expect(result.scorpPayrollTax).toBe(0);
  });
});
