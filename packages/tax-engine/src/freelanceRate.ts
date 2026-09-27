import { round2 } from "./bracketMath";

export interface FreelanceRateInput {
  targetAnnualIncome: number;
  billableHoursPerWeek: number;
  weeksOffPerYear: number;
  businessExpensesAnnual: number;
  taxBufferPct: number;
  benefitsReplacementCost: number;
}

export interface FreelanceRateOutput {
  requiredHourlyRate: number;
  requiredDayRate: number;
  totalBillableHours: number;
  grossRevenueNeeded: number;
}

export function calculateFreelanceRate(input: FreelanceRateInput): FreelanceRateOutput {
  const {
    targetAnnualIncome,
    billableHoursPerWeek,
    weeksOffPerYear,
    businessExpensesAnnual,
    taxBufferPct,
    benefitsReplacementCost,
  } = input;

  if (taxBufferPct >= 100 || taxBufferPct < 0) {
    throw new RangeError("taxBufferPct must be in [0, 100)");
  }

  const billableWeeksPerYear = Math.max(0, 52 - weeksOffPerYear);
  const totalBillableHours = billableWeeksPerYear * billableHoursPerWeek;
  const grossRevenueNeeded = round2(
    targetAnnualIncome + businessExpensesAnnual + benefitsReplacementCost
  );
  const grossRevenueWithTaxBuffer = round2(grossRevenueNeeded / (1 - taxBufferPct / 100));

  if (totalBillableHours <= 0) {
    return {
      requiredHourlyRate: 0,
      requiredDayRate: 0,
      totalBillableHours: 0,
      grossRevenueNeeded,
    };
  }

  const requiredHourlyRate = round2(grossRevenueWithTaxBuffer / totalBillableHours);
  return {
    requiredHourlyRate,
    requiredDayRate: round2(requiredHourlyRate * 8),
    totalBillableHours,
    grossRevenueNeeded,
  };
}
