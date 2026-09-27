import { describe, it, expect } from "vitest";
import { calculateQuarterlyTax } from "../src/quarterlyTax";

describe("calculateQuarterlyTax", () => {
  it("case 1: nothing paid yet in Q1 — full quarter payment is due", () => {
    const result = calculateQuarterlyTax({
      expectedAnnualNetProfit: 100000,
      priorYearTaxLiability: 0,
      priorYearAgiOver150k: false,
      filingStatus: "single",
      state: "TX",
      paymentsAlreadyMadeYtd: 0,
      quarterIndex: 1,
    });
    expect(result.currentQuarterDue).toBe(result.perQuarterPayment);
  });

  it("case 2: exactly on-track by Q2 — current quarter due equals one more quarter payment", () => {
    const first = calculateQuarterlyTax({
      expectedAnnualNetProfit: 100000,
      priorYearTaxLiability: 0,
      priorYearAgiOver150k: false,
      filingStatus: "single",
      state: "TX",
      paymentsAlreadyMadeYtd: 0,
      quarterIndex: 1,
    });
    const result = calculateQuarterlyTax({
      expectedAnnualNetProfit: 100000,
      priorYearTaxLiability: 0,
      priorYearAgiOver150k: false,
      filingStatus: "single",
      state: "TX",
      paymentsAlreadyMadeYtd: first.perQuarterPayment,
      quarterIndex: 2,
    });
    expect(result.currentQuarterDue).toBe(result.perQuarterPayment);
    expect(result.underpaymentPenaltyRisk).toBe(false);
  });

  it("case 3: zero expected profit produces all-zero outputs", () => {
    const result = calculateQuarterlyTax({
      expectedAnnualNetProfit: 0,
      priorYearTaxLiability: 0,
      priorYearAgiOver150k: false,
      filingStatus: "single",
      state: "TX",
      paymentsAlreadyMadeYtd: 0,
      quarterIndex: 1,
    });
    expect(result.annualTaxOwed).toBe(0);
    expect(result.requiredAnnualPayment).toBe(0);
    expect(result.perQuarterPayment).toBe(0);
    expect(result.currentQuarterDue).toBe(0);
  });
});
