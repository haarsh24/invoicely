/**
 * Indian Numbering System Amount In Words
 * Formats Rupee amounts into Words (Crores, Lakhs, Thousands, Hundreds).
 * Example: 1,23,456.50 -> "Rupees One Lakh Twenty-Three Thousand Four Hundred Fifty-Six and Fifty Paise Only"
 */

const ONES: string[] = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS: string[] = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigitsToWords(n: number): string {
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return one > 0 ? `${TENS[ten]}-${ONES[one]}` : TENS[ten];
}

function threeDigitsToWords(n: number): string {
  const hundred = Math.floor(n / 100);
  const rem = n % 100;
  const parts: string[] = [];

  if (hundred > 0) {
    parts.push(`${ONES[hundred]} Hundred`);
  }
  if (rem > 0) {
    parts.push(twoDigitsToWords(rem));
  }
  return parts.join(" ");
}

/**
 * Converts integer rupees to Indian wording.
 * Slices: Crores (10^7), Lakhs (10^5), Thousands (10^3), Hundreds (10^0).
 */
export function integerRupeesToWords(rupees: number): string {
  if (rupees === 0) return "Zero";
  if (rupees < 0) return `Minus ${integerRupeesToWords(Math.abs(rupees))}`;

  let num = Math.floor(rupees);
  const parts: string[] = [];

  const crores = Math.floor(num / 10000000);
  num %= 10000000;

  const lakhs = Math.floor(num / 100000);
  num %= 100000;

  const thousands = Math.floor(num / 1000);
  num %= 1000;

  const remainder = num;

  if (crores > 0) {
    parts.push(`${integerRupeesToWords(crores)} Crore`);
  }
  if (lakhs > 0) {
    parts.push(`${twoDigitsToWords(lakhs)} Lakh`);
  }
  if (thousands > 0) {
    parts.push(`${twoDigitsToWords(thousands)} Thousand`);
  }
  if (remainder > 0) {
    parts.push(threeDigitsToWords(remainder));
  }

  return parts.join(" ").trim();
}

/**
 * Converts integer paise into Indian currency words.
 * Handles singular 'One Paisa' vs plural 'Fifty Paise', and zero paise cleanly.
 */
export function paiseToWords(totalPaise: number): string {
  if (totalPaise === 0) return "Rupees Zero Only";

  const isNegative = totalPaise < 0;
  const absPaise = Math.abs(totalPaise);

  const rupees = Math.floor(absPaise / 100);
  const paise = absPaise % 100;

  const rupeeWords = rupees > 0 ? integerRupeesToWords(rupees) : (paise > 0 ? "" : "Zero");
  let result = "";

  if (isNegative) {
    result += "Minus ";
  }

  if (rupees > 0) {
    result += `Rupees ${rupeeWords}`;
  }

  if (paise > 0) {
    const paiseWords = twoDigitsToWords(paise);
    const paiseLabel = paise === 1 ? "Paisa" : "Paise";
    if (rupees > 0) {
      result += ` and ${paiseWords} ${paiseLabel}`;
    } else {
      result += `${paiseWords} ${paiseLabel}`;
    }
  }

  return `${result.trim()} Only`;
}
