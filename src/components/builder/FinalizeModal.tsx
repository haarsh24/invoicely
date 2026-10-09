import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Download,
  Share2,
  CheckCircle2,
  Plus,
  ArrowLeft,
  Printer,
  Copy,
  ExternalLink,
} from "lucide-react";
import type { InvoiceRecord } from "../../db/database";
import { calculateInvoice } from "../../lib/gst/tax";
import { downloadInvoicePdf, shareInvoicePdf } from "../../lib/pdf/generatePdf";
import { buildUpiPayUrl, generateUpiQrDataUrl } from "../../lib/upi";
import { InvoiceA4Preview } from "../invoice/InvoiceA4Preview";
import { APP_NAME } from "../../config/app";

interface Props {
  invoice: InvoiceRecord;
  onBackToInvoices: () => void;
  onCreateAnother: () => void;
}

export const FinalizeModal: React.FC<Props> = ({
  invoice,
  onBackToInvoices,
  onCreateAnother,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);

  const computed = calculateInvoice({
    supplierMode: invoice.sellerSnapshot.supplierMode,
    sellerStateCode: invoice.sellerSnapshot.stateCode,
    placeOfSupplyStateCode: invoice.placeOfSupplyStateCode,
    lines: invoice.lines,
    invoiceDiscount: invoice.invoiceDiscount,
    pricesIncludeTax: invoice.pricesIncludeTax,
    roundOffEnabled: invoice.roundOffEnabled,
    advanceReceivedPaise: invoice.advanceReceivedPaise,
  });

  useEffect(() => {
    // Fire celebratory confetti on finalize
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#2E6B57", "#7CC4A6", "#EBE5D7", "#D9A441"],
    });

    // Generate QR
    async function loadQr() {
      if (!invoice.sellerSnapshot.upiId || computed.totals.balanceDuePaise <= 0) return;
      const upi = buildUpiPayUrl({
        vpa: invoice.sellerSnapshot.upiId,
        payeeName: invoice.sellerSnapshot.upiPayeeName || invoice.sellerSnapshot.name,
        balanceDuePaise: computed.totals.balanceDuePaise,
        invoiceNumber: invoice.number,
      });
      if (upi.isValid && upi.upiUrl) {
        try {
          const url = await generateUpiQrDataUrl(upi.upiUrl, 240);
          setQrDataUrl(url);
        } catch (e) {
          console.error(e);
        }
      }
    }
    loadQr();
  }, [invoice, computed.totals.balanceDuePaise]);

  const handleDownload = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadInvoicePdf(invoice);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = async () => {
    setIsGeneratingPdf(true);
    try {
      await shareInvoicePdf(invoice);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Success banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#E2EEE8] dark:bg-[#233229] text-[#2E6B57] dark:text-[#7CC4A6] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1D1C1A] dark:text-[#EDEAE2]">
            Invoice {invoice.number} is ready!
          </h1>
          <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
            Statutory numbering has been permanently assigned and stored on your device.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            disabled={isGeneratingPdf}
            className="px-6 py-3 rounded-full bg-[#2E6B57] hover:bg-[#255746] dark:bg-[#7CC4A6] text-white dark:text-[#151613] font-semibold text-xs shadow-2xs hover:shadow transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? "Generating PDF..." : "Download PDF"}</span>
          </button>

          <button
            onClick={handleShare}
            disabled={isGeneratingPdf}
            className="px-5 py-3 rounded-full bg-[#EBE5D7] dark:bg-[#252622] hover:bg-[#E4DFD3] dark:hover:bg-[#2E2F2A] text-[#1D1C1A] dark:text-[#EDEAE2] font-semibold text-xs transition-all flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Sheet</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-3 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] text-[#1D1C1A] dark:text-[#EDEAE2] font-medium text-xs hover:bg-[#F5F2EB] dark:hover:bg-[#2E2F2A] transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>

        <div className="pt-3 flex items-center justify-center gap-4 text-xs">
          <button
            onClick={onCreateAnother}
            className="text-[#2E6B57] dark:text-[#7CC4A6] font-semibold hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create another invoice</span>
          </button>
          <span className="text-[#A29D92]">•</span>
          <button
            onClick={onBackToInvoices}
            className="text-[#6A665E] dark:text-[#A29D92] hover:text-[#1D1C1A] dark:hover:text-[#EDEAE2]"
          >
            Back to invoices list
          </button>
        </div>
      </div>

      {/* Rendered A4 Document for preview and PDF export */}
      <div className="bg-[#EBE5D7]/50 dark:bg-[#252622]/50 p-4 sm:p-8 rounded-3xl border border-[#E4DFD3] dark:border-[#2E2F2A] overflow-hidden flex justify-center">
        <div className="w-full max-w-[794px]">
          <InvoiceA4Preview
            invoice={invoice}
            computed={computed}
            qrDataUrl={qrDataUrl}
          />
        </div>
      </div>
    </div>
  );
};
