import React from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck, FileText, QrCode, Calculator, Smartphone, BookOpen } from "lucide-react";
import { APP_NAME } from "../../config/app";

interface Props {
  slug: string;
  onBack: () => void;
  onStartInvoice: () => void;
}

export const SeoArticleView: React.FC<Props> = ({ slug, onBack, onStartInvoice }) => {
  const articles: Record<
    string,
    { title: string; subtitle: string; content: React.ReactNode }
  > = {
    "gst-invoice-generator": {
      title: "Free GST Invoice Generator for Indian Freelancers and Small Businesses",
      subtitle: "Generate compliant Tax Invoices and Bills of Supply in seconds with accurate CGST/SGST/IGST math.",
      content: (
        <div className="space-y-4 text-xs sm:text-[13px] text-[#18181B] dark:text-[#F4F4F5] leading-relaxed">
          <p>
            Under the Goods and Services Tax (GST) law in India, every registered taxpayer making taxable supplies of goods or services must issue a tax invoice within statutory timelines. Whether you are a web designer billing a tech firm in Karnataka or a content creator billing a company in Mumbai, issuing a clean, legally correct invoice is critical for your client to claim Input Tax Credit (ITC).
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            Key GST Rules Every Freelancer Must Know:
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[#71717A] dark:text-[#A1A1AA]">
            <li>
              <strong>Intra-State vs Inter-State:</strong> If your client is located in your own state, you charge <strong>CGST + SGST</strong> (or UTGST in Union Territories without legislature like Chandigarh or Ladakh). If your client is in a different state, you charge <strong>IGST</strong>.
            </li>
            <li>
              <strong>HSN/SAC Codes:</strong> IT and design services fall under SAC code 998314 or 998391. Having the SAC code on the invoice ensures seamless ITC reconciliation.
            </li>
            <li>
              <strong>Consecutive Numbering:</strong> Invoice numbers cannot exceed 16 characters and must be unique per financial year (e.g. <code>INV/26-27/0001</code>).
            </li>
            <li>
              <strong>Rate Slabs:</strong> Following the 2025-2026 GST rationalization, standard rates are 0%, 5%, 18%, and 40%. Most professional services remain at 18%.
            </li>
          </ul>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            Why {APP_NAME} is Different:
          </h3>
          <p className="text-[#71717A] dark:text-[#A1A1AA]">
            Unlike generic cloud accounting software that charges monthly subscriptions and uploads your private client details to cloud servers, {APP_NAME} runs completely inside your browser. All data remains in your local IndexedDB storage, ensuring 100% privacy and zero subscription lock-in.
          </p>
        </div>
      ),
    },
    "invoice-with-upi-qr-code": {
      title: "How to Generate GST Invoices with Dynamic UPI QR Codes",
      subtitle: "Get paid 3x faster by letting your clients scan and pay directly via GPay, PhonePe, or Paytm.",
      content: (
        <div className="space-y-4 text-xs sm:text-[13px] text-[#18181B] dark:text-[#F4F4F5] leading-relaxed">
          <p>
            Sharing bank account numbers and IFSC codes in email threads or chat messages causes payment delays and frequent manual errors. By putting a standard NPCI UPI QR code right on your PDF invoice, your customer can open any UPI app on their phone, scan the code, and instantly approve the exact payable amount.
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            How the UPI Pay URL is Formatted:
          </h3>
          <p className="text-[#71717A] dark:text-[#A1A1AA]">
            {APP_NAME} generates standardized deep links conforming to NPCI UPI specifications:
          </p>
          <pre className="bg-[#FAF8F5] dark:bg-[#0F1011] p-3 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] font-mono text-[11px] overflow-x-auto text-[#18181B] dark:text-[#F4F4F5]">
            upi://pay?pa=harsh@okaxis&pn=HarshStudio&am=47200.00&cu=INR&tn=Invoice%20INV-26-27-0001
          </pre>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            Key Advantages:
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[#71717A] dark:text-[#A1A1AA]">
            <li>
              <strong>Exact Amount:</strong> The client does not need to type numbers; the invoice balance due is embedded right into the QR payload.
            </li>
            <li>
              <strong>Advance Payments:</strong> If you received an advance, the QR automatically asks only for the remaining balance due!
            </li>
            <li>
              <strong>Universal Compatibility:</strong> Works across Google Pay, PhonePe, Paytm, BHIM, and all mobile banking apps.
            </li>
          </ul>
        </div>
      ),
    },
    "freelancer-invoice-india": {
      title: "Complete Invoicing Guide for Indian Freelancers & Independent Consultants",
      subtitle: "From GST thresholds to B2B invoicing rules, everything you need to bill clients professionally.",
      content: (
        <div className="space-y-4 text-xs sm:text-[13px] text-[#18181B] dark:text-[#F4F4F5] leading-relaxed">
          <p>
            Starting as a freelancer in India brings questions about GST registration thresholds, invoicing rules, and taxation. Here is a clear, jargon-free summary:
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            1. Do you need GST registration?
          </h3>
          <p className="text-[#71717A] dark:text-[#A1A1AA]">
            For service providers in India, GST registration is generally required once your annual turnover exceeds ₹20 Lakhs (or ₹10 Lakhs in Special Category States). If your turnover is below this limit, you are an <em>unregistered supplier</em>.
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            2. Can an unregistered freelancer bill a company?
          </h3>
          <p className="text-[#71717A] dark:text-[#A1A1AA]">
            Yes! You simply issue a regular <strong>INVOICE</strong> without GSTIN or tax charges. You should include your PAN, bank details, and UPI ID. {APP_NAME} automatically formats this properly when you choose 'Not registered'.
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            3. Invoices above ₹50,000 to unregistered customers
          </h3>
          <p className="text-[#71717A] dark:text-[#A1A1AA]">
            Under GST rules, if an invoice to an unregistered recipient exceeds ₹50,000, you are legally required to capture the customer's name, billing address, and state. {APP_NAME} automatically prompts you for these details so you stay compliant.
          </p>
        </div>
      ),
    },
    "bill-of-supply-generator": {
      title: "Bill of Supply Generator for Composition Dealers & Exempt Supplies",
      subtitle: "Understand when to issue a Bill of Supply instead of a Tax Invoice under Indian GST law.",
      content: (
        <div className="space-y-4 text-xs sm:text-[13px] text-[#18181B] dark:text-[#F4F4F5] leading-relaxed">
          <p>
            Under Section 31(3)(c) of the CGST Act, a registered person cannot issue a Tax Invoice if they are supplying only exempt or nil-rated goods/services, or if they have opted for the Composition Scheme under Section 10. Instead, they must issue a <strong>Bill of Supply</strong>.
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            Statutory Requirements for a Bill of Supply:
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[#71717A] dark:text-[#A1A1AA]">
            <li>
              <strong>Mandatory Heading:</strong> Must clearly state 'BILL OF SUPPLY' at the top.
            </li>
            <li>
              <strong>No Tax Charged:</strong> No CGST, SGST, UTGST, or IGST can be collected from the customer.
            </li>
            <li>
              <strong>Mandatory Declaration:</strong> Composition taxpayers must explicitly print: <em>"Composition taxable person, not eligible to collect tax on supplies"</em>.
            </li>
          </ul>

          <p className="text-[#71717A] dark:text-[#A1A1AA] pt-2">
            {APP_NAME} automatically selects the right document title and prints the required legal declaration based on your seller mode and line items.
          </p>
        </div>
      ),
    },
    "gst-invoice-format": {
      title: "Statutory Indian GST Invoice Format & Content Checklist (Rule 46)",
      subtitle: "Rule 46 of the CGST Rules specifies mandatory particulars for every tax invoice.",
      content: (
        <div className="space-y-4 text-xs sm:text-[13px] text-[#18181B] dark:text-[#F4F4F5] leading-relaxed">
          <p>
            Rule 46 of the Central Goods and Services Tax Rules, 2017 outlines the mandatory particulars that must appear on a tax invoice issued by a registered taxpayer:
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            The 10 Mandatory Elements Checklist:
          </h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-[#71717A] dark:text-[#A1A1AA]">
            <li>Supplier name, address, and GSTIN.</li>
            <li>Consecutive serial number (up to 16 characters) unique for the financial year.</li>
            <li>Date of issue and payment terms.</li>
            <li>Recipient name, address, and GSTIN (if registered).</li>
            <li>HSN code for goods or SAC code for services.</li>
            <li>Description of goods or services, quantity, and unit.</li>
            <li>Total value of supply, discount, and taxable value.</li>
            <li>Rate of tax and split of CGST, SGST/UTGST, or IGST.</li>
            <li>Place of supply along with state name and 2-digit state code.</li>
            <li>Signature or digital signature / authorised signatory block.</li>
          </ol>

          <p className="text-[#71717A] dark:text-[#A1A1AA] pt-2">
            Every invoice created in {APP_NAME} is built specifically to satisfy all Rule 46 requirements.
          </p>
        </div>
      ),
    },
    "cgst-sgst-igst-rules": {
      title: "CGST vs SGST vs IGST Calculation Rules for Freelancers",
      subtitle: "How place of supply determines tax splitting and UTGST in Union Territories.",
      content: (
        <div className="space-y-4 text-xs sm:text-[13px] text-[#18181B] dark:text-[#F4F4F5] leading-relaxed">
          <p>
            The GST structure is dual-based, sharing tax between the Central and State Governments. Understanding whether your supply is intra-state or inter-state is essential:
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            1. Intra-State Supply (Seller State = Buyer State)
          </h3>
          <p className="text-[#71717A] dark:text-[#A1A1AA]">
            When the supplier and the Place of Supply are in the same state, tax is split 50:50 between <strong>CGST</strong> and <strong>SGST</strong>. For instance, at 18% GST on a ₹10,000 service, CGST is ₹900 (9%) and SGST is ₹900 (9%).
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            2. Union Territories without Legislature (UTGST)
          </h3>
          <p className="text-[#71717A] dark:text-[#A1A1AA]">
            In Union Territories that do not have their own state legislature (such as Chandigarh, Ladakh, Andaman & Nicobar, Lakshadweep, Dadra & Nagar Haveli and Daman & Diu), <strong>UTGST</strong> replaces SGST. Union Territories with legislatures (Delhi, Puducherry, Jammu & Kashmir) use regular SGST.
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            3. Inter-State Supply (Seller State ≠ Buyer State)
          </h3>
          <p className="text-[#71717A] dark:text-[#A1A1AA]">
            When the supplier and the Place of Supply are in different states, the entire 18% is levied as <strong>IGST</strong> (Integrated GST).
          </p>
        </div>
      ),
    },
    "gst-rates-slabs": {
      title: "Indian GST Rate Slabs: 0%, 5%, 18%, and 40%",
      subtitle: "Current rates under the revised GST framework and common service classifications.",
      content: (
        <div className="space-y-4 text-xs sm:text-[13px] text-[#18181B] dark:text-[#F4F4F5] leading-relaxed">
          <p>
            India operates under a 4-tier GST slab structure: 0% (Nil/Exempt), 5% (Essentials), 18% (Standard Services and Goods), and 40% (Demerit/Luxury items).
          </p>

          <h3 className="text-sm font-semibold text-[#2E6B57] dark:text-[#52B788] pt-2">
            Common Freelance & Tech Services:
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[#71717A] dark:text-[#A1A1AA]">
            <li><strong>Software & App Development (SAC 998314):</strong> 18% GST</li>
            <li><strong>UI/UX Design & Graphic Art (SAC 998391):</strong> 18% GST</li>
            <li><strong>Digital Marketing & SEO (SAC 998315):</strong> 18% GST</li>
            <li><strong>Technical Writing & Copywriting (SAC 998391):</strong> 18% GST</li>
            <li><strong>Business Consulting & Management (SAC 998311):</strong> 18% GST</li>
          </ul>

          <p className="text-[#71717A] dark:text-[#A1A1AA] pt-2">
            Invoicely presets standard rates while giving you full freedom to enter custom rates (e.g. 12%, 28%, or fractional rates) whenever required.
          </p>
        </div>
      ),
    },
  };

  const article = articles[slug] || articles["gst-invoice-generator"];

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E6B57] dark:text-[#52B788] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Invoicely</span>
      </button>

      <div className="space-y-2">
        <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-[#18181B] dark:text-[#F4F4F5]">
          {article.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
          {article.subtitle}
        </p>
      </div>

      <div className="p-5 sm:p-6 bg-white dark:bg-[#18191B] border border-[#E4E4E7] dark:border-[#27272A] rounded-2xl shadow-2xs space-y-5">
        {article.content}

        <div className="pt-5 border-t border-[#E4E4E7] dark:border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-xs text-[#18181B] dark:text-[#F4F4F5]">
              Ready to generate your invoice?
            </h4>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
              Takes under 60 seconds with instant UPI QR code. No login required.
            </p>
          </div>
          <button
            onClick={onStartInvoice}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#2E6B57] hover:bg-[#245746] dark:bg-[#52B788] text-white dark:text-[#0F1011] font-medium text-xs shadow-2xs transition-all cursor-pointer"
          >
            Create Free Invoice Now
          </button>
        </div>
      </div>
    </div>
  );
};
