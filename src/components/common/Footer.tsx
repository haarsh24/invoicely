import React, { useState } from "react";
import { Heart, ExternalLink, ShieldCheck, Sparkles, MapPin, CheckCircle2, ChevronRight, X } from "lucide-react";
import { APP_NAME } from "../../config/app";
import { STATE_LIST, isUnionTerritoryWithoutLegislature } from "../../lib/gst/states";

interface Props {
  onOpenSeoTopic?: (slug: string) => void;
}

export const Footer: React.FC<Props> = ({ onOpenSeoTopic }) => {
  const [showStateCodesModal, setShowStateCodesModal] = useState(false);

  const seoClusters = [
    {
      title: "Core Invoicing Tools",
      items: [
        { slug: "gst-invoice-generator", label: "Free GST Invoice Generator" },
        { slug: "invoice-with-upi-qr-code", label: "Invoice with UPI QR Code" },
        { slug: "bill-of-supply-generator", label: "Bill of Supply Generator" },
        { slug: "freelancer-invoice-india", label: "Freelancer Invoicing India" },
      ],
    },
    {
      title: "Statutory & Tax Rules",
      items: [
        { slug: "gst-invoice-format", label: "Indian GST Invoice Format (Rule 46)" },
        { slug: "cgst-sgst-igst-rules", label: "CGST, SGST & IGST Calculation" },
        { slug: "composition-scheme-guide", label: "GST Composition Scheme Rules" },
        { slug: "upi-payment-specs", label: "NPCI Dynamic UPI QR Standards" },
      ],
    },
    {
      title: "Slabs & Classification",
      items: [
        { slug: "gst-rates-slabs", label: "GST Rate Slabs: 0%, 5%, 18%, 40%" },
        { slug: "hsn-sac-guide", label: "HSN & SAC Codes for Freelancers" },
        { slug: "reverse-charge-rcm", label: "Reverse Charge Mechanism (RCM)" },
        { slug: "gst-threshold-limits", label: "GST Thresholds (₹20L / ₹40L)" },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-[#E4E4E7] dark:border-[#27272A] bg-white/70 dark:bg-[#131416]/70 backdrop-blur-md transition-colors text-[#18181B] dark:text-[#F4F4F5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-serif font-medium text-lg text-[#18181B] dark:text-[#F4F4F5] tracking-tight">
                {APP_NAME}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#EAF3EF] dark:bg-[#1B2E24] text-[#2E6B57] dark:text-[#52B788] border border-[#2E6B57]/15 dark:border-[#52B788]/20">
                100% Free & Offline
              </span>
            </div>
            <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] max-w-md leading-relaxed">
              Compliant GST invoices, Bills of Supply, and instant UPI QR codes for Indian freelancers, consultants, and independent agencies.
            </p>
          </div>

          {/* Privacy badge */}
          <div className="flex items-center gap-2 text-sm text-[#2E6B57] dark:text-[#52B788] bg-[#EAF3EF]/80 dark:bg-[#1B2E24]/80 px-3.5 py-1.5 rounded-full border border-[#2E6B57]/15 dark:border-[#52B788]/20 shadow-2xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Zero Server Storage • Stays in Browser</span>
          </div>
        </div>

        {/* SEO Knowledge Clusters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#E4E4E7]/80 dark:border-[#27272A]/80">
          {seoClusters.map((cluster) => (
            <div key={cluster.title} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
                {cluster.title}
              </h4>
              <ul className="space-y-2">
                {cluster.items.map((item) => (
                  <li key={item.slug}>
                    <button
                      onClick={() => onOpenSeoTopic?.(item.slug)}
                      className="text-[#52525B] dark:text-[#D4D4D8] hover:text-[#2E6B57] dark:hover:text-[#52B788] text-sm transition-colors flex items-center gap-1.5 cursor-pointer group text-left"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#2E6B57] dark:group-hover:text-[#52B788] transition-transform group-hover:translate-x-0.5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Tools & Statutory Lookup */}
        <div className="pt-3 border-t border-[#E4E4E7]/60 dark:border-[#27272A]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">Quick References:</span>
            <button
              onClick={() => setShowStateCodesModal(true)}
              className="px-3 py-1.5 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18191B] hover:border-[#2E6B57] dark:hover:border-[#52B788] text-xs sm:text-sm font-medium text-[#18181B] dark:text-[#F4F4F5] transition-colors cursor-pointer"
            >
              🇮🇳 All 37 GST State Codes
            </button>
            <button
              onClick={() => onOpenSeoTopic?.("gst-rates-slabs")}
              className="px-3 py-1.5 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18191B] hover:border-[#2E6B57] dark:hover:border-[#52B788] text-xs sm:text-sm font-medium text-[#18181B] dark:text-[#F4F4F5] transition-colors cursor-pointer"
            >
              Tax Slabs: 0% / 5% / 18% / 40%
            </button>
          </div>

          <p className="text-xs text-[#A1A1AA] dark:text-[#71717A]">
            Statutory standard: Rule 46 CGST Act & NPCI UPI 2.0
          </p>
        </div>

        {/* Creator & Origin Tag - Explicitly requested by user */}
        <div className="pt-4 border-t border-[#E4E4E7]/80 dark:border-[#27272A]/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-[#71717A] dark:text-[#A1A1AA]">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>Made with</span>
            <span className="text-[#DC2626] inline-block animate-pulse text-base" role="img" aria-label="love">
              ❤️
            </span>
            <span>in Ranchi by</span>
            <a
              href="https://kumarharsh.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#2E6B57] dark:text-[#52B788] hover:underline inline-flex items-center gap-1 ml-0.5 group"
            >
              <span>Harsh</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          <p className="text-xs text-[#A1A1AA] dark:text-[#71717A] text-center sm:text-right">
            Not tax advice. Please verify specific tax treatment with a certified CA.
          </p>
        </div>
      </div>

      {/* State Codes Directory Modal */}
      {showStateCodesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191B] border border-[#E4E4E7] dark:border-[#27272A] rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-medium text-base text-[#18181B] dark:text-[#F4F4F5]">
                  Indian GST State & Union Territory Codes
                </h3>
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                  Prefix used in the first 2 digits of a GSTIN and for Place of Supply
                </p>
              </div>
              <button
                onClick={() => setShowStateCodesModal(false)}
                className="p-1.5 rounded-lg text-[#71717A] hover:bg-[#F4EFE6] dark:hover:bg-[#27272A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-1.5 text-xs divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60">
              {STATE_LIST.map((state) => (
                <div key={state.code} className="pt-1.5 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#0F1011] border border-[#E4E4E7] dark:border-[#27272A] text-[#2E6B57] dark:text-[#52B788]">
                      {state.code}
                    </span>
                    <span className="text-[#18181B] dark:text-[#F4F4F5] font-medium">{state.name}</span>
                  </div>
                  {isUnionTerritoryWithoutLegislature(state.code) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] dark:bg-[#382F17] text-[#D97706] font-medium">
                      UT (UTGST)
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-[#E4E4E7] dark:border-[#27272A] text-right">
              <button
                onClick={() => setShowStateCodesModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#2E6B57] dark:bg-[#52B788] text-white dark:text-[#0F1011] text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
