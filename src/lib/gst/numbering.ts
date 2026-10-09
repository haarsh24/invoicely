/**
 * Financial Year calculation and invoice numbering logic
 * Financial Year in India runs from April 1 to March 31.
 * Strict statutory limit: Invoice number must be <= 16 characters and contain only letters, digits, '/' or '-'.
 */

export const INVOICE_NUMBER_REGEX = /^[A-Za-z0-9/-]{1,16}$/;

/**
 * Calculates Indian Financial Year string (e.g., "26-27") for a given date.
 * If date is in Jan-Mar 2027 -> FY 26-27.
 * If date is in Apr-Dec 2026 -> FY 26-27.
 */
export function getFinancialYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed: 0 = Jan, 2 = Mar, 3 = Apr

  let startYear: number;
  let endYear: number;

  if (month < 3) {
    // Jan, Feb, Mar belong to previous calendar year's FY
    startYear = year - 1;
    endYear = year;
  } else {
    // Apr to Dec
    startYear = year;
    endYear = year + 1;
  }

  const startStr = (startYear % 100).toString().padStart(2, "0");
  const endStr = (endYear % 100).toString().padStart(2, "0");
  return `${startStr}-${endStr}`;
}

/**
 * Formats full invoice number from prefix, FY, and sequence number.
 * Example: prefix="INV", fy="26-27", seq=1 -> "INV/26-27/0001" (14 chars)
 */
export function formatInvoiceNumber(
  prefix: string = "INV",
  financialYear: string,
  sequenceNumber: number
): string {
  const cleanPrefix = (prefix || "INV").toUpperCase().replace(/[^A-Z0-9/-]/g, "");
  const seqStr = sequenceNumber.toString().padStart(4, "0");
  return `${cleanPrefix}/${financialYear}/${seqStr}`;
}

/**
 * Validates invoice number against legal constraints.
 */
export function validateInvoiceNumber(num: string): { isValid: boolean; error?: string } {
  if (!num || num.trim().length === 0) {
    return { isValid: false, error: "Invoice number is required" };
  }
  if (num.length > 16) {
    return {
      isValid: false,
      error: `Invoice number is ${num.length} characters (maximum allowed is 16 under GST rules)`,
    };
  }
  if (!INVOICE_NUMBER_REGEX.test(num)) {
    return {
      isValid: false,
      error: "Invoice numbers can only use letters, numbers, hyphen (-) and slash (/)",
    };
  }
  return { isValid: true };
}
