import {
  FilingStatus,
  StateCode,
  federalTax,
  standardDeduction,
  stateTax,
  seTax,
  ssWageBase,
  employeeSocialSecurityRate,
  employeeMedicareRate,
  round2,
} from "./bracketMath";

export interface ComparatorInput {
  w2AnnualSalary: number;
  contractRate: number;
  filingStatus: FilingStatus;
  state: StateCode;
  w2BenefitsValue: number;
  selfEmployedExpenses: number;
  retirementContributionPct: number;
}

export interface ComparatorOutput {
  contractorNetTakeHome: number;
  w2NetTakeHome: number;
  seTax: number;
  breakEvenContractRate: number;
  effectiveTaxRateContractor: number;
  effectiveTaxRateW2: number;
}

function w2FicaTax(salary: number): number {
  if (salary <= 0) return 0;
  // Employee-only FICA: half of the combined SE rate (the employer pays the other half,
  // which never appears in the employee's gross salary or take-home to begin with).
  return round2(
    Math.min(salary, ssWageBase()) * employeeSocialSecurityRate() + salary * employeeMedicareRate()
  );
}

function contractorTakeHome(input: ComparatorInput, contractRate: number): number {
  const { selfEmployedExpenses, filingStatus, state, retirementContributionPct } = input;
  const netProfit = Math.max(0, contractRate - selfEmployedExpenses);
  const se = seTax(netProfit, filingStatus);
  const retirementContribution = netProfit * (retirementContributionPct / 100);
  const taxableIncome = Math.max(
    0,
    netProfit - se / 2 - standardDeduction(filingStatus) - retirementContribution
  );
  const fedTax = federalTax(taxableIncome, filingStatus);
  const stTax = stateTax(taxableIncome, state);
  return round2(netProfit - se - fedTax - stTax - retirementContribution);
}

function w2TakeHome(input: ComparatorInput): number {
  const { w2AnnualSalary, filingStatus, state, retirementContributionPct } = input;
  const fica = w2FicaTax(w2AnnualSalary);
  const retirementContribution = w2AnnualSalary * (retirementContributionPct / 100);
  const taxableIncome = Math.max(
    0,
    w2AnnualSalary - standardDeduction(filingStatus) - retirementContribution
  );
  const fedTax = federalTax(taxableIncome, filingStatus);
  const stTax = stateTax(taxableIncome, state);
  return round2(w2AnnualSalary - fica - fedTax - stTax - retirementContribution);
}

export function compareW2VsContractor(input: ComparatorInput): ComparatorOutput {
  const contractorNetTakeHome = contractorTakeHome(input, input.contractRate);
  const w2NetTakeHome = w2TakeHome(input);
  const netProfit = Math.max(0, input.contractRate - input.selfEmployedExpenses);
  const se = seTax(netProfit, input.filingStatus);

  // Contractor has no employer-provided benefits, so their cash take-home must cover
  // W2's cash take-home PLUS the value of the benefits they'd otherwise have to self-fund.
  const target = w2NetTakeHome + input.w2BenefitsValue;
  let lo = 0;
  let hi = Math.max(input.contractRate, input.w2AnnualSalary) * 3 + 10000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const take = contractorTakeHome(input, mid);
    if (take < target) lo = mid;
    else hi = mid;
  }
  const breakEvenContractRate = round2(hi);

  return {
    contractorNetTakeHome,
    w2NetTakeHome,
    seTax: se,
    breakEvenContractRate,
    effectiveTaxRateContractor:
      input.contractRate > 0
        ? round2((1 - contractorNetTakeHome / input.contractRate) * 100)
        : 0,
    effectiveTaxRateW2:
      input.w2AnnualSalary > 0 ? round2((1 - w2NetTakeHome / input.w2AnnualSalary) * 100) : 0,
  };
}
