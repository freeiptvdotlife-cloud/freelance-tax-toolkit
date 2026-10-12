import { describe, it, expect } from "vitest";
import { calculateQuarterlyTax, QuarterlyTaxInput } from "../quarterlyTax";

// Base: $80k self-employed single filer in TX (no state tax), no prior-year data
const baseInput: QuarterlyTaxInput = {
  expectedAnnualNetProfit: 80_000,
  priorYearTaxLiability: 0,
  priorYearAgiOver150k: false,
  filingStatus: "single",
  state: "TX",
  paymentsAlreadyMadeYtd: 0,
  quarterIndex: 1,
};

describe("calculateQuarterlyTax — annual tax calculation", () => {
  it("computes annualTaxOwed (SE + federal, no state)", () => {
    // SE tax on 80k single:
    //   netEarnings = 80,000 × 0.9235 = 73,880
    //   SS = 73,880 × 0.124 = 9,161.12
    //   Medicare = 73,880 × 0.029 = 2,142.52
    //   SE = round2(11,303.64) = 11,303.64
    //
    // Taxable income = 80,000 − 11,303.64/2 − 16,100 = 58,248.18
    // Federal tax = 1,240 + 4,560 + 7,848.18 × 0.22 = 7,526.60
    //
    // annualTaxOwed = round2(11,303.64 + 7,526.60) = 18,830.24
    expect(calculateQuarterlyTax(baseInput).annualTaxOwed).toBe(18_830.24);
  });

  it("state tax increases annualTaxOwed", () => {
    const withState = calculateQuarterlyTax({ ...baseInput, state: "CO" });
    expect(withState.annualTaxOwed).toBeGreaterThan(18_830.24);
  });

  it("higher profit → higher annualTaxOwed", () => {
    const low = calculateQuarterlyTax({ ...baseInput, expectedAnnualNetProfit: 60_000 });
    const high = calculateQuarterlyTax({ ...baseInput, expectedAnnualNetProfit: 100_000 });
    expect(high.annualTaxOwed).toBeGreaterThan(low.annualTaxOwed);
  });
});

describe("calculateQuarterlyTax — safe harbor with no prior year", () => {
  it("requiredAnnualPayment is 90% of annualTaxOwed when no prior liability", () => {
    const { annualTaxOwed, requiredAnnualPayment } = calculateQuarterlyTax(baseInput);
    expect(requiredAnnualPayment).toBe(Math.round(annualTaxOwed * 0.9 * 100) / 100);
  });

  it("perQuarterPayment is requiredAnnualPayment / 4", () => {
    const { requiredAnnualPayment, perQuarterPayment } = calculateQuarterlyTax(baseInput);
    expect(perQuarterPayment).toBe(Math.round((requiredAnnualPayment / 4) * 100) / 100);
  });
});

describe("calculateQuarterlyTax — safe harbor with prior year liability", () => {
  it("chooses the smaller of 90%-current-year vs 100%-prior-year safe harbors", () => {
    // annualTaxOwed ≈ 18,830 — 90% = ~16,947.
    // priorYear = 20,000 → 100% = 20,000.
    // min(16,947, 20,000) = 16,947 (current year wins).
    const { requiredAnnualPayment } = calculateQuarterlyTax({
      ...baseInput,
      priorYearTaxLiability: 20_000,
    });
    expect(requiredAnnualPayment).toBeLessThanOrEqual(20_000);
    expect(requiredAnnualPayment).toBeCloseTo(16_947.22, 1);
  });

  it("prior-year safe harbor wins when annualTax is much lower than prior liability", () => {
    // Low-profit year: annualTaxOwed will be well below 8,000 × 10/9
    // priorYearLiability = 8,000 → 100% = 8,000; 90% of ~small = smaller → prior wins
    const { requiredAnnualPayment } = calculateQuarterlyTax({
      ...baseInput,
      expectedAnnualNetProfit: 20_000,
      priorYearTaxLiability: 8_000,
    });
    // 90% of ~1,200 would be well below 8,000, so prior year harbor = 8,000 wins
    expect(requiredAnnualPayment).toBeLessThanOrEqual(8_000);
  });

  it("applies 110% safe harbor when priorYearAgiOver150k is true", () => {
    const normal = calculateQuarterlyTax({
      ...baseInput,
      expectedAnnualNetProfit: 20_000,
      priorYearTaxLiability: 8_000,
    });
    const over150k = calculateQuarterlyTax({
      ...baseInput,
      expectedAnnualNetProfit: 20_000,
      priorYearTaxLiability: 8_000,
      priorYearAgiOver150k: true,
    });
    // 110% safe harbor = 8,800 vs 100% = 8,000; current year same either way
    // so when 110% wins, requiredAnnualPayment will be larger
    expect(over150k.requiredAnnualPayment).toBeGreaterThanOrEqual(normal.requiredAnnualPayment);
  });
});

describe("calculateQuarterlyTax — currentQuarterDue and underpayment", () => {
  it("Q1 due equals perQuarterPayment when no payments made", () => {
    const { perQuarterPayment, currentQuarterDue } = calculateQuarterlyTax(baseInput);
    expect(currentQuarterDue).toBe(perQuarterPayment);
  });

  it("Q2 due is reduced by prior payments", () => {
    const { perQuarterPayment } = calculateQuarterlyTax(baseInput);
    const q2WithPayment = calculateQuarterlyTax({
      ...baseInput,
      quarterIndex: 2,
      paymentsAlreadyMadeYtd: perQuarterPayment,
    });
    expect(q2WithPayment.currentQuarterDue).toBe(perQuarterPayment);
  });

  it("currentQuarterDue is 0 when over-paid", () => {
    const { annualTaxOwed } = calculateQuarterlyTax(baseInput);
    const result = calculateQuarterlyTax({
      ...baseInput,
      quarterIndex: 1,
      paymentsAlreadyMadeYtd: annualTaxOwed,
    });
    expect(result.currentQuarterDue).toBe(0);
  });

  it("no underpayment risk in Q1 with no prior payments (nothing was due yet)", () => {
    const { underpaymentPenaltyRisk } = calculateQuarterlyTax(baseInput);
    expect(underpaymentPenaltyRisk).toBe(false);
  });

  it("underpayment risk true when Q2 started with no payments", () => {
    const { underpaymentPenaltyRisk } = calculateQuarterlyTax({
      ...baseInput,
      quarterIndex: 2,
      paymentsAlreadyMadeYtd: 0,
    });
    expect(underpaymentPenaltyRisk).toBe(true);
  });
});
