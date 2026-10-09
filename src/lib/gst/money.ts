/**
 * Money and Paise helper utilities
 * All monetary calculations inside Invoicely use integer paise to avoid IEEE-754 floating point inaccuracies.
 */

/**
 * Standard ROUND_HALF_UP rounding to nearest integer.
 * e.g., 1.5 -> 2, -1.5 -> -1, 1.49 -> 1.
 */
export function roundHalfUp(value: number): number {
  if (value >= 0) {
    return Math.floor(value + 0.5);
  } else {
    return Math.ceil(value - 0.5);
  }
}

/**
 * Converts Rupees (decimal) to integer Paise.
 */
export function rupeesToPaise(rupees: number): number {
  return roundHalfUp(rupees * 100);
}

/**
 * Converts integer Paise to Rupees (float).
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Formats integer paise into Indian currency notation (e.g., 1,23,456.50)
 * Uses en-IN locale with exactly 2 decimal places.
 */
export function formatPaise(paise: number, includeSymbol: boolean = false): string {
  const rupees = paise / 100;
  const formatted = Math.abs(rupees).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = paise < 0 ? "-" : "";
  const symbol = includeSymbol ? "₹" : "";
  return `${sign}${symbol}${formatted}`;
}

/**
 * Parse input string or number to integer paise safely.
 */
export function parseRupeesToPaise(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val.toString().replace(/,/g, ""));
  if (isNaN(num)) return 0;
  return rupeesToPaise(num);
}
