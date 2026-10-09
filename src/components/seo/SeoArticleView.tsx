import React from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck, FileText, QrCode } from "lucide-react";
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
        <div className="space-y-4 text-xs sm:text-sm text-[#1D1C1A] dark:text-[#EDEAE2] leading-relaxed">
          <p>
            Under the Goods and Services Tax (GST) law in India, every registered taxpayer making taxable supplies of goods or services must issue a tax invoice within statutory timelines. Whether you are a web designer billing a tech firm in Karnataka or a content creator billing a company in Mumbai, issuing a clean, legally correct invoice is critical for your client to claim Input Tax Credit (ITC).
          </p>

          <h3 className="text-base font-bold text-[#2E6B57] dark:text-[#7CC4A6] pt-2">
            Key GST Rules Every Freelancer Must Know (Updated 2026):
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[#6A665E] dark:text-[#A29D92]">
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

          <h3 className="text-base font-bold text-[#2E6B57] dark:text-[#7CC4A6] pt-2">
            Why {APP_NAME} is Different:
          </h3>
          <p className="text-[#6A665E] dark:text-[#A29D92]">
            Unlike generic cloud accounting software that charges monthly subscriptions and uploads your private client details to cloud servers, {APP_NAME} runs completely inside your browser. All data remains in your local IndexedDB storage, ensuring 100% privacy and zero subscription lock-in.
          </p>
        </div>
      ),
    },
    "invoice-with-upi-qr-code": {
      title: "How to Generate GST Invoices with Dynamic UPI QR Codes",
      subtitle: "Get paid 3x faster by letting your clients scan and pay directly via GPay, PhonePe, or Paytm.",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#1D1C1A] dark:text-[#EDEAE2] leading-relaxed">
          <p>
            Sharing bank account numbers and IFSC codes in email threads or chat messages causes payment delays and frequent manual errors. By putting a standard NPCI UPI QR code right on your PDF invoice, your customer can open any UPI app on their phone, scan the code, and instantly approve the exact payable amount.
          </p>

          <h3 className="text-base font-bold text-[#2E6B57] dark:text-[#7CC4A6] pt-2">
            How the UPI Pay URL is Constructed:
          </h3>
          <p className="text-[#6A665E] dark:text-[#A29D92]">
            {APP_NAME} generates standardized deep links conforming to NPCI specifications:
          </p>
          <pre className="bg-[#EBE5D7] dark:bg-[#1E1F1B] p-3 rounded-xl font-mono text-[11px] overflow-x-auto text-[#1D1C1A] dark:text-[#EDEAE2]">
            upi://pay?pa=name@bank&pn=PayeeName&am=1180.00&cu=INR&tn=Invoice%20INV-26-27-0001
          </pre>

          <h3 className="text-base font-bold text-[#2E6B57] dark:text-[#7CC4A6] pt-2">
            Key Advantages:
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[#6A665E] dark:text-[#A29D92]">
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
        <div className="space-y-4 text-xs sm:text-sm text-[#1D1C1A] dark:text-[#EDEAE2] leading-relaxed">
          <p>
            Starting as a freelancer in India brings questions about GST registration thresholds, invoicing rules, and taxation. Here is a clear, jargon-free summary:
          </p>

          <h3 className="text-base font-bold text-[#2E6B57] dark:text-[#7CC4A6] pt-2">
            1. Do you need GST registration?
          </h3>
          <p className="text-[#6A665E] dark:text-[#A29D92]">
            For service providers in India, GST registration is generally required once your annual turnover exceeds ₹20 Lakhs (or ₹10 Lakhs in Special Category States). If your turnover is below this limit, you are an <em>unregistered supplier</em>.
          </p>

          <h3 className="text-base font-bold text-[#2E6B57] dark:text-[#7CC4A6] pt-2">
            2. Can an unregistered freelancer bill a company?
          </h3>
          <p className="text-[#6A665E] dark:text-[#A29D92]">
            Yes! You simply issue a regular <strong>INVOICE</strong> without GSTIN or tax charges. You should include your PAN, bank details, and UPI ID. {APP_NAME} automatically formats this properly when you choose 'Not registered'.
          </p>

          <h3 className="text-base font-bold text-[#2E6B57] dark:text-[#7CC4A6] pt-2">
            3. Invoices above ₹50,000 to unregistered customers
          </h3>
          <p className="text-[#6A665E] dark:text-[#A29D92]">
            Under GST rules, if an invoice to an unregistered recipient exceeds ₹50,000, you are legally required to capture the customer's name, billing address, and state. {APP_NAME} automatically warns and prompts you for these details so you stay compliant.
          </p>
        </div>
      ),
    },
    "bill-of-supply-generator": {
      title: "Bill of Supply Generator for Composition Dealers & Exempt Supplies",
      subtitle: "Understand when to issue a Bill of Supply instead of a Tax Invoice under Indian GST law.",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#1D1C1A] dark:text-[#EDEAE2] leading-relaxed">
          <p>
            Under Section 31(3)(c) of the CGST Act, a registered person cannot issue a Tax Invoice if they are supplying only exempt or nil-rated goods/services, or if they have opted for the Composition Scheme under Section 10. Instead, they must issue a <strong>Bill of Supply</strong>.
          </p>

          <h3 className="text-base font-bold text-[#2E6B57] dark:text-[#7CC4A6] pt-2">
            Statutory Requirements for a Bill of Supply:
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[#6A665E] dark:text-[#A29D92]">
            <li>
              <strong>Mandatory Heading:</strong> Must clearly state 'BILL OF SUPPLY' at the top.
            </li>
            <li>
              <strong>No Tax Charged:</strong> No CGST, SGST, UTGST, or IGST can be collected from the customer.
            </li>
            <li>
              <strong>Mandatory Declaration:</strong> Composition taxpayers must explicitly print: <em>"Composition taxable person, not eligible to collect tax on supplies"</em>.
            </li>
            <li>
              <strong>Mixed Supplies:</strong> If you supply both taxable and exempt goods/services on one bill, the title becomes <strong>Invoice-cum-Bill of Supply</strong>.
            </li>
          </ul>

          <p className="text-[#6A665E] dark:text-[#A29D92] pt-2">
            {APP_NAME} automatically selects the right document title and prints the required legal declaration based on your seller mode and line items.
          </p>
        </div>
      ),
    },
    "gst-invoice-format": {
      title: "Statutory Indian GST Invoice Format & Content Checklist",
      subtitle: "Rule 46 of the CGST Rules specifies mandatory particulars for every tax invoice.",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#1D1C1A] dark:text-[#EDEAE2] leading-relaxed">
          <p>
            Rule 46 of the Central Goods and Services Tax Rules, 2017 outlines the mandatory particulars that must appear on a tax invoice issued by a registered taxpayer:
          </p>

          <h3 className="text-base font-bold text-[#2E6B57] dark:text-[#7CC4A6] pt-2">
            The 10 Mandatory Elements Checklist:
          </h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-[#6A665E] dark:text-[#A29D92]">
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

          <p className="text-[#6A665E] dark:text-[#A29D92] pt-2">
            Every invoice created in {APP_NAME} is built specifically to satisfy all Rule 46 requirements.
          </p>
        </div>
      ),
    },
  };

  const article = articles[slug] || articles["gst-invoice-generator"];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E6B57] dark:text-[#7CC4A6] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Invoicely</span>
      </button>

      <div className="space-y-3">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1D1C1A] dark:text-[#EDEAE2]">
          {article.title}
        </h1>
        <p className="text-sm text-[#6A665E] dark:text-[#A29D92]">
          {article.subtitle}
        </p>
      </div>

      <div className="p-6 sm:p-8 bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] rounded-3xl shadow-2xs space-y-6">
        {article.content}

        <div className="pt-6 border-t border-[#E4DFD3] dark:border-[#2E2F2A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-xs text-[#1D1C1A] dark:text-[#EDEAE2]">
              Ready to create your invoice?
            </h4>
            <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
              Takes under 60 seconds. No signup required.
            </p>
          </div>
          <button
            onClick={onStartInvoice}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#2E6B57] dark:bg-[#7CC4A6] text-white dark:text-[#151613] font-semibold text-xs shadow-2xs hover:shadow"
          >
            Create Free Invoice Now
          </button>
        </div>
      </div>
    </div>
  );
};
