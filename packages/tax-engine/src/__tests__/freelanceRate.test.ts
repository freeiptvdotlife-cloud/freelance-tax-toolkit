import { describe, it, expect } from "vitest";
import { calculateFreelanceRate, FreelanceRateInput } from "../freelanceRate";

const baseInput: FreelanceRateInput = {
  targetAnnualIncome: 100_000,
  billableHoursPerWeek: 40,
  weeksOffPerYear: 4,
  businessExpensesAnnual: 10_000,
  taxBufferPct: 25,
  benefitsReplacementCost: 6_000,
};

describe("calculateFreelanceRate", () => {
  describe("standard case", () => {
    it("computes totalBillableHours correctly", () => {
      // (52 - 4) weeks × 40 hours = 1,920
      expect(calculateFreelanceRate(baseInput).totalBillableHours).toBe(1_920);
    });

    it("computes grossRevenueNeeded (pre-tax-buffer)", () => {
      // 100,000 + 10,000 + 6,000 = 116,000
      expect(calculateFreelanceRate(baseInput).grossRevenueNeeded).toBe(116_000);
    });

    it("computes requiredHourlyRate using tax buffer", () => {
      // grossWithBuffer = round2(116,000 / 0.75) = 154,666.67
      // hourlyRate = round2(154,666.67 / 1,920) = 80.56
      expect(calculateFreelanceRate(baseInput).requiredHourlyRate).toBe(80.56);
    });

    it("computes requiredDayRate as 8 × hourlyRate", () => {
      // 80.56 × 8 = 644.48
      expect(calculateFreelanceRate(baseInput).requiredDayRate).toBe(644.48);
    });
  });

  describe("zero billable hours", () => {
    it("returns zero rates when all weeks are off", () => {
      const result = calculateFreelanceRate({ ...baseInput, weeksOffPerYear: 52 });
      expect(result.requiredHourlyRate).toBe(0);
      expect(result.requiredDayRate).toBe(0);
      expect(result.totalBillableHours).toBe(0);
    });

    it("still returns a grossRevenueNeeded when hours are zero", () => {
      const result = calculateFreelanceRate({ ...baseInput, weeksOffPerYear: 52 });
      expect(result.grossRevenueNeeded).toBe(116_000);
    });
  });

  describe("tax buffer edge cases", () => {
    it("taxBufferPct = 0 returns grossRevenue equal to grossRevenueNeeded", () => {
      const result = calculateFreelanceRate({ ...baseInput, taxBufferPct: 0 });
      expect(result.requiredHourlyRate).toBe(round2(116_000 / 1_920));
    });

    it("throws RangeError when taxBufferPct is 100", () => {
      expect(() =>
        calculateFreelanceRate({ ...baseInput, taxBufferPct: 100 })
      ).toThrow(RangeError);
    });

    it("throws RangeError when taxBufferPct is negative", () => {
      expect(() =>
        calculateFreelanceRate({ ...baseInput, taxBufferPct: -1 })
      ).toThrow(RangeError);
    });
  });

  describe("monotonicity", () => {
    it("higher income target → higher required rate", () => {
      const low = calculateFreelanceRate({ ...baseInput, targetAnnualIncome: 80_000 });
      const high = calculateFreelanceRate({ ...baseInput, targetAnnualIncome: 120_000 });
      expect(high.requiredHourlyRate).toBeGreaterThan(low.requiredHourlyRate);
    });

    it("more weeks off → higher required rate (fewer billable hours)", () => {
      const busy = calculateFreelanceRate({ ...baseInput, weeksOffPerYear: 0 });
      const rested = calculateFreelanceRate({ ...baseInput, weeksOffPerYear: 8 });
      expect(rested.requiredHourlyRate).toBeGreaterThan(busy.requiredHourlyRate);
    });

    it("higher expenses → higher required rate", () => {
      const lean = calculateFreelanceRate({ ...baseInput, businessExpensesAnnual: 0 });
      const heavy = calculateFreelanceRate({ ...baseInput, businessExpensesAnnual: 20_000 });
      expect(heavy.requiredHourlyRate).toBeGreaterThan(lean.requiredHourlyRate);
    });
  });
});

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
