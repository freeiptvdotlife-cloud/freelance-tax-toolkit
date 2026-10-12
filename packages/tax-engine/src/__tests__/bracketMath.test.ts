import { describe, it, expect } from "vitest";
import {
  applyBracket,
  federalTax,
  standardDeduction,
  stateTax,
  seTax,
  isStateModeled,
  round2,
  ssWageBase,
  socialSecurityRate,
  medicareRate,
  employeeSocialSecurityRate,
  employeeMedicareRate,
} from "../bracketMath";

describe("round2", () => {
  it("rounds to two decimal places", () => {
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
    expect(round2(1.236)).toBe(1.24);
  });

  it("handles zero and negative values", () => {
    expect(round2(0)).toBe(0);
    expect(round2(-1.234)).toBe(-1.23);
  });

  it("leaves whole numbers unchanged", () => {
    expect(round2(1000)).toBe(1000);
  });
});

describe("applyBracket", () => {
  const brackets = [
    { upTo: 10_000, rate: 0.10 },
    { upTo: null, rate: 0.20 },
  ];

  it("returns 0 for zero or negative income", () => {
    expect(applyBracket(0, brackets)).toBe(0);
    expect(applyBracket(-500, brackets)).toBe(0);
  });

  it("taxes income entirely in the first bracket", () => {
    expect(applyBracket(5_000, brackets)).toBe(500);
  });

  it("taxes income exactly at the first bracket ceiling", () => {
    expect(applyBracket(10_000, brackets)).toBe(1_000);
  });

  it("spans two brackets correctly", () => {
    // 10,000 × 10% + 5,000 × 20% = 1,000 + 1,000 = 2,000
    expect(applyBracket(15_000, brackets)).toBe(2_000);
  });
});

describe("standardDeduction", () => {
  it("returns 2026 single deduction", () => {
    expect(standardDeduction("single")).toBe(16_100);
  });

  it("returns 2026 MFJ deduction (double single)", () => {
    expect(standardDeduction("mfj")).toBe(32_200);
  });

  it("returns 2026 HOH deduction", () => {
    expect(standardDeduction("hoh")).toBe(24_150);
  });
});

describe("federalTax — single filer", () => {
  it("returns 0 for zero income", () => {
    expect(federalTax(0, "single")).toBe(0);
  });

  it("taxes income at top of 10% bracket", () => {
    // 12,400 × 10% = 1,240
    expect(federalTax(12_400, "single")).toBe(1_240);
  });

  it("taxes income at top of 12% bracket", () => {
    // 1,240 + 38,000 × 12% = 1,240 + 4,560 = 5,800
    expect(federalTax(50_400, "single")).toBe(5_800);
  });

  it("taxes income spanning into the 22% bracket", () => {
    // 5,800 + 49,600 × 22% = 5,800 + 10,912 = 16,712
    expect(federalTax(100_000, "single")).toBe(16_712);
  });
});

describe("federalTax — MFJ filer", () => {
  it("taxes MFJ income at top of 10% bracket", () => {
    // 24,800 × 10% = 2,480
    expect(federalTax(24_800, "mfj")).toBe(2_480);
  });

  it("MFJ tax is less than single at same income", () => {
    expect(federalTax(200_000, "mfj")).toBeLessThan(federalTax(200_000, "single"));
  });
});

describe("stateTax", () => {
  it("returns 0 for a no-income-tax state", () => {
    expect(stateTax(100_000, "TX")).toBe(0);
    expect(stateTax(100_000, "FL")).toBe(0);
    expect(stateTax(100_000, "WA")).toBe(0);
  });

  it("returns flat-rate tax for Colorado (4.4%)", () => {
    expect(stateTax(100_000, "CO")).toBe(4_400);
  });

  it("returns flat-rate tax for Illinois (4.95%)", () => {
    expect(stateTax(50_000, "IL")).toBe(2_475);
  });

  it("returns flat-rate tax for Pennsylvania (3.07%)", () => {
    expect(stateTax(100_000, "PA")).toBe(round2(100_000 * 0.0307));
  });

  it("returns 0 for unmodeled states without throwing", () => {
    expect(stateTax(100_000, "CA")).toBe(0);
  });

  it("returns 0 for zero or negative income regardless of state", () => {
    expect(stateTax(0, "CO")).toBe(0);
    expect(stateTax(-1, "CO")).toBe(0);
  });
});

describe("isStateModeled", () => {
  it("returns true for no-income-tax states", () => {
    expect(isStateModeled("TX")).toBe(true);
    expect(isStateModeled("AK")).toBe(true);
  });

  it("returns true for flat-rate states", () => {
    expect(isStateModeled("CO")).toBe(true);
    expect(isStateModeled("IL")).toBe(true);
  });

  it("returns false for unmodeled states", () => {
    expect(isStateModeled("CA")).toBe(false);
    expect(isStateModeled("NY")).toBe(false);
  });
});

describe("seTax", () => {
  it("returns 0 for zero or negative profit", () => {
    expect(seTax(0, "single")).toBe(0);
    expect(seTax(-500, "single")).toBe(0);
  });

  it("calculates SE tax below the SS wage base", () => {
    // netEarnings = 100,000 × 0.9235 = 92,350
    // SS = 92,350 × 0.124 = 11,451.40
    // Medicare = 92,350 × 0.029 = 2,678.15
    // Additional (single threshold 200k, netEarnings < 200k) = 0
    // Total = round2(14,129.55) = 14,129.55
    expect(seTax(100_000, "single")).toBe(14_129.55);
  });

  it("caps SS portion at the SS wage base", () => {
    // netEarnings = 250,000 × 0.9235 = 230,875
    // SS = min(230,875, 184,500) × 0.124 = 184,500 × 0.124 = 22,878
    // Medicare = 230,875 × 0.029 = 6,695.375
    // Additional = (230,875 - 200,000) × 0.009 = 30,875 × 0.009 = 277.875
    // Total = round2(29,851.25) = 29,851.25
    expect(seTax(250_000, "single")).toBe(29_851.25);
  });

  it("applies the 0.9% additional Medicare surcharge for MFJ above 250k", () => {
    // MFJ additional threshold is $250k; for single it's $200k
    // At netEarnings just above 250k for single, there should be additional; for MFJ there should not
    const single = seTax(300_000, "single");
    const mfj = seTax(300_000, "mfj");
    // MFJ has a higher threshold ($250k) so additional Medicare kicks in later → MFJ should be lower
    expect(single).toBeGreaterThan(mfj);
  });

  it("is monotonically increasing with profit", () => {
    expect(seTax(100_000, "single")).toBeLessThan(seTax(200_000, "single"));
  });
});

describe("rate getters", () => {
  it("returns the 2026 SS wage base", () => {
    expect(ssWageBase()).toBe(184_500);
  });

  it("returns the combined SE social security rate (12.4%)", () => {
    expect(socialSecurityRate()).toBe(0.124);
  });

  it("returns the combined SE medicare rate (2.9%)", () => {
    expect(medicareRate()).toBe(0.029);
  });

  it("returns the employee SS rate (half of combined)", () => {
    expect(employeeSocialSecurityRate()).toBe(0.062);
  });

  it("returns the employee Medicare rate (half of combined)", () => {
    expect(employeeMedicareRate()).toBe(0.0145);
  });
});
