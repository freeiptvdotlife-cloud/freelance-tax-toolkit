import { seTax, ssWageBase, socialSecurityRate, medicareRate, round2 } from "./bracketMath";
import { FilingStatus } from "./bracketMath";

export interface SCorpInput {
  netBusinessProfit: number;
  reasonableSalary: number;
  payrollServiceCostAnnual: number;
  additionalCorpFilingCostAnnual: number;
  filingStatus: FilingStatus;
}

export interface SCorpOutput {
  soleProSeTax: number;
  scorpPayrollTax: number;
  scorpTotalCost: number;
  netSavings: number;
  breakEvenProfit: number;
}

function payrollTaxOnSalary(salary: number): number {
  if (salary <= 0) return 0;
  return round2(Math.min(salary, ssWageBase()) * socialSecurityRate() + salary * medicareRate());
}

export function calculateSCorpSavings(input: SCorpInput): SCorpOutput {
  const { netBusinessProfit, reasonableSalary, payrollServiceCostAnnual, additionalCorpFilingCostAnnual, filingStatus } =
    input;

  const soleProSeTax = seTax(netBusinessProfit, filingStatus);
  const cappedSalary = Math.min(reasonableSalary, Math.max(netBusinessProfit, 0));
  const scorpPayrollTax = payrollTaxOnSalary(cappedSalary);
  const scorpTotalCost = round2(scorpPayrollTax + payrollServiceCostAnnual + additionalCorpFilingCostAnnual);
  const netSavings = round2(soleProSeTax - scorpTotalCost);

  const salaryRatio = netBusinessProfit > 0 ? reasonableSalary / netBusinessProfit : 0;
  let lo = 0;
  let hi = 2_000_000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const midSalary = mid * salaryRatio;
    const midSoleProSe = seTax(mid, filingStatus);
    const midScorpCost = round2(
      payrollTaxOnSalary(midSalary) + payrollServiceCostAnnual + additionalCorpFilingCostAnnual
    );
    if (midSoleProSe - midScorpCost < 0) lo = mid;
    else hi = mid;
  }
  const breakEvenProfit = round2(hi);

  return { soleProSeTax, scorpPayrollTax, scorpTotalCost, netSavings, breakEvenProfit };
}
