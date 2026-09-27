import { describe, it, expect } from "vitest";
import { calculateFreelanceRate } from "../src/freelanceRate";

describe("calculateFreelanceRate", () => {
  const base = {
    targetAnnualIncome: 80000,
    billableHoursPerWeek: 25,
    weeksOffPerYear: 4,
    businessExpensesAnnual: 5000,
    taxBufferPct: 30,
    benefitsReplacementCost: 8000,
  };

  it("case 1: sanity-checkable hourly rate for the baseline inputs", () => {
    const result = calculateFreelanceRate(base);
    // (80000 + 5000 + 8000) / 0.7 / (48 weeks * 25 hrs) = 132857.14 / 1200 ≈ 110.71
    expect(result.requiredHourlyRate).toBeCloseTo(110.71, 1);
  });

  it("case 2: zero target income still covers fixed costs, not zero", () => {
    const result = calculateFreelanceRate({ ...base, targetAnnualIncome: 0 });
    expect(result.requiredHourlyRate).toBeGreaterThan(0);
  });

  it("case 3: more billable hours per week lowers the required rate", () => {
    const more = calculateFreelanceRate({ ...base, billableHoursPerWeek: 40, weeksOffPerYear: 0 });
    const baseline = calculateFreelanceRate(base);
    expect(more.requiredHourlyRate).toBeLessThan(baseline.requiredHourlyRate);
  });
});
