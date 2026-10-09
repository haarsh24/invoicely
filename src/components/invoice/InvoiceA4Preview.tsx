/**
 * High-Fidelity A4 Paper-Like Invoice Preview Component
 * Shared identically between live on-screen preview, print view, and PDF export.
 */

import React from "react";
import type { InvoiceRecord, BusinessProfile, Customer } from "../../db/database";
import type { InvoiceComputed } from "../../lib/gst/tax";
import { formatPaise } from "../../lib/gst/money";
import { getStateLabel } from "../../lib/gst/states";
import { APP_NAME } from "../../config/app";
import { isPro } from "../../features/pro";

interface Props {
  invoice: Partial<InvoiceRecord>;
  computed: InvoiceComputed;
  qrDataUrl?: string;
  isPdfRendering?: boolean;
}

export const InvoiceA4Preview: React.FC<Props> = ({
  invoice,
  computed,
  qrDataUrl,
  isPdfRendering = false,
}) => {
  const seller: Partial<BusinessProfile> = invoice.sellerSnapshot || {
    name: "Your Business Name",
    supplierMode: "regular",
    addressLine1: "Street address",
    city: "City",
    stateCode: "29",
    pincode: "560001",
    accentColor: "#2E6B57",
    showHsnColumn: true,
  };

  const customer: Partial<Customer> = invoice.customerSnapshot || {
    name: "Customer Name",
    isBusiness: false,
    addressLine1: "",
    city: "",
    stateCode: invoice.placeOfSupplyStateCode || "29",
    pincode: "",
  };

  const isComposition = seller.supplierMode === "composition";
  const isUnregistered = seller.supplierMode === "unregistered";
  const isTaxApplicable = seller.supplierMode === "regular";
  const accentColor = seller.accentColor || "#2E6B57";
  const proUser = isPro();

  return (
    <div
      id="invoice-a4-document"
      className={`bg-white text-[#1D1C1A] font-sans mx-auto transition-all relative ${
        isPdfRendering
          ? "w-[794px] p-8 shadow-none"
          : "w-full max-w-[794px] p-4 sm:p-8 md:p-10 shadow-sm border border-[#E4DFD3] rounded-2xl print:border-none print:shadow-none print:p-0 print:max-w-none"
      }`}
      style={{
        boxSizing: "border-box",
        minHeight: isPdfRendering ? "1123px" : "auto",
        backgroundColor: "#FFFFFF",
        color: "#1D1C1A",
      }}
    >
      {/* Watermark for Cancelled or Paid */}
      {invoice.status === "cancelled" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-15 overflow-hidden">
          <span className="text-[100px] font-black uppercase text-[#B4432F] -rotate-24 select-none tracking-widest border-8 border-[#B4432F] px-8 py-2 rounded-2xl">
            CANCELLED
          </span>
        </div>
      )}

      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 border-b border-[#E4DFD3] pb-5 sm:pb-6">
        <div className="flex items-start gap-3 sm:gap-4 w-full sm:max-w-[60%]">
          {seller.logoDataUrl && (
            <img
              src={seller.logoDataUrl}
              alt={seller.name || "Business Logo"}
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg border border-[#E4DFD3] bg-white p-1 shrink-0"
            />
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1C1A]">
              {seller.name || "Your Business Name"}
            </h1>
            {seller.tradeName && (
              <p className="text-xs text-[#6A665E] font-medium">{seller.tradeName}</p>
            )}
            <p className="text-xs text-[#6A665E] mt-1 whitespace-pre-line leading-relaxed">
              {[seller.addressLine1, seller.addressLine2, seller.city, seller.pincode]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="text-xs text-[#6A665E]">
              State: {getStateLabel(seller.stateCode || "29")}
            </p>
            {seller.gstin && (
              <p className="text-xs font-semibold text-[#1D1C1A] mt-1 tracking-wide">
                GSTIN: <span className="font-mono">{seller.gstin}</span>
              </p>
            )}
            {seller.phone && <p className="text-xs text-[#6A665E]">Phone: {seller.phone}</p>}
            {seller.email && <p className="text-xs text-[#6A665E]">Email: {seller.email}</p>}
          </div>
        </div>

        <div className="text-left sm:text-right flex flex-col sm:items-end">
          <div
            className="inline-block px-3 py-1 rounded text-xs font-bold tracking-wider uppercase mb-2"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            {computed.documentType}
          </div>

          <div className="text-xs text-[#6A665E] space-y-1">
            <p>
              <span className="font-medium text-[#1D1C1A]">Invoice No: </span>
              <span className="font-mono font-semibold text-[#1D1C1A]">
                {invoice.number || "DRAFT (Unassigned)"}
              </span>
            </p>
            <p>
              <span className="font-medium text-[#1D1C1A]">Date: </span>
              {invoice.issueDate
                ? new Date(invoice.issueDate).toLocaleDateString("en-IN")
                : new Date().toLocaleDateString("en-IN")}
            </p>
            {invoice.dueDate && (
              <p>
                <span className="font-medium text-[#1D1C1A]">Due Date: </span>
                {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
              </p>
            )}
            {invoice.paymentTerms && (
              <p>
                <span className="font-medium text-[#1D1C1A]">Terms: </span>
                {invoice.paymentTerms}
              </p>
            )}
            {isTaxApplicable && (
              <>
                <p>
                  <span className="font-medium text-[#1D1C1A]">Place of Supply: </span>
                  {getStateLabel(invoice.placeOfSupplyStateCode || seller.stateCode || "29")}
                </p>
                <p>
                  <span className="font-medium text-[#1D1C1A]">Reverse Charge: </span>
                  No
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bill To & Ship To Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 border-b border-[#E4DFD3] text-xs">
        <div>
          <p className="font-bold text-[#6A665E] uppercase tracking-wider text-[11px] mb-1">
            Billed To
          </p>
          <p className="font-semibold text-sm text-[#1D1C1A]">
            {customer.name || "Customer / Client Name"}
          </p>
          <p className="text-[#6A665E] mt-0.5 whitespace-pre-line leading-relaxed">
            {[customer.addressLine1, customer.addressLine2, customer.city, customer.pincode]
              .filter(Boolean)
              .join(", ")}
          </p>
          {customer.stateCode && (
            <p className="text-[#6A665E]">State: {getStateLabel(customer.stateCode)}</p>
          )}
          {customer.gstin && (
            <p className="font-semibold text-[#1D1C1A] mt-1 font-mono">
              GSTIN: {customer.gstin}
            </p>
          )}
          {customer.phone && <p className="text-[#6A665E]">Phone: {customer.phone}</p>}
          {customer.email && <p className="text-[#6A665E]">Email: {customer.email}</p>}
        </div>

        {invoice.shipTo && (invoice.shipTo.name || invoice.shipTo.addressLine1) ? (
          <div>
            <p className="font-bold text-[#6A665E] uppercase tracking-wider text-[11px] mb-1">
              Shipped To
            </p>
            <p className="font-semibold text-[#1D1C1A]">{invoice.shipTo.name || customer.name}</p>
            <p className="text-[#6A665E] mt-0.5 whitespace-pre-line leading-relaxed">
              {[invoice.shipTo.addressLine1, invoice.shipTo.city, invoice.shipTo.pincode]
                .filter(Boolean)
                .join(", ")}
            </p>
            {invoice.shipTo.stateCode && (
              <p className="text-[#6A665E]">State: {getStateLabel(invoice.shipTo.stateCode)}</p>
            )}
          </div>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>

      {/* Line Items Table */}
      <div className="py-4 overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[#E4DFD3] text-[#6A665E] font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-2 w-8 text-center">#</th>
              <th className="py-2.5 px-2">Description</th>
              {seller.showHsnColumn && <th className="py-2.5 px-2 text-center w-16">HSN/SAC</th>}
              <th className="py-2.5 px-2 text-right w-14">Qty</th>
              <th className="py-2.5 px-2 text-right w-20">Rate (₹)</th>
              <th className="py-2.5 px-2 text-right w-16">Disc</th>
              {isTaxApplicable && (
                <>
                  <th className="py-2.5 px-2 text-right w-20">Taxable</th>
                  <th className="py-2.5 px-2 text-right w-14">GST%</th>
                  <th className="py-2.5 px-2 text-right w-18">Tax (₹)</th>
                </>
              )}
              <th className="py-2.5 px-2 text-right w-24">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4DFD3]/60">
            {computed.lines.length === 0 ? (
              <tr>
                <td
                  colSpan={isTaxApplicable ? 10 : 7}
                  className="py-8 text-center text-[#A29D92] italic"
                >
                  No line items added yet.
                </td>
              </tr>
            ) : (
              computed.lines.map((l, idx) => (
                <tr key={l.id || idx} className="hover:bg-black/[0.01]">
                  <td className="py-2.5 px-2 text-center text-[#6A665E]">{idx + 1}</td>
                  <td className="py-2.5 px-2">
                    <p className="font-medium text-[#1D1C1A]">{l.description || "Item name"}</p>
                    {l.taxTreatment && l.taxTreatment !== "taxable" && (
                      <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 bg-[#EBE5D7] text-[#6A665E] rounded">
                        {l.taxTreatment === "exempt"
                          ? "Exempt"
                          : l.taxTreatment === "nil_rated"
                          ? "Nil Rated"
                          : "Non-GST"}
                      </span>
                    )}
                  </td>
                  {seller.showHsnColumn && (
                    <td className="py-2.5 px-2 text-center text-[#6A665E] font-mono text-[11px]">
                      {l.hsnSac || "—"}
                    </td>
                  )}
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                    {l.quantity} {l.unit !== "NOS" ? l.unit : ""}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                    {formatPaise(l.ratePaise)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums text-[#6A665E]">
                    {l.totalDiscountPaise > 0 ? formatPaise(l.totalDiscountPaise) : "—"}
                  </td>
                  {isTaxApplicable && (
                    <>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {formatPaise(l.taxablePaise)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {l.gstRate}%
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {formatPaise(l.taxTotalPaise)}
                      </td>
                    </>
                  )}
                  <td className="py-2.5 px-2 text-right font-mono font-semibold tabular-nums text-[#1D1C1A]">
                    {formatPaise(l.lineTotalPaise)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tax Summary Table (when GST is applicable) */}
      {isTaxApplicable && computed.taxSummaryByRate.length > 0 && (
        <div className="py-3 border-t border-[#E4DFD3]">
          <p className="text-[11px] font-bold text-[#6A665E] uppercase tracking-wider mb-2">
            Tax Breakdown
          </p>
          <table className="w-full text-[11px] text-left border-collapse border border-[#E4DFD3]">
            <thead>
              <tr className="bg-[#F5F2EB] text-[#6A665E] border-b border-[#E4DFD3]">
                <th className="py-1.5 px-2">Rate</th>
                <th className="py-1.5 px-2 text-right">Taxable Value</th>
                {computed.taxType === "intra" ? (
                  <>
                    <th className="py-1.5 px-2 text-right">CGST</th>
                    <th className="py-1.5 px-2 text-right">
                      {computed.isUnionTerritory ? "UTGST" : "SGST"}
                    </th>
                  </>
                ) : (
                  <th className="py-1.5 px-2 text-right">IGST</th>
                )}
                <th className="py-1.5 px-2 text-right">Total Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {computed.taxSummaryByRate.map((row) => (
                <tr key={row.gstRate} className="font-mono tabular-nums">
                  <td className="py-1.5 px-2">{row.gstRate}%</td>
                  <td className="py-1.5 px-2 text-right">{formatPaise(row.taxablePaise)}</td>
                  {computed.taxType === "intra" ? (
                    <>
                      <td className="py-1.5 px-2 text-right">{formatPaise(row.cgstPaise)}</td>
                      <td className="py-1.5 px-2 text-right">
                        {formatPaise(computed.isUnionTerritory ? row.utgstPaise : row.sgstPaise)}
                      </td>
                    </>
                  ) : (
                    <td className="py-1.5 px-2 text-right">{formatPaise(row.igstPaise)}</td>
                  )}
                  <td className="py-1.5 px-2 text-right font-medium">
                    {formatPaise(row.totalTaxPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals & Calculations Grid */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 py-4 border-t border-[#E4DFD3]">
        {/* Left: Words & Declarations */}
        <div className="w-full sm:w-[55%] space-y-3">
          <div>
            <p className="text-[11px] font-bold text-[#6A665E] uppercase tracking-wider">
              Total Amount in Words
            </p>
            <p className="text-xs font-serif italic text-[#1D1C1A] mt-0.5 leading-relaxed">
              {computed.amountInWords}
            </p>
          </div>

          {/* Statutory declarations */}
          {isComposition && (
            <div className="p-2.5 bg-[#F5F2EB] border border-[#E4DFD3] rounded-lg text-xs text-[#6A665E]">
              <span className="font-semibold text-[#1D1C1A]">Statutory Declaration: </span>
              Composition taxable person, not eligible to collect tax on supplies.
            </div>
          )}

          {isUnregistered && (
            <div className="p-2.5 bg-[#F5F2EB] border border-[#E4DFD3] rounded-lg text-xs text-[#6A665E]">
              <span className="font-semibold text-[#1D1C1A]">Declaration: </span>
              Supplier is not registered under GST.
            </div>
          )}

          {invoice.additionalNotes && (
            <div>
              <p className="text-[11px] font-bold text-[#6A665E] uppercase tracking-wider">
                Notes
              </p>
              <p className="text-xs text-[#6A665E] whitespace-pre-line mt-0.5">
                {invoice.additionalNotes}
              </p>
            </div>
          )}

          {invoice.terms && (
            <div>
              <p className="text-[11px] font-bold text-[#6A665E] uppercase tracking-wider">
                Terms & Conditions
              </p>
              <p className="text-xs text-[#6A665E] whitespace-pre-line mt-0.5">
                {invoice.terms}
              </p>
            </div>
          )}
        </div>

        {/* Right: Numbers Summary */}
        <div className="w-full sm:w-[42%] text-xs space-y-1.5">
          <div className="flex justify-between text-[#6A665E]">
            <span>Subtotal (Gross):</span>
            <span className="font-mono tabular-nums">{formatPaise(computed.totals.subtotalGrossPaise, true)}</span>
          </div>

          {computed.totals.totalDiscountPaise > 0 && (
            <div className="flex justify-between text-[#6A665E]">
              <span>Discount:</span>
              <span className="font-mono tabular-nums text-[#B4432F]">
                -{formatPaise(computed.totals.totalDiscountPaise, true)}
              </span>
            </div>
          )}

          {isTaxApplicable && (
            <>
              <div className="flex justify-between text-[#6A665E]">
                <span>Taxable Amount:</span>
                <span className="font-mono tabular-nums">{formatPaise(computed.totals.taxablePaise, true)}</span>
              </div>

              {computed.taxType === "intra" ? (
                <>
                  <div className="flex justify-between text-[#6A665E]">
                    <span>CGST:</span>
                    <span className="font-mono tabular-nums">{formatPaise(computed.totals.cgstPaise, true)}</span>
                  </div>
                  <div className="flex justify-between text-[#6A665E]">
                    <span>{computed.isUnionTerritory ? "UTGST" : "SGST"}:</span>
                    <span className="font-mono tabular-nums">
                      {formatPaise(computed.isUnionTerritory ? computed.totals.utgstPaise : computed.totals.sgstPaise, true)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-[#6A665E]">
                  <span>IGST:</span>
                  <span className="font-mono tabular-nums">{formatPaise(computed.totals.igstPaise, true)}</span>
                </div>
              )}
            </>
          )}

          {computed.totals.roundOffPaise !== 0 && (
            <div className="flex justify-between text-[#6A665E]">
              <span>Round Off:</span>
              <span className="font-mono tabular-nums">
                {computed.totals.roundOffPaise > 0 ? "+" : ""}
                {formatPaise(computed.totals.roundOffPaise, true)}
              </span>
            </div>
          )}

          <div
            className="flex justify-between items-center py-2 border-t-2 border-b-2 font-bold text-base"
            style={{ borderColor: accentColor }}
          >
            <span className="font-serif">Grand Total:</span>
            <span className="font-serif text-lg tracking-tight tabular-nums" style={{ color: accentColor }}>
              {formatPaise(computed.totals.grandTotalPaise, true)}
            </span>
          </div>

          {computed.totals.advanceReceivedPaise > 0 && (
            <div className="flex justify-between text-[#6A665E] pt-1">
              <span>Advance Received:</span>
              <span className="font-mono tabular-nums text-[#2E7D5B]">
                -{formatPaise(computed.totals.advanceReceivedPaise, true)}
              </span>
            </div>
          )}

          <div className="flex justify-between font-bold text-sm text-[#1D1C1A] pt-1">
            <span>Balance Due:</span>
            <span className="font-mono tabular-nums">
              {formatPaise(computed.totals.balanceDuePaise, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Information & QR Code */}
      <div className="mt-4 pt-4 border-t border-[#E4DFD3] flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6">
        <div className="flex-1 space-y-2 text-xs">
          <p className="text-[11px] font-bold text-[#6A665E] uppercase tracking-wider">
            Payment Details
          </p>

          {seller.upiId && (
            <div className="flex items-center gap-2">
              <span className="text-[#6A665E]">UPI ID:</span>
              <span className="font-mono font-semibold text-[#1D1C1A] bg-[#F5F2EB] px-2 py-0.5 rounded">
                {seller.upiId}
              </span>
            </div>
          )}

          {seller.bank && seller.bank.accountNumber && (
            <div className="space-y-0.5 text-[#6A665E]">
              <p>
                <span className="text-[#1D1C1A] font-medium">Bank: </span>
                {seller.bank.bankName || "Bank"}
              </p>
              <p>
                <span className="text-[#1D1C1A] font-medium">A/C Name: </span>
                {seller.bank.accountName}
              </p>
              <p>
                <span className="text-[#1D1C1A] font-medium">A/C Number: </span>
                <span className="font-mono">{seller.bank.accountNumber}</span>
              </p>
              <p>
                <span className="text-[#1D1C1A] font-medium">IFSC: </span>
                <span className="font-mono">{seller.bank.ifsc}</span>
              </p>
            </div>
          )}

          {!seller.upiId && !seller.bank?.accountNumber && (
            <p className="text-[#A29D92] italic">
              Add your UPI ID or bank details in settings or builder to show payment options.
            </p>
          )}
        </div>

        {/* UPI QR Code Block */}
        {qrDataUrl && computed.totals.balanceDuePaise > 0 && seller.upiId ? (
          <div className="flex flex-col items-center bg-[#F5F2EB] p-3 rounded-xl border border-[#E4DFD3] text-center w-44">
            <img
              src={qrDataUrl}
              alt="Scan to pay via UPI"
              className="w-32 h-32 object-contain bg-white p-1 rounded-lg shadow-2xs"
            />
            <p className="text-[10px] text-[#6A665E] mt-1.5 font-medium">
              Scan & Pay via any UPI App
            </p>
            <p className="text-[11px] font-mono font-bold text-[#1D1C1A]">
              {formatPaise(computed.totals.balanceDuePaise, true)}
            </p>
          </div>
        ) : computed.totals.balanceDuePaise <= 0 ? (
          <div className="px-4 py-3 bg-[#E2EEE8] border border-[#2E7D5B]/30 rounded-xl text-center">
            <p className="text-xs font-semibold text-[#2E7D5B]">Paid in Full</p>
            <p className="text-[10px] text-[#2E7D5B]/80">No balance remaining</p>
          </div>
        ) : null}

        {/* Authorised Signatory */}
        <div className="w-full sm:w-48 text-right flex flex-col items-end justify-end mt-4 sm:mt-0">
          {seller.signatureDataUrl ? (
            <img
              src={seller.signatureDataUrl}
              alt="Signature"
              className="h-12 object-contain mb-1"
            />
          ) : (
            <div className="h-12" />
          )}
          <div className="border-t border-[#1D1C1A] pt-1 w-full text-center sm:text-right">
            <p className="text-[11px] font-semibold text-[#1D1C1A]">
              For {seller.name || "Business"}
            </p>
            <p className="text-[10px] text-[#6A665E]">Authorised Signatory</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-[#E4DFD3] flex justify-between items-center text-[10px] text-[#A29D92]">
        <p>This is a computer-generated invoice.</p>
        {!proUser && (
          <p>
            Created with <span className="font-medium text-[#6A665E]">{APP_NAME}</span>
          </p>
        )}
      </div>
    </div>
  );
};
