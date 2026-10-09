/**
 * GST Rate configurations and standard presets
 * Reflects reform changes in effect since 22 Sep 2025:
 * Standard slabs: 0%, 5%, 18%, 40% (older 12% and 28% mostly collapsed).
 */

export interface GstRateOption {
  rate: number;
  label: string;
  isStandard: boolean;
  effectiveFrom?: string;
  description?: string;
}

export const STANDARD_GST_RATES: number[] = [0, 5, 18, 40];
export const DEFAULT_GST_RATE = 18;

export const GST_RATE_OPTIONS: GstRateOption[] = [
  { rate: 0, label: "0% (Nil / Essential)", isStandard: true },
  { rate: 5, label: "5% (Basic goods & hospitality)", isStandard: true },
  { rate: 18, label: "18% (Standard services & goods - Default)", isStandard: true },
  { rate: 40, label: "40% (Special luxury & sin items)", isStandard: true },
];

export const SPECIAL_RATES_VERIFY = [0.25, 3]; // Precious stones, gold jewelry (VERIFY)

export const RATE_HELP_TEXT = "Not sure which rate applies? Check the official GST rate list or ask your CA.";

export const COMMON_HSN_SAC_PRESETS = [
  { code: "998314", label: "IT design and website development services" },
  { code: "998313", label: "IT consulting and support services" },
  { code: "998391", label: "Specialty design services (graphic, UI/UX)" },
  { code: "998361", label: "Advertising and digital marketing services" },
  { code: "998311", label: "Management consulting services" },
  { code: "999293", label: "Commercial training and coaching" },
  { code: "998222", label: "Accounting, auditing and bookkeeping services" },
  { code: "998399", label: "Other professional, technical and business services" },
];

export const STANDARD_UNITS = [
  { code: "NOS", label: "NOS (Numbers)" },
  { code: "PCS", label: "PCS (Pieces)" },
  { code: "HRS", label: "HRS (Hours)" },
  { code: "DAY", label: "DAY (Days)" },
  { code: "MONTH", label: "MONTH (Months)" },
  { code: "PROJECT", label: "PROJECT (Fixed scope)" },
  { code: "SET", label: "SET (Sets)" },
  { code: "BOX", label: "BOX (Boxes)" },
  { code: "PAC", label: "PAC (Packs)" },
  { code: "KGS", label: "KGS (Kilograms)" },
  { code: "GMS", label: "GMS (Grams)" },
  { code: "LTR", label: "LTR (Litres)" },
  { code: "MTR", label: "MTR (Metres)" },
  { code: "DOZ", label: "DOZ (Dozens)" },
  { code: "OTH", label: "OTH (Other / Custom)" },
];

/**
 * Validates a custom GST rate (0 to 100 with max 3 decimals).
 */
export function isValidGstRate(rate: number): boolean {
  return typeof rate === "number" && !isNaN(rate) && rate >= 0 && rate <= 100;
}
