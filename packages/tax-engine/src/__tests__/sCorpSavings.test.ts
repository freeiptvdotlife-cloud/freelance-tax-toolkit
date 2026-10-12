import { describe, it, expect } from "vitest";
import { calculateSCorpSavings, SCorpInput } from "../sCorpSavings";

const baseInput: SCorpInput = {
  netBusinessProfit: 200_000,
  reasonableSalary: 80_000,
  payrollServiceCostAnnual: 2_000,
  additionalCorpFilingCostAnnual: 1_500,
  filingStatus: "single",
};

describe("calculateSCorpSavings", () => {
  describe("sole-prop SE tax baseline", () => {
    it("computes soleProSeTax on the full profit", () => {
      // netEarnings = 200,000 × 0.9235 = 184,700
      // SS = min(184,700, 184,500) × 0.124 = 184,500 × 0.124 = 22,878
      // Medicare = 184,700 × 0.029 = 5,356.30
      // Additional (single threshold 200k): max(0, 184,700 − 200,000) × 0.009 = 0
      // soleProSeTax = round2(28,234.30) = 28,234.30
      expect(calculateSCorpSavings(baseInput).soleProSeTax).toBe(28_234.30);
    });

    it("soleProSeTax is monotonically increasing with profit", () => {
      const low = calculateSCorpSavings({ ...baseInput, netBusinessProfit: 100_000 });
      const high = calculateSCorpSavings({ ...baseInput, netBusinessProfit: 300_000 });
      expect(high.soleProSeTax).toBeGreaterThan(low.soleProSeTax);
    });
  });

  describe("S-corp payroll tax", () => {
    it("computes scorpPayrollTax on the capped salary", () => {
      // cappedSalary = min(80,000, max(200,000, 0)) = 80,000
      // payrollTax = 80,000 × 0.124 + 80,000 × 0.029 = 9,920 + 2,320 = 12,240
      expect(calculateSCorpSavings(baseInput).scorpPayrollTax).toBe(12_240);
    });

    it("scorpTotalCost includes payroll service and corp filing costs", () => {
      // 12,240 + 2,000 + 1,500 = 15,740
      expect(calculateSCorpSavings(baseInput).scorpTotalCost).toBe(15_740);
    });

    it("caps salary at netBusinessProfit when salary exceeds profit", () => {
      const result = calculateSCorpSavings({
        ...baseInput,
        netBusinessProfit: 50_000,
        reasonableSalary: 80_000,
      });
      // cappedSalary = min(80,000, 50,000) = 50,000
      // payrollTax = 50,000 × (0.124 + 0.029) = 7,650
      expect(result.scorpPayrollTax).toBe(7_650);
    });
  });

  describe("net savings", () => {
    it("computes netSavings as soleProSeTax minus scorpTotalCost", () => {
      // 28,234.30 − 15,740 = 12,494.30
      expect(calculateSCorpSavings(baseInput).netSavings).toBe(12_494.30);
    });

    it("netSavings is negative when overhead exceeds SE tax saved", () => {
      const result = calculateSCorpSavings({
        ...baseInput,
        netBusinessProfit: 30_000,
        reasonableSalary: 30_000,
        payrollServiceCostAnnual: 3_000,
        additionalCorpFilingCostAnnual: 2_000,
      });
      // SE tax on 30k is modest; overhead pushes netSavings negative
      expect(result.netSavings).toBeLessThan(0);
    });

    it("higher profit increases net savings up to SS wage base", () => {
      const mid = calculateSCorpSavings({ ...baseInput, netBusinessProfit: 200_000 });
      const high = calculateSCorpSavings({ ...baseInput, netBusinessProfit: 400_000 });
      expect(high.netSavings).toBeGreaterThan(mid.netSavings);
    });
  });

  describe("break-even profit", () => {
    it("breakEvenProfit is positive", () => {
      expect(calculateSCorpSavings(baseInput).breakEvenProfit).toBeGreaterThan(0);
    });

    it("breakEvenProfit is a reasonable non-trivial number given the inputs", () => {
      // With $3,500 overhead and a 40% salary ratio, break-even should fall well
      // below the full-SS-cap income level (184,500) but above nominal low incomes
      const { breakEvenProfit } = calculateSCorpSavings(baseInput);
      expect(breakEvenProfit).toBeGreaterThan(10_000);
      expect(breakEvenProfit).toBeLessThan(200_000);
    });

    it("higher overhead raises the break-even point", () => {
      const cheap = calculateSCorpSavings({ ...baseInput, payrollServiceCostAnnual: 500 });
      const expensive = calculateSCorpSavings({ ...baseInput, payrollServiceCostAnnual: 4_000 });
      expect(expensive.breakEvenProfit).toBeGreaterThan(cheap.breakEvenProfit);
    });
  });
});
