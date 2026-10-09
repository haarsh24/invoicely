/**
 * Pure Deterministic GST Invoicing Engine
 * No side effects, no Date.now, no I/O.
 * All monetary values in integer paise.
 */

import { roundHalfUp } from "./money";
import { isUnionTerritoryWithoutLegislature, getStateName } from "./states";
import { paiseToWords } from "./words";

export type SupplierMode = "regular" | "composition" | "unregistered";
export type TaxTreatment = "taxable" | "nil_rated" | "exempt" | "non_gst";
export type DiscountMode = "percent" | "amount";
export type TaxType = "intra" | "inter" | "none";
export type DocumentType =
  | "TAX INVOICE"
  | "BILL OF SUPPLY"
  | "INVOICE"
  | "INVOICE-CUM-BILL OF SUPPLY";

export interface DiscountInput {
  mode: DiscountMode;
  value: number; // percentage (e.g. 10 for 10%) or Rupee amount
}

export interface InvoiceLineInput {
  id: string;
  description: string;
  hsnSac?: string;
  unit?: string;
  quantity: number; // decimal (e.g. 1, 2.5, 3)
  ratePaise: number; // in integer paise
  discount?: DiscountInput;
  gstRate: number; // percent, e.g. 18, 5, 0
  taxTreatment?: TaxTreatment;
}

export interface InvoiceInput {
  supplierMode: SupplierMode;
  sellerStateCode: string;
  placeOfSupplyStateCode: string;
  lines: InvoiceLineInput[];
  invoiceDiscount?: DiscountInput;
  pricesIncludeTax?: boolean;
  roundOffEnabled?: boolean;
  advanceReceivedPaise?: number;
}

export interface ComputedLine {
  id: string;
  description: string;
  hsnSac?: string;
  unit: string;
  quantity: number;
  ratePaise: number;
  grossPaise: number;
  lineDiscountPaise: number;
  allocatedInvoiceDiscountPaise: number;
  totalDiscountPaise: number;
  taxablePaise: number;
  gstRate: number;
  taxTreatment: TaxTreatment;
  cgstPaise: number;
  sgstPaise: number;
  utgstPaise: number;
  igstPaise: number;
  taxTotalPaise: number;
  lineTotalPaise: number;
}

export interface TaxSummaryRow {
  gstRate: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  utgstPaise: number;
  igstPaise: number;
  totalTaxPaise: number;
}

export interface HsnSummaryRow {
  hsnSac: string;
  description?: string;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  utgstPaise: number;
  igstPaise: number;
  totalTaxPaise: number;
}

export interface InvoiceTotals {
  subtotalGrossPaise: number;
  totalDiscountPaise: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  utgstPaise: number;
  igstPaise: number;
  totalTaxPaise: number;
  preRoundTotalPaise: number;
  roundOffPaise: number;
  grandTotalPaise: number;
  advanceReceivedPaise: number;
  balanceDuePaise: number;
}

export interface InvoiceComputed {
  documentType: DocumentType;
  taxType: TaxType;
  isUnionTerritory: boolean;
  sellerStateName: string;
  placeOfSupplyStateName: string;
  lines: ComputedLine[];
  taxSummaryByRate: TaxSummaryRow[];
  hsnSummary: HsnSummaryRow[];
  totals: InvoiceTotals;
  amountInWords: string;
  plainLanguageExplanation: string;
  warnings: string[];
}

/**
 * Largest Remainder Method for pro-rata discount allocation
 */
function allocateDiscountProRata(
  totalDiscountPaise: number,
  lineBaseValues: number[]
): number[] {
  const sumBase = lineBaseValues.reduce((acc, v) => acc + v, 0);
  if (sumBase <= 0 || totalDiscountPaise <= 0) {
    return lineBaseValues.map(() => 0);
  }

  const cappedDiscount = Math.min(totalDiscountPaise, sumBase);
  const shares: number[] = [];
  const remainders: { index: number; remainder: number }[] = [];
  let allocatedSoFar = 0;

  for (let i = 0; i < lineBaseValues.length; i++) {
    const rawShare = (cappedDiscount * lineBaseValues[i]) / sumBase;
    const intShare = Math.floor(rawShare);
    shares.push(intShare);
    remainders.push({ index: i, remainder: rawShare - intShare });
    allocatedSoFar += intShare;
  }

  let remainingToDistribute = cappedDiscount - allocatedSoFar;
  // Sort descending by remainder, preserve index tie-break
  remainders.sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    return a.index - b.index;
  });

  for (let i = 0; i < remainingToDistribute; i++) {
    shares[remainders[i].index] += 1;
  }

  return shares;
}

/**
 * Determines statutory document title
 */
export function determineDocumentType(
  supplierMode: SupplierMode,
  lines: Array<{ taxTreatment?: TaxTreatment; gstRate: number }>
): DocumentType {
  if (supplierMode === "unregistered") {
    return "INVOICE";
  }
  if (supplierMode === "composition") {
    return "BILL OF SUPPLY";
  }

  if (lines.length === 0) {
    return "TAX INVOICE";
  }

  let hasTaxable = false;
  let hasNonTaxable = false;

  for (const line of lines) {
    const treatment = line.taxTreatment || "taxable";
    if (treatment === "taxable") {
      hasTaxable = true;
    } else {
      hasNonTaxable = true;
    }
  }

  if (hasTaxable && hasNonTaxable) {
    return "INVOICE-CUM-BILL OF SUPPLY";
  }
  if (hasTaxable && !hasNonTaxable) {
    return "TAX INVOICE";
  }
  return "BILL OF SUPPLY";
}

/**
 * Pure calculation function for an invoice.
 */
export function calculateInvoice(input: InvoiceInput): InvoiceComputed {
  const {
    supplierMode,
    sellerStateCode,
    placeOfSupplyStateCode,
    lines,
    invoiceDiscount,
    pricesIncludeTax = false,
    roundOffEnabled = false,
    advanceReceivedPaise = 0,
  } = input;

  const warnings: string[] = [];

  // 1. Determine tax jurisdiction
  let taxType: TaxType = "none";
  const isUnionTerritory = isUnionTerritoryWithoutLegislature(sellerStateCode);
  const sellerStateName = getStateName(sellerStateCode);
  const placeOfSupplyStateName = getStateName(placeOfSupplyStateCode);

  if (supplierMode === "regular") {
    if (sellerStateCode && placeOfSupplyStateCode) {
      if (sellerStateCode === placeOfSupplyStateCode) {
        taxType = "intra";
      } else {
        taxType = "inter";
      }
    } else {
      taxType = "intra"; // default
    }
  }

  if (supplierMode === "composition" && sellerStateCode !== placeOfSupplyStateCode) {
    warnings.push(
      "Composition scheme dealers generally cannot make inter-state supplies of goods. Please verify your tax eligibility."
    );
  }

  // 2. Step 1 of calculation: Compute gross and line discount for each line
  const preDiscountLineValues: number[] = [];
  const lineDrafts = lines.map((line) => {
    const qty = line.quantity > 0 ? line.quantity : 0;
    const rate = line.ratePaise >= 0 ? line.ratePaise : 0;
    const grossPaise = roundHalfUp(qty * rate);

    let lineDiscountPaise = 0;
    if (line.discount && line.discount.value > 0) {
      if (line.discount.mode === "percent") {
        lineDiscountPaise = roundHalfUp((grossPaise * line.discount.value) / 100);
      } else {
        lineDiscountPaise = roundHalfUp(line.discount.value * 100);
      }
      lineDiscountPaise = Math.min(grossPaise, Math.max(0, lineDiscountPaise));
    }

    const netBeforeInvoiceDiscount = grossPaise - lineDiscountPaise;
    preDiscountLineValues.push(netBeforeInvoiceDiscount);

    return {
      line,
      grossPaise,
      lineDiscountPaise,
      netBeforeInvoiceDiscount,
    };
  });

  // 3. Step 2: Pro-rata allocate invoice-level discount
  let totalInvoiceDiscountPaise = 0;
  const sumPreDiscount = preDiscountLineValues.reduce((a, b) => a + b, 0);

  if (invoiceDiscount && invoiceDiscount.value > 0 && sumPreDiscount > 0) {
    if (invoiceDiscount.mode === "percent") {
      totalInvoiceDiscountPaise = roundHalfUp(
        (sumPreDiscount * invoiceDiscount.value) / 100
      );
    } else {
      totalInvoiceDiscountPaise = roundHalfUp(invoiceDiscount.value * 100);
    }
    totalInvoiceDiscountPaise = Math.min(sumPreDiscount, Math.max(0, totalInvoiceDiscountPaise));
  }

  const allocatedInvoiceDiscounts = allocateDiscountProRata(
    totalInvoiceDiscountPaise,
    preDiscountLineValues
  );

  // 4. Step 3 & 4: Compute taxable value and tax per line
  const computedLines: ComputedLine[] = lineDrafts.map((draft, idx) => {
    const { line, grossPaise, lineDiscountPaise, netBeforeInvoiceDiscount } = draft;
    const allocatedInvoiceDiscountPaise = allocatedInvoiceDiscounts[idx];
    const totalDiscountPaise = lineDiscountPaise + allocatedInvoiceDiscountPaise;
    const netBasePaise = netBeforeInvoiceDiscount - allocatedInvoiceDiscountPaise;

    const treatment: TaxTreatment = line.taxTreatment || "taxable";
    const gstRate = line.gstRate >= 0 ? line.gstRate : 0;

    let taxablePaise = 0;
    let cgstPaise = 0;
    let sgstPaise = 0;
    let utgstPaise = 0;
    let igstPaise = 0;
    let taxTotalPaise = 0;
    let lineTotalPaise = 0;

    const isTaxApplicable =
      supplierMode === "regular" && treatment === "taxable" && gstRate > 0;

    if (pricesIncludeTax && isTaxApplicable) {
      // Tax-inclusive math:
      // taxable = round_half_up(inclusiveAmount * 100 / (100 + rate))
      // taxTotal = inclusiveAmount - taxable
      const inclusiveAmount = netBasePaise;
      taxablePaise = roundHalfUp((inclusiveAmount * 100) / (100 + gstRate));
      taxTotalPaise = inclusiveAmount - taxablePaise;

      if (taxType === "intra") {
        const half = Math.floor(taxTotalPaise / 2);
        const secondHalf = taxTotalPaise - half;
        cgstPaise = half;
        if (isUnionTerritory) {
          utgstPaise = secondHalf;
        } else {
          sgstPaise = secondHalf;
        }
      } else if (taxType === "inter") {
        igstPaise = taxTotalPaise;
      }
      lineTotalPaise = inclusiveAmount;
    } else {
      // Tax-exclusive math
      taxablePaise = netBasePaise;

      if (isTaxApplicable) {
        if (taxType === "intra") {
          // Both halves are round(taxable * (rate / 2) / 100)
          const halfRate = gstRate / 2;
          const halfTax = roundHalfUp((taxablePaise * halfRate) / 100);
          cgstPaise = halfTax;
          if (isUnionTerritory) {
            utgstPaise = halfTax;
          } else {
            sgstPaise = halfTax;
          }
          taxTotalPaise = cgstPaise + (isUnionTerritory ? utgstPaise : sgstPaise);
        } else if (taxType === "inter") {
          igstPaise = roundHalfUp((taxablePaise * gstRate) / 100);
          taxTotalPaise = igstPaise;
        }
      }

      lineTotalPaise = taxablePaise + taxTotalPaise;
    }

    return {
      id: line.id,
      description: line.description,
      hsnSac: line.hsnSac,
      unit: line.unit || "NOS",
      quantity: line.quantity,
      ratePaise: line.ratePaise,
      grossPaise,
      lineDiscountPaise,
      allocatedInvoiceDiscountPaise,
      totalDiscountPaise,
      taxablePaise,
      gstRate,
      taxTreatment: treatment,
      cgstPaise,
      sgstPaise,
      utgstPaise,
      igstPaise,
      taxTotalPaise,
      lineTotalPaise,
    };
  });

  // 5. Aggregate totals
  const subtotalGrossPaise = computedLines.reduce((s, l) => s + l.grossPaise, 0);
  const totalDiscountPaise = computedLines.reduce((s, l) => s + l.totalDiscountPaise, 0);
  const taxablePaise = computedLines.reduce((s, l) => s + l.taxablePaise, 0);
  const cgstPaise = computedLines.reduce((s, l) => s + l.cgstPaise, 0);
  const sgstPaise = computedLines.reduce((s, l) => s + l.sgstPaise, 0);
  const utgstPaise = computedLines.reduce((s, l) => s + l.utgstPaise, 0);
  const igstPaise = computedLines.reduce((s, l) => s + l.igstPaise, 0);
  const totalTaxPaise = cgstPaise + sgstPaise + utgstPaise + igstPaise;
  const preRoundTotalPaise = taxablePaise + totalTaxPaise;

  // 6. Round off
  let roundOffPaise = 0;
  let grandTotalPaise = preRoundTotalPaise;

  if (roundOffEnabled) {
    const nearestRupeePaise = roundHalfUp(preRoundTotalPaise / 100) * 100;
    roundOffPaise = nearestRupeePaise - preRoundTotalPaise;
    grandTotalPaise = nearestRupeePaise;
  }

  const safeAdvance = Math.max(0, advanceReceivedPaise);
  const balanceDuePaise = grandTotalPaise - safeAdvance;

  const totals: InvoiceTotals = {
    subtotalGrossPaise,
    totalDiscountPaise,
    taxablePaise,
    cgstPaise,
    sgstPaise,
    utgstPaise,
    igstPaise,
    totalTaxPaise,
    preRoundTotalPaise,
    roundOffPaise,
    grandTotalPaise,
    advanceReceivedPaise: safeAdvance,
    balanceDuePaise,
  };

  // 7. Tax summary grouped by GST Rate
  const rateMap = new Map<number, TaxSummaryRow>();
  for (const line of computedLines) {
    const r = line.gstRate;
    const existing = rateMap.get(r) || {
      gstRate: r,
      taxablePaise: 0,
      cgstPaise: 0,
      sgstPaise: 0,
      utgstPaise: 0,
      igstPaise: 0,
      totalTaxPaise: 0,
    };
    existing.taxablePaise += line.taxablePaise;
    existing.cgstPaise += line.cgstPaise;
    existing.sgstPaise += line.sgstPaise;
    existing.utgstPaise += line.utgstPaise;
    existing.igstPaise += line.igstPaise;
    existing.totalTaxPaise += line.taxTotalPaise;
    rateMap.set(r, existing);
  }
  const taxSummaryByRate = Array.from(rateMap.values()).sort(
    (a, b) => a.gstRate - b.gstRate
  );

  // 8. HSN Summary
  const hsnMap = new Map<string, HsnSummaryRow>();
  for (const line of computedLines) {
    if (line.hsnSac) {
      const code = line.hsnSac.trim();
      const existing = hsnMap.get(code) || {
        hsnSac: code,
        description: line.description,
        taxablePaise: 0,
        cgstPaise: 0,
        sgstPaise: 0,
        utgstPaise: 0,
        igstPaise: 0,
        totalTaxPaise: 0,
      };
      existing.taxablePaise += line.taxablePaise;
      existing.cgstPaise += line.cgstPaise;
      existing.sgstPaise += line.sgstPaise;
      existing.utgstPaise += line.utgstPaise;
      existing.igstPaise += line.igstPaise;
      existing.totalTaxPaise += line.taxTotalPaise;
      hsnMap.set(code, existing);
    }
  }
  const hsnSummary = Array.from(hsnMap.values());

  // 9. Document type
  const documentType = determineDocumentType(
    supplierMode,
    lines.map((l) => ({ taxTreatment: l.taxTreatment, gstRate: l.gstRate }))
  );

  // 10. Plain language explainer
  let plainLanguageExplanation = "";
  if (supplierMode === "unregistered") {
    plainLanguageExplanation = "Supplier is not registered under GST, so no tax is added.";
  } else if (supplierMode === "composition") {
    plainLanguageExplanation =
      "Composition taxable person: Not eligible to collect tax from customer.";
  } else if (taxType === "intra") {
    const taxPart = isUnionTerritory ? "CGST + UTGST" : "CGST + SGST";
    plainLanguageExplanation = `Intra-state supply (${sellerStateName}): ${taxPart} applies equally.`;
  } else if (taxType === "inter") {
    plainLanguageExplanation = `Inter-state supply (From ${sellerStateName} to ${placeOfSupplyStateName}): Integrated GST (IGST) applies.`;
  }

  const amountInWords = paiseToWords(grandTotalPaise);

  return {
    documentType,
    taxType,
    isUnionTerritory,
    sellerStateName,
    placeOfSupplyStateName,
    lines: computedLines,
    taxSummaryByRate,
    hsnSummary,
    totals,
    amountInWords,
    plainLanguageExplanation,
    warnings,
  };
}
