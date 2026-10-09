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
  Lock,
  Layers,
  HelpCircle,
  Clock,
  Smartphone,
  Calculator,
} from "lucide-react";
import { APP_NAME } from "../../config/app";
import { calculateInvoice } from "../../lib/gst/tax";
import { generateUpiQrDataUrl, buildUpiPayUrl } from "../../lib/upi";
import { InvoiceA4Preview } from "../invoice/InvoiceA4Preview";
import type { InvoiceRecord } from "../../db/database";
import { Footer } from "../common/Footer";

interface Props {
  onStartInvoice: () => void;
  onOpenSeoTopic: (slug: string) => void;
}

export const LandingView: React.FC<Props> = ({ onStartInvoice, onOpenSeoTopic }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sampleQrUrl, setSampleQrUrl] = useState<string>("");

  // Sample invoice for live interactive preview
  const sampleInvoice: Partial<InvoiceRecord> = {
    status: "issued",
    number: "INV/26-27/0001",
    issueDate: "2026-10-09",
    paymentTerms: "Due on receipt",
    placeOfSupplyStateCode: "29",
    sellerSnapshot: {
      name: "Harsh Studio",
      supplierMode: "regular",
      gstin: "29ABCDE1234F1Z5",
      addressLine1: "12th Main Road, Indiranagar",
      city: "Bengaluru",
      stateCode: "29",
      pincode: "560038",
      upiId: "harsh@okaxis",
      accentColor: "#2E6B57",
      defaultGstRate: 18,
      defaultTerms: "Please scan UPI QR to pay directly.",
      defaultNotes: "Thank you for partnering with us!",
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
        payeeName: "Harsh Studio",
        balanceDuePaise: sampleComputed.totals.balanceDuePaise,
        invoiceNumber: "INV/26-27/0001",
      });
      if (upi.isValid && upi.upiUrl) {
        const url = await generateUpiQrDataUrl(upi.upiUrl, 180);
        setSampleQrUrl(url);
      }
    }
    loadQr();
  }, [sampleComputed.totals.balanceDuePaise]);

  const faqs = [
    {
      q: "How to generate a GST invoice with a UPI QR code?",
      a: "Click 'Create an invoice', type your business name and UPI ID, enter customer details and line items. Invoicely automatically calculates the CGST/SGST or IGST tax amounts, generates an NPCI-compliant UPI QR code for the exact balance payable, and renders a clean A4 PDF you can download or share instantly.",
    },
    {
      q: "Do I need a GST registration number to use Invoicely?",
      a: "No. If you are an unregistered freelancer or small seller below the GST threshold (₹20 Lakhs for services in most states), choose 'Not registered'. The app will generate a clean 'INVOICE' without GST tax columns, complete with your payment UPI QR code.",
    },
    {
      q: "How does the dynamic UPI QR code work for payments?",
      a: "The QR code embeds a canonical upi://pay URI containing your Virtual Payment Address (VPA), business name, exact invoice balance due with 2 decimals, and the invoice number. Clients scan it using Google Pay, PhonePe, Paytm, or BHIM to pay the exact amount without typing bank details manually.",
    },
    {
      q: "Is my invoice and financial data stored on any server?",
      a: "Never. Invoicely runs 100% locally inside your browser's IndexedDB database. No names, GST numbers, client lists, or payment details are sent to any cloud server or third party. You can export a full JSON backup anytime from Settings.",
    },
    {
      q: "What if I am under the GST Composition Scheme?",
      a: "Composition scheme taxpayers cannot collect tax from customers. Invoicely automatically issues a statutory 'BILL OF SUPPLY' with the legally mandated declaration: 'Composition taxable person, not eligible to collect tax on supplies', and hides tax columns.",
    },
    {
      q: "How are CGST, SGST, UTGST, and IGST calculated?",
      a: "Invoicely detects whether the supply is intra-state (seller and customer in same state) or inter-state. Intra-state applies CGST + SGST (or CGST + UTGST in Union Territories without legislature like Chandigarh, Ladakh, etc.). Inter-state applies IGST. Multiple tax rates (0%, 5%, 18%, 40%) are handled seamlessly.",
    },
    {
      q: "What is Rule 46 of the CGST Rules 2017?",
      a: "Rule 46 specifies the mandatory 16 particulars required on every tax invoice in India, including consecutive sequential numbering (max 16 characters), Place of Supply, HSN/SAC codes, and detailed tax breakups. Invoicely follows Rule 46 strictly.",
    },
  ];

  const seoTopics = [
    { slug: "gst-invoice-generator", title: "Free GST Invoice Generator India" },
    { slug: "invoice-with-upi-qr-code", title: "Invoice with UPI QR Code Guide" },
    { slug: "freelancer-invoice-india", title: "Freelancer Invoicing Rules India" },
    { slug: "bill-of-supply-generator", title: "Bill of Supply Generator Guide" },
    { slug: "gst-invoice-format", title: "Indian GST Invoice Format (Rule 46)" },
    { slug: "cgst-sgst-igst-rules", title: "CGST vs SGST vs IGST Explained" },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8">
      {/* Hero Section - Wispr Flow Inspired Editorial Balance */}
      <section className="text-center space-y-4 max-w-2xl mx-auto px-4 sm:px-6 pt-2">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3EF] dark:bg-[#1B2E24] text-[#2E6B57] dark:text-[#52B788] text-[11px] font-medium tracking-normal border border-[#2E6B57]/15 dark:border-[#52B788]/20 shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#2E6B57] dark:text-[#52B788]" />
          <span>Compliant GST Invoicing & Scan-to-Pay for India</span>
        </div>

        {/* Refined headline - Editorial size, quiet luxury, not oversized */}
        <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-medium tracking-tight text-[#18181B] dark:text-[#F4F4F5] leading-[1.25]">
          Make compliant GST invoices with instant UPI scan-to-pay.
        </h1>

        {/* Muted restrained subtitle */}
        <p className="text-xs sm:text-[13px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed max-w-lg mx-auto font-normal">
          Built for Indian freelancers, consultants, and small agencies. Automatic CGST/SGST/IGST tax logic, dynamic UPI QR codes, and 100% on-device privacy with zero login.
        </p>

        {/* Compact CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            onClick={onStartInvoice}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#2E6B57] hover:bg-[#245746] dark:bg-[#52B788] dark:hover:bg-[#409c73] text-white dark:text-[#0F1011] font-medium text-xs shadow-2xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Create an invoice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <a
            href="#live-preview-demo"
            className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-white dark:bg-[#18191B] hover:bg-[#FAF8F5] dark:hover:bg-[#27272A] border border-[#E4E4E7] dark:border-[#27272A] text-[#18181B] dark:text-[#F4F4F5] font-medium text-xs transition-all text-center"
          >
            See live sample
          </a>
        </div>

        {/* 3 Calm Value Cards - Refined sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 text-left">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#18191B] border border-[#E4E4E7] dark:border-[#27272A] space-y-1.5 shadow-2xs">
            <div className="w-6.5 h-6.5 rounded-lg bg-[#EAF3EF] dark:bg-[#1B2E24] flex items-center justify-center text-[#2E6B57] dark:text-[#52B788]">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-semibold text-xs text-[#18181B] dark:text-[#F4F4F5]">
              Instant UPI QR Code
            </h2>
            <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              Clients scan and pay exact rupees via GPay, PhonePe, or Paytm with zero friction.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18191B] border border-[#E4E4E7] dark:border-[#27272A] space-y-1.5 shadow-2xs">
            <div className="w-6.5 h-6.5 rounded-lg bg-[#EAF3EF] dark:bg-[#1B2E24] flex items-center justify-center text-[#2E6B57] dark:text-[#52B788]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-semibold text-xs text-[#18181B] dark:text-[#F4F4F5]">
              100% Private & Offline
            </h2>
            <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              All records stay on this device in local storage. No tracking, cloud databases, or paywalls.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18191B] border border-[#E4E4E7] dark:border-[#27272A] space-y-1.5 shadow-2xs">
            <div className="w-6.5 h-6.5 rounded-lg bg-[#EAF3EF] dark:bg-[#1B2E24] flex items-center justify-center text-[#2E6B57] dark:text-[#52B788]">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-semibold text-xs text-[#18181B] dark:text-[#F4F4F5]">
              Rule 46 Compliant
            </h2>
            <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              Auto-detects Intra (CGST+SGST/UTGST) vs Inter (IGST), discounts, and advances.
            </p>
          </div>
        </div>
      </section>

      {/* Live Sample Preview Section */}
      <section id="live-preview-demo" className="space-y-3 max-w-4xl mx-auto px-3 sm:px-6">
        <div className="text-center space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2E6B57] dark:text-[#52B788]">
            Interactive Output
          </p>
          <h2 className="font-serif text-lg sm:text-xl font-medium text-[#18181B] dark:text-[#F4F4F5]">
            Clean, professional A4 PDF with dynamic QR code
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Real sample invoice generated directly in the browser by {APP_NAME}.
          </p>
        </div>

        <div className="p-2 sm:p-5 bg-[#F4EFE6]/50 dark:bg-[#18191B]/50 border border-[#E4E4E7] dark:border-[#27272A] rounded-2xl overflow-hidden flex justify-center">
          <div className="w-full max-w-[720px] transform scale-[0.85] sm:scale-100 origin-top">
            <InvoiceA4Preview
              invoice={sampleInvoice}
              computed={sampleComputed}
              qrDataUrl={sampleQrUrl}
            />
          </div>
        </div>

        <div className="text-center pt-1">
          <button
            onClick={onStartInvoice}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#2E6B57] hover:bg-[#245746] dark:bg-[#52B788] text-white dark:text-[#0F1011] font-medium text-xs shadow-2xs cursor-pointer"
          >
            <span>Create your invoice now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Comparison Section - Refined Editorial Table */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 space-y-3 pt-2">
        <div className="text-center space-y-1">
          <h2 className="font-serif text-lg sm:text-xl font-medium text-[#18181B] dark:text-[#F4F4F5]">
            Built differently than heavy accounting tools
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Everything Indian freelancers need to bill clients cleanly, with zero baggage.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18191B] shadow-2xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5]/80 dark:bg-[#1F2023] border-b border-[#E4E4E7] dark:border-[#27272A] text-[#18181B] dark:text-[#F4F4F5]">
                <th className="py-2.5 px-3.5 font-medium">Feature</th>
                <th className="py-2.5 px-3.5 font-semibold text-[#2E6B57] dark:text-[#52B788]">Invoicely</th>
                <th className="py-2.5 px-3.5 font-normal text-[#71717A] dark:text-[#A1A1AA]">Traditional apps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60">
              <tr>
                <td className="py-2.5 px-3.5 font-medium">Pricing</td>
                <td className="py-2.5 px-3.5 font-semibold text-[#2E6B57] dark:text-[#52B788]">100% Free Forever</td>
                <td className="py-2.5 px-3.5 text-[#71717A] dark:text-[#A1A1AA]">₹500 - ₹1,500/month</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 font-medium">Account / Login</td>
                <td className="py-2.5 px-3.5 font-semibold text-[#2E6B57] dark:text-[#52B788]">None required</td>
                <td className="py-2.5 px-3.5 text-[#71717A] dark:text-[#A1A1AA]">Mandatory signup & phone OTP</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 font-medium">UPI QR Code</td>
                <td className="py-2.5 px-3.5 font-semibold text-[#2E6B57] dark:text-[#52B788]">Dynamic with exact amount</td>
                <td className="py-2.5 px-3.5 text-[#71717A] dark:text-[#A1A1AA]">Paid add-on or static QR</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 font-medium">Data Privacy</td>
                <td className="py-2.5 px-3.5 font-semibold text-[#2E6B57] dark:text-[#52B788]">100% On-device IndexedDB</td>
                <td className="py-2.5 px-3.5 text-[#71717A] dark:text-[#A1A1AA]">Stored on cloud servers</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 font-medium">Statutory Accuracy</td>
                <td className="py-2.5 px-3.5 font-semibold text-[#2E6B57] dark:text-[#52B788]">Exact paisa arithmetic & UTGST</td>
                <td className="py-2.5 px-3.5 text-[#71717A] dark:text-[#A1A1AA]">Frequent rounding errors</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Deep SEO Guide & Knowledge Section for 'GST Invoice Generator' */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 space-y-4 pt-4">
        <div className="text-center space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2E6B57] dark:text-[#52B788]">
            Statutory Guide
          </p>
          <h2 className="font-serif text-lg sm:text-xl font-medium text-[#18181B] dark:text-[#F4F4F5]">
            Everything you need to know about Indian GST invoices
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Essential statutory requirements under the Central Goods and Services Tax Act.
          </p>
        </div>

        <div className="space-y-3 text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#18191B] border border-[#E4E4E7] dark:border-[#27272A] space-y-2">
            <h3 className="font-semibold text-xs text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[#2E6B57] dark:text-[#52B788]" />
              How GST Tax Calculation Works: Intra-state vs Inter-state
            </h3>
            <p>
              In India, GST treatment depends on the location of the supplier and the Place of Supply (the customer's state):
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>
                <strong className="text-[#18181B] dark:text-[#F4F4F5]">Intra-State Supply (Same State):</strong> Tax is split equally into <strong>CGST</strong> (Central GST) and <strong>SGST</strong> (State GST). In Union Territories without a legislature (e.g., Chandigarh, Ladakh, Daman & Diu), <strong>UTGST</strong> replaces SGST.
              </li>
              <li>
                <strong className="text-[#18181B] dark:text-[#F4F4F5]">Inter-State Supply (Different State):</strong> The entire GST amount is levied as <strong>IGST</strong> (Integrated GST).
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18191B] border border-[#E4E4E7] dark:border-[#27272A] space-y-2">
            <h3 className="font-semibold text-xs text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#2E6B57] dark:text-[#52B788]" />
              Why Add a Dynamic UPI QR Code to Your Invoices?
            </h3>
            <p>
              According to NPCI data, over 80% of digital retail and peer-to-merchant payments in India occur via UPI. A dynamic QR code embeds your VPA (Virtual Payment Address), business payee name, and the exact Rupee balance due. When clients scan the QR code with GPay, Paytm, PhonePe, or BHIM, the exact amount is pre-filled, eliminating manual typing errors and shortening payment collection times from days to seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 space-y-3 pt-2">
        <div className="text-center space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2E6B57] dark:text-[#52B788]">
            Clear Answers
          </p>
          <h2 className="font-serif text-lg sm:text-xl font-medium text-[#18181B] dark:text-[#F4F4F5]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Common queries about Indian GST invoicing, UPI QR codes, and privacy.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18191B] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3 text-left flex justify-between items-center gap-3 text-xs font-medium text-[#18181B] dark:text-[#F4F4F5] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed border-t border-[#E4E4E7]/60 dark:border-[#27272A]/60 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Guides & SEO Topics */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-2 space-y-3">
        <div className="text-center sm:text-left space-y-0.5">
          <h3 className="font-serif text-base font-medium text-[#18181B] dark:text-[#F4F4F5]">
            GST & Invoicing Knowledge Base
          </h3>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Statutory checklists and guides for Indian freelancers and businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {seoTopics.map((topic) => (
            <button
              key={topic.slug}
              onClick={() => onOpenSeoTopic(topic.slug)}
              className="p-3 rounded-xl bg-white dark:bg-[#18191B] border border-[#E4E4E7] dark:border-[#27272A] text-left hover:border-[#2E6B57]/50 dark:hover:border-[#52B788]/50 transition-colors group flex items-center justify-between cursor-pointer shadow-2xs"
            >
              <span className="text-xs font-medium text-[#18181B] dark:text-[#F4F4F5] group-hover:text-[#2E6B57] dark:group-hover:text-[#52B788]">
                {topic.title}
              </span>
              <ExternalLink className="w-3 h-3 text-[#71717A] dark:text-[#A1A1AA] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* Footer is rendered here for Landing view */}
      <Footer onOpenSeoTopic={onOpenSeoTopic} />
    </div>
  );
};
