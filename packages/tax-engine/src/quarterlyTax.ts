import { FilingStatus, StateCode, federalTax, standardDeduction, stateTax, seTax, round2 } from "./bracketMath";

export interface QuarterlyTaxInput {
  expectedAnnualNetProfit: number;
  priorYearTaxLiability: number;
  priorYearAgiOver150k: boolean;
  filingStatus: FilingStatus;
  state: StateCode;
  paymentsAlreadyMadeYtd: number;
  quarterIndex: 1 | 2 | 3 | 4;
}

export interface QuarterlyTaxOutput {
  annualTaxOwed: number;
  requiredAnnualPayment: number;
  perQuarterPayment: number;
  currentQuarterDue: number;
  underpaymentPenaltyRisk: boolean;
}

export function calculateQuarterlyTax(input: QuarterlyTaxInput): QuarterlyTaxOutput {
  const { expectedAnnualNetProfit, filingStatus, state } = input;
  const se = seTax(expectedAnnualNetProfit, filingStatus);
  const taxableIncome = Math.max(
    0,
    expectedAnnualNetProfit - se / 2 - standardDeduction(filingStatus)
  );
  const annualTaxOwed = round2(se + federalTax(taxableIncome, filingStatus) + stateTax(taxableIncome, state));

  const safeHarborPct = input.priorYearAgiOver150k ? 1.1 : 1.0;
  const currentYearSafeHarbor = annualTaxOwed * 0.9;
  const priorYearSafeHarbor = input.priorYearTaxLiability * safeHarborPct;
  const requiredAnnualPayment = round2(
    input.priorYearTaxLiability > 0
      ? Math.min(currentYearSafeHarbor, priorYearSafeHarbor)
      : currentYearSafeHarbor
  );

  const perQuarterPayment = round2(requiredAnnualPayment / 4);
  const currentQuarterDue = round2(
    Math.max(0, perQuarterPayment * input.quarterIndex - input.paymentsAlreadyMadeYtd)
  );
  const underpaymentPenaltyRisk =
    input.paymentsAlreadyMadeYtd < perQuarterPayment * (input.quarterIndex - 1);

  return {
    annualTaxOwed,
    requiredAnnualPayment,
    perQuarterPayment,
    currentQuarterDue,
    underpaymentPenaltyRisk,
  };
}
