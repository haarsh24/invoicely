import { describe, it, expect } from "vitest";
import { calculateInvoice } from "../../src/lib/gst/tax";
import { paiseToWords } from "../../src/lib/gst/words";
import {
  validateGstin,
  createFixtureGstin,
  calculateGstinChecksum,
} from "../../src/lib/gst/gstin";
import { getFinancialYear, validateInvoiceNumber, formatInvoiceNumber } from "../../src/lib/gst/numbering";
import { buildUpiPayUrl, validateVpa } from "../../src/lib/upi";
import { isUnionTerritoryWithoutLegislature } from "../../src/lib/gst/states";
import { rupeesToPaise } from "../../src/lib/gst/money";

describe("GST Engine - Exact Worked Examples from Spec", () => {
  it("1. Intra-state: 1 x 10,000.00 at 18% -> taxable 10,000.00, CGST 900.00, SGST 900.00, total 11,800.00", () => {
    const res = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29", // Karnataka
      placeOfSupplyStateCode: "29", // Karnataka
      lines: [
        {
          id: "1",
          description: "Software Services",
          quantity: 1,
          ratePaise: rupeesToPaise(10000),
          gstRate: 18,
          taxTreatment: "taxable",
        },
      ],
    });

    expect(res.taxType).toBe("intra");
    expect(res.documentType).toBe("TAX INVOICE");
    expect(res.totals.taxablePaise).toBe(1000000); // 10,000.00
    expect(res.totals.cgstPaise).toBe(90000); // 900.00
    expect(res.totals.sgstPaise).toBe(90000); // 900.00
    expect(res.totals.utgstPaise).toBe(0);
    expect(res.totals.igstPaise).toBe(0);
    expect(res.totals.grandTotalPaise).toBe(1180000); // 11,800.00
  });

  it("2. Inter-state: 1 x 10,000.00 at 18% -> IGST 1,800.00, total 11,800.00", () => {
    const res = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29", // Karnataka
      placeOfSupplyStateCode: "27", // Maharashtra
      lines: [
        {
          id: "1",
          description: "Software Services",
          quantity: 1,
          ratePaise: rupeesToPaise(10000),
          gstRate: 18,
          taxTreatment: "taxable",
        },
      ],
    });

    expect(res.taxType).toBe("inter");
    expect(res.totals.taxablePaise).toBe(1000000);
    expect(res.totals.cgstPaise).toBe(0);
    expect(res.totals.sgstPaise).toBe(0);
    expect(res.totals.igstPaise).toBe(180000); // 1,800.00
    expect(res.totals.grandTotalPaise).toBe(1180000);
  });

  it("3. Rounding: 3 x 333.33 at 18% -> taxable 999.99, CGST 90.00, SGST 90.00, subtotal+tax 1,179.99, round-off +0.01, grand total 1,180.00", () => {
    const res = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      roundOffEnabled: true,
      lines: [
        {
          id: "1",
          description: "Items",
          quantity: 3,
          ratePaise: rupeesToPaise(333.33),
          gstRate: 18,
          taxTreatment: "taxable",
        },
      ],
    });

    expect(res.totals.taxablePaise).toBe(99999); // 999.99
    expect(res.totals.cgstPaise).toBe(9000); // 90.00
    expect(res.totals.sgstPaise).toBe(9000); // 90.00
    expect(res.totals.preRoundTotalPaise).toBe(117999); // 1,179.99
    expect(res.totals.roundOffPaise).toBe(1); // +0.01
    expect(res.totals.grandTotalPaise).toBe(118000); // 1,180.00
  });

  it("4. Tax-inclusive: 999.00 at 18% intra-state -> taxable 846.61, CGST 76.19, SGST 76.20, total exactly 999.00", () => {
    const res = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      pricesIncludeTax: true,
      lines: [
        {
          id: "1",
          description: "Design service (tax inclusive)",
          quantity: 1,
          ratePaise: rupeesToPaise(999.0),
          gstRate: 18,
          taxTreatment: "taxable",
        },
      ],
    });

    expect(res.totals.taxablePaise).toBe(84661); // 846.61
    expect(res.totals.cgstPaise).toBe(7619); // 76.19
    expect(res.totals.sgstPaise).toBe(7620); // 76.20
    expect(res.totals.totalTaxPaise).toBe(15239); // 152.39
    expect(res.totals.grandTotalPaise).toBe(99900); // exactly 999.00
  });

  it("5. Mixed rates: 1,000 at 5% and 2,000 at 18% intra-state -> tax 25.00+25.00 & 180.00+180.00, taxable 3,000.00, total 3,410.00, two rows in tax summary", () => {
    const res = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      lines: [
        {
          id: "1",
          description: "5% Goods",
          quantity: 1,
          ratePaise: rupeesToPaise(1000),
          gstRate: 5,
          taxTreatment: "taxable",
        },
        {
          id: "2",
          description: "18% Services",
          quantity: 1,
          ratePaise: rupeesToPaise(2000),
          gstRate: 18,
          taxTreatment: "taxable",
        },
      ],
    });

    expect(res.totals.taxablePaise).toBe(300000);
    expect(res.totals.cgstPaise).toBe(2500 + 18000); // 205.00
    expect(res.totals.sgstPaise).toBe(2500 + 18000); // 205.00
    expect(res.totals.grandTotalPaise).toBe(341000); // 3,410.00
    expect(res.taxSummaryByRate.length).toBe(2);

    const row5 = res.taxSummaryByRate.find((r) => r.gstRate === 5);
    expect(row5?.taxablePaise).toBe(100000);
    expect(row5?.cgstPaise).toBe(2500);
    expect(row5?.sgstPaise).toBe(2500);

    const row18 = res.taxSummaryByRate.find((r) => r.gstRate === 18);
    expect(row18?.taxablePaise).toBe(200000);
    expect(row18?.cgstPaise).toBe(18000);
    expect(row18?.sgstPaise).toBe(18000);
  });

  it("6. Invoice discount 300 over the two lines above -> line taxable 900 and 1,800, tax 45.00 and 324.00, total 3,069.00", () => {
    const res = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      invoiceDiscount: {
        mode: "amount",
        value: 300,
      },
      lines: [
        {
          id: "1",
          description: "5% Goods",
          quantity: 1,
          ratePaise: rupeesToPaise(1000),
          gstRate: 5,
          taxTreatment: "taxable",
        },
        {
          id: "2",
          description: "18% Services",
          quantity: 1,
          ratePaise: rupeesToPaise(2000),
          gstRate: 18,
          taxTreatment: "taxable",
        },
      ],
    });

    expect(res.lines[0].taxablePaise).toBe(90000); // 900.00
    expect(res.lines[1].taxablePaise).toBe(180000); // 1,800.00
    expect(res.lines[0].cgstPaise + res.lines[0].sgstPaise).toBe(4500); // 45.00
    expect(res.lines[1].cgstPaise + res.lines[1].sgstPaise).toBe(32400); // 324.00
    expect(res.totals.grandTotalPaise).toBe(306900); // 3,069.00
  });

  it("7. Pro-rata largest remainder: discount 100.00 over three equal lines of 1,000.00 -> 33.34, 33.33, 33.33 summing to 100.00", () => {
    const res = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      invoiceDiscount: {
        mode: "amount",
        value: 100,
      },
      lines: [
        { id: "1", description: "L1", quantity: 1, ratePaise: 100000, gstRate: 18 },
        { id: "2", description: "L2", quantity: 1, ratePaise: 100000, gstRate: 18 },
        { id: "3", description: "L3", quantity: 1, ratePaise: 100000, gstRate: 18 },
      ],
    });

    const d1 = res.lines[0].allocatedInvoiceDiscountPaise;
    const d2 = res.lines[1].allocatedInvoiceDiscountPaise;
    const d3 = res.lines[2].allocatedInvoiceDiscountPaise;

    expect(d1).toBe(3334); // 33.34
    expect(d2).toBe(3333); // 33.33
    expect(d3).toBe(3333); // 33.33
    expect(d1 + d2 + d3).toBe(10000); // 100.00
  });

  it("8. Advance: total 11,800.00 with advance 5,000.00 -> balance 6,800.00 and UPI amount 6800.00", () => {
    const res = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      advanceReceivedPaise: 500000, // 5,000.00
      lines: [
        {
          id: "1",
          description: "Service",
          quantity: 1,
          ratePaise: 1000000, // 10,000.00
          gstRate: 18,
        },
      ],
    });

    expect(res.totals.grandTotalPaise).toBe(1180000);
    expect(res.totals.advanceReceivedPaise).toBe(500000);
    expect(res.totals.balanceDuePaise).toBe(680000);

    const upi = buildUpiPayUrl({
      vpa: "test@upi",
      payeeName: "Freelancer",
      balanceDuePaise: res.totals.balanceDuePaise,
      invoiceNumber: "INV/26-27/0001",
    });
    expect(upi.isValid).toBe(true);
    expect(upi.upiUrl).toContain("am=6800.00");
  });

  it("9. Amount in words conversions", () => {
    expect(paiseToWords(0)).toBe("Rupees Zero Only");
    expect(paiseToWords(100)).toBe("Rupees One Only");
    expect(paiseToWords(9900)).toBe("Rupees Ninety-Nine Only");
    expect(paiseToWords(100000)).toBe("Rupees One Thousand Only");
    expect(paiseToWords(10000000)).toBe("Rupees One Lakh Only");
    expect(paiseToWords(12345650)).toBe(
      "Rupees One Lakh Twenty-Three Thousand Four Hundred Fifty-Six and Fifty Paise Only"
    );
    expect(paiseToWords(1)).toBe("One Paisa Only");
    expect(paiseToWords(50)).toBe("Fifty Paise Only");
  });

  it("10. GSTIN validation and checksum algorithm", () => {
    // Generate valid fixture
    const validGstin = createFixtureGstin("29", "ABCDE1234F", "1");
    const checkResult = validateGstin(validGstin);
    expect(checkResult.isValidFormat).toBe(true);
    expect(checkResult.checksumMatches).toBe(true);
    expect(checkResult.stateName).toBe("Karnataka");

    // Invalid length
    expect(validateGstin("29ABCDE1234F1Z").isValidFormat).toBe(false);

    // Invalid state code
    expect(validateGstin("99ABCDE1234F1Z5").isValidFormat).toBe(false);

    // Mistyped checksum
    const tampered = validGstin.slice(0, 14) + (validGstin[14] === "0" ? "1" : "0");
    const tamperedResult = validateGstin(tampered);
    expect(tamperedResult.isValidFormat).toBe(true);
    expect(tamperedResult.checksumMatches).toBe(false);
    expect(tamperedResult.warningMessage).toBeDefined();
  });

  it("11. UTGST used for UTs without legislature and SGST for UTs with legislature", () => {
    expect(isUnionTerritoryWithoutLegislature("04")).toBe(true); // Chandigarh
    expect(isUnionTerritoryWithoutLegislature("26")).toBe(true); // Dadra & Nagar Haveli
    expect(isUnionTerritoryWithoutLegislature("31")).toBe(true); // Lakshadweep
    expect(isUnionTerritoryWithoutLegislature("35")).toBe(true); // Andaman & Nicobar
    expect(isUnionTerritoryWithoutLegislature("38")).toBe(true); // Ladakh

    expect(isUnionTerritoryWithoutLegislature("07")).toBe(false); // Delhi (has legislature)
    expect(isUnionTerritoryWithoutLegislature("34")).toBe(false); // Puducherry (has legislature)
    expect(isUnionTerritoryWithoutLegislature("01")).toBe(false); // Jammu & Kashmir (has legislature)

    // Seller in Chandigarh billing Chandigarh -> UTGST
    const utRes = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "04",
      placeOfSupplyStateCode: "04",
      lines: [{ id: "1", description: "L", quantity: 1, ratePaise: 100000, gstRate: 18 }],
    });
    expect(utRes.totals.cgstPaise).toBe(9000);
    expect(utRes.totals.utgstPaise).toBe(9000);
    expect(utRes.totals.sgstPaise).toBe(0);
  });

  it("12. Financial Year numbering & format rules", () => {
    expect(getFinancialYear("2026-04-01")).toBe("26-27");
    expect(getFinancialYear("2026-10-09")).toBe("26-27");
    expect(getFinancialYear("2027-03-31")).toBe("26-27");
    expect(getFinancialYear("2027-04-01")).toBe("27-28");

    const invNum = formatInvoiceNumber("INV", "26-27", 1);
    expect(invNum).toBe("INV/26-27/0001");
    expect(validateInvoiceNumber(invNum).isValid).toBe(true);
    expect(invNum.length).toBeLessThanOrEqual(16);

    // Excess length check
    expect(validateInvoiceNumber("TOOLONGPREFIXTOOLONG/26-27/0001").isValid).toBe(false);
  });

  it("13. UPI VPA validation and pay URL generator", () => {
    expect(validateVpa("merchant@upi")).toBe(true);
    expect(validateVpa("name.kumar@okicici")).toBe(true);
    expect(validateVpa("invalid")).toBe(false);

    const upi = buildUpiPayUrl({
      vpa: "test@upi",
      payeeName: "Acme Agency",
      balanceDuePaise: 250000,
      invoiceNumber: "INV/26-27/0005",
    });

    expect(upi.isValid).toBe(true);
    expect(upi.upiUrl).toContain("pa=test%40upi");
    expect(upi.upiUrl).toContain("am=2500.00");
    expect(upi.upiUrl).toContain("cu=INR");
  });

  it("14. Document title logic across modes and line types", () => {
    // Unregistered -> INVOICE
    const unreg = calculateInvoice({
      supplierMode: "unregistered",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      lines: [{ id: "1", description: "A", quantity: 1, ratePaise: 1000, gstRate: 18 }],
    });
    expect(unreg.documentType).toBe("INVOICE");
    expect(unreg.totals.totalTaxPaise).toBe(0);

    // Composition -> BILL OF SUPPLY
    const comp = calculateInvoice({
      supplierMode: "composition",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      lines: [{ id: "1", description: "A", quantity: 1, ratePaise: 1000, gstRate: 18 }],
    });
    expect(comp.documentType).toBe("BILL OF SUPPLY");
    expect(comp.totals.totalTaxPaise).toBe(0);

    // Regular all taxable -> TAX INVOICE
    const regTaxable = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      lines: [{ id: "1", description: "A", quantity: 1, ratePaise: 1000, gstRate: 18, taxTreatment: "taxable" }],
    });
    expect(regTaxable.documentType).toBe("TAX INVOICE");

    // Regular all exempt -> BILL OF SUPPLY
    const regExempt = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      lines: [{ id: "1", description: "A", quantity: 1, ratePaise: 1000, gstRate: 0, taxTreatment: "exempt" }],
    });
    expect(regExempt.documentType).toBe("BILL OF SUPPLY");

    // Regular mixed -> INVOICE-CUM-BILL OF SUPPLY
    const regMixed = calculateInvoice({
      supplierMode: "regular",
      sellerStateCode: "29",
      placeOfSupplyStateCode: "29",
      lines: [
        { id: "1", description: "Taxable Item", quantity: 1, ratePaise: 1000, gstRate: 18, taxTreatment: "taxable" },
        { id: "2", description: "Exempt Item", quantity: 1, ratePaise: 500, gstRate: 0, taxTreatment: "exempt" },
      ],
    });
    expect(regMixed.documentType).toBe("INVOICE-CUM-BILL OF SUPPLY");
  });
});
