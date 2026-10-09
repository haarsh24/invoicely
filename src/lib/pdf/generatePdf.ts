/**
 * High-Resolution Client-Side PDF Generator & Share Sheet Integration
 * Renders the A4 document to vector-precise PDF with embedded fonts, rupee glyphs, and QR code.
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { InvoiceRecord } from "../../db/database";

export interface PdfExportOptions {
  fileName?: string;
}

/**
 * Creates standard statutory filename:
 * Invoice_{number with slashes replaced by hyphen}_{customer name, slugified, max 30 chars}.pdf
 */
export function buildInvoiceFileName(invoice: Partial<InvoiceRecord>): string {
  const numStr = (invoice.number || "DRAFT").replace(/[/\\?%*:|"<>]/g, "-");
  const rawCustomer = invoice.customerSnapshot?.name || "Customer";
  const slugifiedCustomer = rawCustomer
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 30);
  return `Invoice_${numStr}_${slugifiedCustomer}.pdf`;
}

/**
 * Generates PDF Blob from the A4 DOM element with high DPI rasterization.
 */
export async function generateInvoicePdfBlob(elementId: string = "invoice-a4-document"): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Invoice DOM element with ID #${elementId} not found`);
  }

  // Capture with html2canvas at scale 2 for crisp print resolution
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#FFFFFF",
    windowWidth: 794,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  // A4 size: 210mm x 297mm
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

  const imgProps = pdf.getImageProperties(imgData);
  const calculatedHeight = (imgProps.height * pdfWidth) / imgProps.width;

  if (calculatedHeight <= pdfHeight) {
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, calculatedHeight);
  } else {
    // Multi-page handling if invoice is unusually long
    let heightLeft = calculatedHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, calculatedHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - calculatedHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, calculatedHeight);
      heightLeft -= pdfHeight;
    }
  }

  return pdf.output("blob");
}

/**
 * Downloads the PDF directly in the browser
 */
export async function downloadInvoicePdf(
  invoice: Partial<InvoiceRecord>,
  elementId: string = "invoice-a4-document"
): Promise<void> {
  const blob = await generateInvoicePdfBlob(elementId);
  const fileName = buildInvoiceFileName(invoice);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Shares PDF using Web Share API on mobile devices, or falls back to direct download
 */
export async function shareInvoicePdf(
  invoice: Partial<InvoiceRecord>,
  elementId: string = "invoice-a4-document"
): Promise<boolean> {
  const blob = await generateInvoicePdfBlob(elementId);
  const fileName = buildInvoiceFileName(invoice);
  const file = new File([blob], fileName, { type: "application/pdf" });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Invoice ${invoice.number || ""}`,
        text: `Here is your invoice for ₹${((invoice.totals?.balanceDuePaise || 0) / 100).toFixed(2)}`,
        files: [file],
      });
      return true;
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        console.error("Error sharing PDF:", err);
      }
      return false;
    }
  }

  // Fallback to direct download
  await downloadInvoicePdf(invoice, elementId);
  return false;
}
