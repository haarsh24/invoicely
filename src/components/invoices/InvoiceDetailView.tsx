import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { InvoiceRecord } from "../../db/database";
import { calculateInvoice } from "../../lib/gst/tax";
import { downloadInvoicePdf, shareInvoicePdf } from "../../lib/pdf/generatePdf";
import { buildUpiPayUrl, generateUpiQrDataUrl } from "../../lib/upi";
import { InvoiceA4Preview } from "../invoice/InvoiceA4Preview";

interface Props {
  invoice: InvoiceRecord;
  onBack: () => void;
  onDuplicate: (inv: InvoiceRecord) => void;
  onCancel: (id: string, reason: string) => Promise<void>;
  onMarkPaid: (id: string) => Promise<void>;
}

export const InvoiceDetailView: React.FC<Props> = ({
  invoice,
  onBack,
  onDuplicate,
  onCancel,
  onMarkPaid,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

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
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = async () => {
    setIsGeneratingPdf(true);
    try {
      await shareInvoicePdf(invoice);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1E1F1B] p-4 rounded-2xl border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6A665E] dark:text-[#A29D92] hover:text-[#1D1C1A] dark:hover:text-[#EDEAE2]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isGeneratingPdf}
            className="px-4 py-2 rounded-full bg-[#2E6B57] dark:bg-[#7CC4A6] text-white dark:text-[#151613] text-xs font-semibold shadow-2xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? "PDF..." : "Download PDF"}</span>
          </button>

          <button
            onClick={handleShare}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F5F2EB] dark:hover:bg-[#2E2F2A]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F5F2EB] dark:hover:bg-[#2E2F2A]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={() => onDuplicate(invoice)}
            className="px-3.5 py-2 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F5F2EB] dark:hover:bg-[#2E2F2A]"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate Draft</span>
          </button>

          {invoice.status === "issued" && (
            <button
              onClick={() => onMarkPaid(invoice.id)}
              className="px-3.5 py-2 rounded-full bg-[#E2EEE8] dark:bg-[#233229] text-[#2E7D5B] dark:text-[#6FC49B] text-xs font-semibold flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Paid</span>
            </button>
          )}

          {invoice.status !== "cancelled" && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-3.5 py-2 rounded-full border border-[#B4432F]/30 text-[#B4432F] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#FDE8E5] dark:hover:bg-[#341B18]"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice A4 Sheet */}
      <div className="bg-[#EBE5D7]/50 dark:bg-[#252622]/50 p-4 sm:p-8 rounded-3xl border border-[#E4DFD3] dark:border-[#2E2F2A] overflow-hidden flex justify-center">
        <div className="w-full max-w-[794px]">
          <InvoiceA4Preview
            invoice={invoice}
            computed={computed}
            qrDataUrl={qrDataUrl}
          />
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F1B] rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#FDE8E5] text-[#B4432F] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-[#1D1C1A] dark:text-[#EDEAE2]">
                Cancel Invoice {invoice.number}?
              </h3>
              <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
                Under GST rules, issued invoice numbers cannot be deleted or re-used. Cancelling will watermark the invoice as CANCELLED and preserve the serial number.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Cancellation Reason</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Order cancelled by client"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs font-semibold"
              >
                Keep Invoice
              </button>
              <button
                onClick={async () => {
                  await onCancel(invoice.id, cancelReason);
                  setCancelModalOpen(false);
                }}
                className="px-4 py-2 rounded-full bg-[#B4432F] text-white text-xs font-semibold"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
