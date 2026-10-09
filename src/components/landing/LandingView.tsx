import React, { useState, useEffect } from "react";
import {
  QrCode,
  ShieldCheck,
  Zap,
  Download,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { APP_NAME } from "../../config/app";
import { calculateInvoice } from "../../lib/gst/tax";
import { generateUpiQrDataUrl, buildUpiPayUrl } from "../../lib/upi";
import { InvoiceA4Preview } from "../invoice/InvoiceA4Preview";
import type { InvoiceRecord } from "../../db/database";

interface Props {
  onStartInvoice: () => void;
  onOpenSeoTopic: (slug: string) => void;
}

export const LandingView: React.FC<Props> = ({ onStartInvoice, onOpenSeoTopic }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [sampleQrUrl, setSampleQrUrl] = useState<string>("");

  // Sample invoice for live interactive preview
  const sampleInvoice: Partial<InvoiceRecord> = {
    status: "issued",
    number: "INV/26-27/0001",
    issueDate: "2026-10-09",
    paymentTerms: "Due on receipt",
    placeOfSupplyStateCode: "29",
    sellerSnapshot: {
      name: "Harsh Freelance Studio",
      supplierMode: "regular",
      gstin: "29ABCDE1234F1Z5",
      addressLine1: "12th Main Road, Indiranagar",
      city: "Bengaluru",
      stateCode: "29",
      pincode: "560038",
      upiId: "harsh@okaxis",
      accentColor: "#2E6B57",
      defaultGstRate: 18,
      defaultTerms: "Please scan QR to pay.",
      defaultNotes: "Thank you!",
      invoicePrefix: "INV",
      numberingStartAt: 1,
      roundOffEnabled: true,
      showHsnColumn: true,
      updatedAt: new Date().toISOString(),
    },
    customerSnapshot: {
      id: "cust-1",
      name: "Innovate Digital Labs Pvt Ltd",
      isBusiness: true,
      gstin: "29XYZAB5678C1Z2",
      addressLine1: "Tech Park, Outer Ring Road",
      city: "Bengaluru",
      stateCode: "29",
      pincode: "560103",
      createdAt: new Date().toISOString(),
    },
    lines: [
      {
        id: "line-1",
        description: "Full-Stack Web Development & UI/UX Design",
        hsnSac: "998314",
        unit: "PROJECT",
        quantity: 1,
        ratePaise: 4000000, // ₹40,000
        gstRate: 18,
        taxTreatment: "taxable",
        grossPaise: 4000000,
        lineDiscountPaise: 0,
        allocatedInvoiceDiscountPaise: 0,
        taxablePaise: 4000000,
        cgstPaise: 360000,
        sgstPaise: 360000,
        utgstPaise: 0,
        igstPaise: 0,
        taxTotalPaise: 720000,
        lineTotalPaise: 4720000,
      },
    ],
    advanceReceivedPaise: 0,
  };

  const sampleComputed = calculateInvoice({
    supplierMode: "regular",
    sellerStateCode: "29",
    placeOfSupplyStateCode: "29",
    roundOffEnabled: true,
    lines: [
      {
        id: "line-1",
        description: "Full-Stack Web Development & UI/UX Design",
        hsnSac: "998314",
        unit: "PROJECT",
        quantity: 1,
        ratePaise: 4000000,
        gstRate: 18,
        taxTreatment: "taxable",
      },
    ],
  });

  useEffect(() => {
    async function loadQr() {
      const upi = buildUpiPayUrl({
        vpa: "harsh@okaxis",
        payeeName: "Harsh Freelance Studio",
        balanceDuePaise: sampleComputed.totals.balanceDuePaise,
        invoiceNumber: "INV/26-27/0001",
      });
      if (upi.isValid && upi.upiUrl) {
        const url = await generateUpiQrDataUrl(upi.upiUrl, 200);
        setSampleQrUrl(url);
      }
    }
    loadQr();
  }, [sampleComputed.totals.balanceDuePaise]);

  const faqs = [
    {
      q: "Do I need a GST registration to use this app?",
      a: "No! If you are an unregistered freelancer or small seller below the GST threshold, simply choose 'Not registered'. The app will generate a clean 'INVOICE' without GST fields or tax columns, complete with your UPI QR code.",
    },
    {
      q: "How does the dynamic UPI QR code work?",
      a: "The moment you enter your UPI ID and create an invoice, a standard NPCI-compliant UPI QR code is generated with the exact payable amount and invoice number. Customers can scan it with Google Pay, PhonePe, Paytm, or BHIM to pay instantly without manually typing bank details.",
    },
    {
      q: "Is my invoice and client data uploaded to any server?",
      a: "Never. All invoices, client profiles, and settings are stored strictly in your browser's local IndexedDB database. Nothing is sent over the internet. You can export or backup your data as a JSON file anytime from Settings.",
    },
    {
      q: "What if I am under the GST Composition Scheme?",
      a: "Under GST law, composition dealers must not charge tax to customers. Invoicely automatically switches the document to a statutory 'BILL OF SUPPLY' and adds the legally required declaration: 'Composition taxable person, not eligible to collect tax on supplies'.",
    },
    {
      q: "Which GST slabs are supported after the recent reform?",
      a: "We support the standard rates: 0%, 5%, 18%, and 40%, plus special rates and any custom tax rate (from 0% to 100% with up to 3 decimal places) for complete flexibility.",
    },
    {
      q: "Can I download and share invoices on mobile?",
      a: "Yes! Invoicely is mobile-optimized and installable as an offline PWA. When you finalize an invoice, you can download a print-ready A4 PDF or tap 'Share' to send it straight via WhatsApp or email.",
    },
  ];

  const seoTopics = [
    { slug: "gst-invoice-generator", title: "Free GST Invoice Generator" },
    { slug: "invoice-with-upi-qr-code", title: "Invoice with UPI QR Code" },
    { slug: "freelancer-invoice-india", title: "Freelancer Invoicing in India" },
    { slug: "bill-of-supply-generator", title: "Bill of Supply Generator" },
    { slug: "gst-invoice-format", title: "Indian GST Invoice Format Guide" },
  ];

  return (
    <div className="space-y-16 py-8 sm:py-12 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2EEE8] dark:bg-[#233229] text-[#2E6B57] dark:text-[#7CC4A6] text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Compliant with October 2026 GST Guidelines</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1C1A] dark:text-[#EDEAE2] leading-[1.2]">
          Make a GST invoice with a UPI QR code in under 60 seconds.
        </h1>

        <p className="text-sm sm:text-base text-[#6A665E] dark:text-[#A29D92] leading-relaxed max-w-2xl mx-auto">
          Tailored for Indian freelancers, consultants, and small sellers. Accurate CGST/SGST/IGST maths, zero login walls, and your business data never leaves your device.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartInvoice}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#2E6B57] hover:bg-[#255746] dark:bg-[#7CC4A6] dark:hover:bg-[#68a88e] text-white dark:text-[#151613] font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <span>Create an Invoice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#live-preview-demo"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white dark:bg-[#1E1F1B] hover:bg-[#EBE5D7] dark:hover:bg-[#2E2F2A] border border-[#E4DFD3] dark:border-[#2E2F2A] text-[#1D1C1A] dark:text-[#EDEAE2] font-medium text-sm transition-all"
          >
            See Live Sample
          </a>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#E2EEE8] dark:bg-[#233229] flex items-center justify-center text-[#2E6B57] dark:text-[#7CC4A6]">
              <QrCode className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-xs text-[#1D1C1A] dark:text-[#EDEAE2]">
              Instant UPI QR Code
            </h2>
            <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
              Clients scan and pay exact rupees using GPay, PhonePe, or Paytm with zero friction.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#E2EEE8] dark:bg-[#233229] flex items-center justify-center text-[#2E6B57] dark:text-[#7CC4A6]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-xs text-[#1D1C1A] dark:text-[#EDEAE2]">
              100% Private & Offline
            </h2>
            <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
              All data stays on this device. No signups, no analytics snooping, no cloud tracking.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#E2EEE8] dark:bg-[#233229] flex items-center justify-center text-[#2E6B57] dark:text-[#7CC4A6]">
              <FileCheck className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-xs text-[#1D1C1A] dark:text-[#EDEAE2]">
              Accurate Indian Tax Maths
            </h2>
            <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
              Auto-detects Intra (CGST+SGST/UTGST) vs Inter (IGST), handles tax-inclusive, discounts & advance.
            </p>
          </div>
        </div>
      </section>

      {/* Live Sample Preview Section */}
      <section id="live-preview-demo" className="space-y-4 pt-4">
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2E6B57] dark:text-[#7CC4A6]">
            Interactive Output
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#1D1C1A] dark:text-[#EDEAE2]">
            Clean, professional A4 PDF every single time
          </h2>
          <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
            Real sample invoice generated by {APP_NAME} with dynamic UPI QR code.
          </p>
        </div>

        <div className="p-3 sm:p-8 bg-[#EBE5D7]/50 dark:bg-[#1E1F1B]/50 border border-[#E4DFD3] dark:border-[#2E2F2A] rounded-3xl overflow-hidden flex justify-center">
          <div className="w-full max-w-[794px] transform scale-[0.88] sm:scale-100 origin-top">
            <InvoiceA4Preview
              invoice={sampleInvoice}
              computed={sampleComputed}
              qrDataUrl={sampleQrUrl}
            />
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onStartInvoice}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2E6B57] hover:bg-[#255746] dark:bg-[#7CC4A6] text-white dark:text-[#151613] font-semibold text-xs shadow-2xs"
          >
            <span>Create your invoice now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-6 max-w-3xl mx-auto pt-6">
        <div className="text-center space-y-1">
          <h2 className="font-serif text-2xl font-bold text-[#1D1C1A] dark:text-[#EDEAE2]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
            Straightforward answers for Indian freelancers and businesses.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center gap-4 text-sm font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#6A665E] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6A665E] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-[#6A665E] dark:text-[#A29D92] leading-relaxed border-t border-[#E4DFD3]/60 dark:border-[#2E2F2A]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SEO Guides & Resources Grid */}
      <section className="pt-6 border-t border-[#E4DFD3] dark:border-[#2E2F2A] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1D1C1A] dark:text-[#EDEAE2]">
              GST & Invoicing Knowledge Base
            </h3>
            <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
              In-depth legal checklists, rules, and formats.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {seoTopics.map((topic) => (
            <button
              key={topic.slug}
              onClick={() => onOpenSeoTopic(topic.slug)}
              className="p-3.5 rounded-xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] text-left hover:border-[#2E6B57] dark:hover:border-[#7CC4A6] transition-colors group flex items-center justify-between"
            >
              <span className="text-xs font-medium text-[#1D1C1A] dark:text-[#EDEAE2] group-hover:text-[#2E6B57] dark:group-hover:text-[#7CC4A6]">
                {topic.title}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#6A665E] dark:text-[#A29D92] group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </section>

      {/* Footer Legal & Tax Disclaimer */}
      <footer className="pt-8 border-t border-[#E4DFD3] dark:border-[#2E2F2A] text-center space-y-3 text-xs text-[#6A665E] dark:text-[#A29D92]">
        <p className="max-w-xl mx-auto leading-relaxed">
          <strong>Tax Disclaimer:</strong> {APP_NAME} helps you prepare professional GST invoices and payment requests. It is not tax or legal advice. Please check your specific tax treatments and registration thresholds with a qualified Chartered Accountant.
        </p>
        <p className="text-[11px] text-[#A29D92]">
          Built with care for Indian creators, developers, designers, and small business owners.
        </p>
      </footer>
    </div>
  );
};
