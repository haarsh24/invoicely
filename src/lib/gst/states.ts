/**
 * Indian GST State and Union Territory Codes
 * Verified against official GST Portal / CBIC specifications.
 */

export interface StateInfo {
  code: string;
  name: string;
  isUnionTerritoryWithoutLegislature: boolean;
}

export const GST_STATES: Record<string, string> = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "97": "Other Territory",
};

/**
 * Union Territories without their own legislature use UTGST instead of SGST.
 * 04: Chandigarh, 26: Dadra & Nagar Haveli & Daman & Diu, 31: Lakshadweep, 35: Andaman & Nicobar, 38: Ladakh.
 */
export const UT_WITHOUT_LEGISLATURE_CODES = new Set<string>([
  "04",
  "26",
  "31",
  "35",
  "38",
]);

/**
 * Union Territories with their own legislature have state-level GST law (SGST).
 * 01: Jammu and Kashmir, 07: Delhi, 34: Puducherry.
 */
export const UT_WITH_LEGISLATURE_CODES = new Set<string>(["01", "07", "34"]);

export function isUnionTerritoryWithoutLegislature(stateCode: string): boolean {
  return UT_WITHOUT_LEGISLATURE_CODES.has(stateCode);
}

export function getStateName(stateCode: string): string {
  return GST_STATES[stateCode] || `Unknown (${stateCode})`;
}

export function getStateLabel(stateCode: string): string {
  const name = GST_STATES[stateCode];
  return name ? `${name} (${stateCode})` : stateCode;
}

export const STATE_LIST: Array<{ code: string; name: string }> = Object.entries(GST_STATES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));
