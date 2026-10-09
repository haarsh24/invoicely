/**
 * UPI QR Code and Payment Deep Link Utilities
 * Adheres strictly to NPCI UPI Linking Specifications.
 */

import QRCode from "qrcode";
import { formatPaise } from "./gst/money";

export const VPA_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;
export const UPI_HIGH_VALUE_THRESHOLD_PAISE = 10000000; // 1,00,000 INR

export interface UpiPayloadParams {
  vpa: string;
  payeeName: string;
  balanceDuePaise: number;
  invoiceNumber?: string;
  customNote?: string;
}

export interface UpiResult {
  isValid: boolean;
  upiUrl?: string;
  error?: string;
  warning?: string;
  formattedAmount: string;
  balanceDuePaise: number;
}

/**
 * Validates UPI Virtual Payment Address (VPA)
 */
export function validateVpa(vpa: string): boolean {
  if (!vpa) return false;
  const clean = vpa.trim();
  return VPA_REGEX.test(clean);
}

/**
 * Builds the canonical `upi://pay` deep link URL.
 * Example: upi://pay?pa=name@okaxis&pn=John%20Doe&am=1180.00&cu=INR&tn=Invoice%20INV%2F26-27%2F0001
 */
export function buildUpiPayUrl(params: UpiPayloadParams): UpiResult {
  const { vpa, payeeName, balanceDuePaise, invoiceNumber, customNote } = params;
  const cleanVpa = (vpa || "").trim();

  if (!validateVpa(cleanVpa)) {
    return {
      isValid: false,
      error: "Invalid UPI ID. Format should be user@bank (e.g. yourname@okhdfcbank)",
      formattedAmount: formatPaise(balanceDuePaise, true),
      balanceDuePaise,
    };
  }

  if (balanceDuePaise <= 0) {
    return {
      isValid: false,
      error: "Balance due is zero or negative. No payment request needed.",
      formattedAmount: formatPaise(balanceDuePaise, true),
      balanceDuePaise,
    };
  }

  const amountRupees = (balanceDuePaise / 100).toFixed(2);
  const cleanPayee = (payeeName || "Merchant").trim();

  // Note: max 50 chars, alphanumeric + space + safe punctuation
  const rawNote = customNote || (invoiceNumber ? `Invoice ${invoiceNumber}` : "Payment for Invoice");
  const sanitizedNote = rawNote.replace(/[^a-zA-Z0-9 -/.]/g, "").slice(0, 50).trim();

  const queryParams = new URLSearchParams({
    pa: cleanVpa,
    pn: cleanPayee,
    am: amountRupees,
    cu: "INR",
    tn: sanitizedNote,
  });

  const upiUrl = `upi://pay?${queryParams.toString()}`;

  let warning: string | undefined;
  if (balanceDuePaise > UPI_HIGH_VALUE_THRESHOLD_PAISE) {
    warning = "UPI limits can apply depending on the bank and payment type (usually ₹1,00,000 for P2P/P2M).";
  }

  return {
    isValid: true,
    upiUrl,
    warning,
    formattedAmount: formatPaise(balanceDuePaise, true),
    balanceDuePaise,
  };
}

/**
 * Generates QR Code data URL asynchronously (PNG image data URL)
 * Uses Error Correction Level 'M' as specified.
 */
export async function generateUpiQrDataUrl(upiUrl: string, size: number = 240): Promise<string> {
  try {
    return await QRCode.toDataURL(upiUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: size,
      color: {
        dark: "#1D1C1A",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Error generating UPI QR code:", err);
    throw err;
  }
}
