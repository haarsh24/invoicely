/**
 * GSTIN (Goods and Services Tax Identification Number) Validation and Extraction
 * Strictly follows CBIC/GST portal specifications.
 */

import { GST_STATES } from "./states";

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const CHAR_SET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Character to value (0-9 -> 0-9, A-Z -> 10-35)
 */
function charToValue(c: string): number {
  const code = c.charCodeAt(0);
  if (code >= 48 && code <= 57) {
    return code - 48; // '0'-'9'
  }
  if (code >= 65 && code <= 90) {
    return code - 55; // 'A'-'Z' (A=10, Z=35)
  }
  return 0;
}

function valueToChar(val: number): string {
  if (val >= 0 && val <= 9) {
    return String.fromCharCode(48 + val);
  }
  if (val >= 10 && val <= 35) {
    return String.fromCharCode(55 + val);
  }
  return "0";
}

/**
 * Computes the 15th checksum character for the first 14 characters of a GSTIN.
 * Modulo 36 algorithm with alternating 1 and 2 multipliers.
 */
export function calculateGstinChecksum(first14: string): string {
  if (first14.length < 14) return "";
  const str = first14.slice(0, 14).toUpperCase();
  let sum = 0;

  for (let i = 0; i < 14; i++) {
    const val = charToValue(str[i]);
    const multiplier = (i + 1) % 2 === 1 ? 1 : 2; // position 1-based: odd=1, even=2
    const product = val * multiplier;
    const quotient = Math.floor(product / 36);
    const remainder = product % 36;
    sum += quotient + remainder;
  }

  const checkValue = (36 - (sum % 36)) % 36;
  return valueToChar(checkValue);
}

export interface GstinValidationResult {
  isValidFormat: boolean;
  stateCode: string | null;
  stateName: string | null;
  pan: string | null;
  entityNumber: string | null;
  checksumMatches: boolean;
  expectedChecksum: string | null;
  errorMessage?: string;
  warningMessage?: string;
}

/**
 * Normalizes input: uppercase, trims whitespace and dashes
 */
export function normalizeGstin(input: string): string {
  return (input || "").toUpperCase().replace(/[\s-]/g, "");
}

/**
 * Validates a GSTIN and returns structured info with soft warnings.
 */
export function validateGstin(rawGstin: string): GstinValidationResult {
  const gstin = normalizeGstin(rawGstin);

  if (!gstin) {
    return {
      isValidFormat: false,
      stateCode: null,
      stateName: null,
      pan: null,
      entityNumber: null,
      checksumMatches: false,
      expectedChecksum: null,
    };
  }

  if (gstin.length !== 15) {
    return {
      isValidFormat: false,
      stateCode: gstin.length >= 2 ? gstin.slice(0, 2) : null,
      stateName: null,
      pan: null,
      entityNumber: null,
      checksumMatches: false,
      expectedChecksum: null,
      errorMessage: "GSTIN must be exactly 15 characters long",
    };
  }

  const stateCode = gstin.slice(0, 2);
  const stateName = GST_STATES[stateCode] || null;
  if (!stateName) {
    return {
      isValidFormat: false,
      stateCode,
      stateName: null,
      pan: null,
      entityNumber: null,
      checksumMatches: false,
      expectedChecksum: null,
      errorMessage: `First 2 digits (${stateCode}) do not match any known GST state code`,
    };
  }

  if (!GSTIN_REGEX.test(gstin)) {
    return {
      isValidFormat: false,
      stateCode,
      stateName,
      pan: gstin.slice(2, 12),
      entityNumber: gstin[12],
      checksumMatches: false,
      expectedChecksum: null,
      errorMessage: "GSTIN format is invalid (should be 2 digits, 10-char PAN, 1 entity code, 'Z', 1 check character)",
    };
  }

  const pan = gstin.slice(2, 12);
  const entityNumber = gstin[12];
  const expectedChecksum = calculateGstinChecksum(gstin.slice(0, 14));
  const actualChecksum = gstin[14];
  const checksumMatches = actualChecksum === expectedChecksum;

  return {
    isValidFormat: true,
    stateCode,
    stateName,
    pan,
    entityNumber,
    checksumMatches,
    expectedChecksum,
    warningMessage: checksumMatches
      ? undefined
      : `This GSTIN looks mistyped, please double-check (check character is '${actualChecksum}', calculated '${expectedChecksum}')`,
  };
}

/**
 * Creates a valid mock GSTIN for testing given a state code, PAN and entity number.
 */
export function createFixtureGstin(stateCode: string, pan: string, entityNumber: string = "1"): string {
  const base = `${stateCode}${pan.toUpperCase()}${entityNumber}Z`;
  const checksum = calculateGstinChecksum(base);
  return `${base}${checksum}`;
}
