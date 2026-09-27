import irsData from "./data/irs-brackets-2026.json";
import stateData from "./data/state-brackets-2026.json";

export type FilingStatus = "single" | "mfj" | "hoh";
export type StateCode = string;

interface Bracket {
  upTo: number | null;
  rate: number;
}

export function applyBracket(taxableIncome: number, brackets: Bracket[]): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let lastThreshold = 0;
  for (const bracket of brackets) {
    const ceiling = bracket.upTo === null ? Infinity : bracket.upTo;
    const incomeInBand = Math.max(0, Math.min(taxableIncome, ceiling) - lastThreshold);
    tax += incomeInBand * bracket.rate;
    lastThreshold = ceiling;
    if (taxableIncome <= ceiling) break;
  }
  return round2(tax);
}

export function federalTax(taxableIncome: number, filingStatus: FilingStatus): number {
  const brackets = (irsData.federalBrackets as Record<FilingStatus, Bracket[]>)[filingStatus];
  return applyBracket(taxableIncome, brackets);
}

export function standardDeduction(filingStatus: FilingStatus): number {
  return irsData.standardDeduction[filingStatus];
}

export function stateTax(taxableIncome: number, state: StateCode): number {
  if (taxableIncome <= 0) return 0;
  if (stateData.noIncomeTaxStates.includes(state)) return 0;
  const flatRate = (stateData.flatRateStatesApprox as Record<string, number>)[state];
  if (flatRate !== undefined) return round2(taxableIncome * flatRate);
  // Unmodeled state: don't silently guess. Callers should surface this to the UI as
  // "state tax not yet supported" rather than trust a 0.
  return 0;
}

export function isStateModeled(state: StateCode): boolean {
  return (
    stateData.noIncomeTaxStates.includes(state) ||
    (stateData.flatRateStatesApprox as Record<string, number>)[state] !== undefined
  );
}

export function seTax(seNetProfit: number, filingStatus: FilingStatus): number {
  if (seNetProfit <= 0) return 0;
  const netEarnings = seNetProfit * irsData.seNetEarningsFactor;
  const ssPortion = Math.min(netEarnings, irsData.ssWageBase) * irsData.socialSecurityRate;
  const medicarePortion = netEarnings * irsData.medicareRate;
  const additionalThreshold = irsData.additionalMedicareThreshold[filingStatus];
  const additionalPortion =
    Math.max(0, netEarnings - additionalThreshold) * irsData.additionalMedicareRate;
  return round2(ssPortion + medicarePortion + additionalPortion);
}

export function ssWageBase(): number {
  return irsData.ssWageBase;
}

export function socialSecurityRate(): number {
  return irsData.socialSecurityRate;
}

export function medicareRate(): number {
  return irsData.medicareRate;
}

export function employeeSocialSecurityRate(): number {
  return irsData.employeeSocialSecurityRate;
}

export function employeeMedicareRate(): number {
  return irsData.employeeMedicareRate;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
