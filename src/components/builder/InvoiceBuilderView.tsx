import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Building2,
  User,
  CreditCard,
  FileSpreadsheet,
  Check,
  Eye,
  ArrowRight,
  Info,
  Edit3,
  Sparkles,
  ArrowLeft,
  Sliders,
} from "lucide-react";
import type {
  BusinessProfile,
  Customer,
  Item,
  InvoiceRecord,
} from "../../db/database";
import {
  calculateInvoice,
  type SupplierMode,
  type TaxTreatment,
  type DiscountMode,
} from "../../lib/gst/tax";
import {
  STATE_LIST,
  getStateName,
  getStateLabel,
} from "../../lib/gst/states";
import {
  STANDARD_GST_RATES,
  DEFAULT_GST_RATE,
  COMMON_HSN_SAC_PRESETS,
  STANDARD_UNITS,
} from "../../lib/gst/rates";
import {
  validateGstin,
  normalizeGstin,
} from "../../lib/gst/gstin";
import { formatPaise, rupeesToPaise } from "../../lib/gst/money";
import { getFinancialYear } from "../../lib/gst/numbering";
import { buildUpiPayUrl, generateUpiQrDataUrl } from "../../lib/upi";
import { InvoiceA4Preview } from "../invoice/InvoiceA4Preview";

interface Props {
  initialInvoice?: InvoiceRecord;
  profile: BusinessProfile;
  customers: Customer[];
  items: Item[];
  onSaveProfile: (profile: Partial<BusinessProfile>) => Promise<BusinessProfile>;
  onSaveDraft: (invoice: InvoiceRecord) => Promise<void>;
  onFinalize: (invoice: InvoiceRecord) => void;
  onCancelDraft: () => void;
}

export const InvoiceBuilderView: React.FC<Props> = ({
  initialInvoice,
  profile,
  customers,
  items,
  onSaveProfile,
  onSaveDraft,
  onFinalize,
  onCancelDraft,
}) => {
  // Mobile tab: "form" vs "preview"
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  // Local form state
  const [sellerProfile, setSellerProfile] = useState<BusinessProfile>(
    initialInvoice?.sellerSnapshot || profile
  );
  const [expandSellerDetails, setExpandSellerDetails] = useState<boolean>(
    !profile.name || !profile.stateCode
  );

  // Customer state
  const [customerName, setCustomerName] = useState(
    initialInvoice?.customerSnapshot?.name || ""
  );
  const [isBusinessCustomer, setIsBusinessCustomer] = useState(
    initialInvoice?.customerSnapshot?.isBusiness || false
  );
  const [customerGstin, setCustomerGstin] = useState(
    initialInvoice?.customerSnapshot?.gstin || ""
  );
  const [customerAddress, setCustomerAddress] = useState(
    initialInvoice?.customerSnapshot?.addressLine1 || ""
  );
  const [customerCity, setCustomerCity] = useState(
    initialInvoice?.customerSnapshot?.city || ""
  );
  const [customerStateCode, setCustomerStateCode] = useState(
    initialInvoice?.customerSnapshot?.stateCode || sellerProfile.stateCode || "29"
  );
  const [customerPincode, setCustomerPincode] = useState(
    initialInvoice?.customerSnapshot?.pincode || ""
  );
  const [customerPhone, setCustomerPhone] = useState(
    initialInvoice?.customerSnapshot?.phone || ""
  );
  const [customerEmail, setCustomerEmail] = useState(
    initialInvoice?.customerSnapshot?.email || ""
  );

  // Invoice parameters
  const [issueDate, setIssueDate] = useState(
    initialInvoice?.issueDate || new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState(initialInvoice?.dueDate || "");
  const [paymentTerms, setPaymentTerms] = useState(
    initialInvoice?.paymentTerms || "Due on receipt"
  );
  const [placeOfSupplyStateCode, setPlaceOfSupplyStateCode] = useState(
    initialInvoice?.placeOfSupplyStateCode || customerStateCode || sellerProfile.stateCode || "29"
  );
  const [pricesIncludeTax, setPricesIncludeTax] = useState(
    initialInvoice?.pricesIncludeTax || false
  );
  const [roundOffEnabled, setRoundOffEnabled] = useState(
    initialInvoice?.roundOffEnabled ?? sellerProfile.roundOffEnabled
  );
  const [advanceReceivedRupees, setAdvanceReceivedRupees] = useState(
    initialInvoice?.advanceReceivedPaise ? (initialInvoice.advanceReceivedPaise / 100).toString() : ""
  );
  const [invoiceDiscountMode, setInvoiceDiscountMode] = useState<DiscountMode>(
    initialInvoice?.invoiceDiscount?.mode || "amount"
  );
  const [invoiceDiscountVal, setInvoiceDiscountVal] = useState(
    initialInvoice?.invoiceDiscount?.value?.toString() || ""
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    initialInvoice?.additionalNotes ?? sellerProfile.defaultNotes
  );
  const [terms, setTerms] = useState(
    initialInvoice?.terms ?? sellerProfile.defaultTerms
  );

  // Line items
  const [lines, setLines] = useState<
    Array<{
      id: string;
      description: string;
      hsnSac: string;
      unit: string;
      quantity: string;
      rateRupees: string;
      discountMode: DiscountMode;
      discountVal: string;
      gstRate: number;
      taxTreatment: TaxTreatment;
      isExpanded: boolean;
    }>
  >(() => {
    if (initialInvoice?.lines && initialInvoice.lines.length > 0) {
      return initialInvoice.lines.map((l) => ({
        id: l.id,
        description: l.description,
        hsnSac: l.hsnSac || "",
        unit: l.unit || "NOS",
        quantity: l.quantity.toString(),
        rateRupees: (l.ratePaise / 100).toString(),
        discountMode: l.discount?.mode || "percent",
        discountVal: l.discount?.value?.toString() || "",
        gstRate: l.gstRate,
        taxTreatment: l.taxTreatment,
        isExpanded: false,
      }));
    }
    return [
      {
        id: "line-1",
        description: "",
        hsnSac: sellerProfile.showHsnColumn ? "998314" : "",
        unit: "NOS",
        quantity: "1",
        rateRupees: "",
        discountMode: "percent",
        discountVal: "",
        gstRate: sellerProfile.defaultGstRate || DEFAULT_GST_RATE,
        taxTreatment: "taxable",
        isExpanded: false,
      },
    ];
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Sync place of supply when customer GSTIN or customer state changes
  const handleGstinChange = (val: string) => {
    const clean = normalizeGstin(val);
    setCustomerGstin(clean);
    if (clean.length >= 2) {
      const stateFromGstin = clean.slice(0, 2);
      if (STATE_LIST.some((s) => s.code === stateFromGstin)) {
        setCustomerStateCode(stateFromGstin);
        setPlaceOfSupplyStateCode(stateFromGstin);
      }
    }
  };

  // Convert lines for calculation engine
  const calculationLines = useMemo(() => {
    return lines.map((l) => {
      const qty = parseFloat(l.quantity) || 0;
      const ratePaise = rupeesToPaise(parseFloat(l.rateRupees) || 0);
      const discVal = parseFloat(l.discountVal) || 0;

      return {
        id: l.id,
        description: l.description,
        hsnSac: l.hsnSac,
        unit: l.unit,
        quantity: qty,
        ratePaise,
        discount: discVal > 0 ? { mode: l.discountMode, value: discVal } : undefined,
        gstRate: l.gstRate,
        taxTreatment: l.taxTreatment,
      };
    });
  }, [lines]);

  const invDiscount = useMemo(() => {
    const val = parseFloat(invoiceDiscountVal) || 0;
    if (val <= 0) return undefined;
    return { mode: invoiceDiscountMode, value: val };
  }, [invoiceDiscountMode, invoiceDiscountVal]);

  const advancePaise = useMemo(() => {
    const v = parseFloat(advanceReceivedRupees) || 0;
    return rupeesToPaise(v);
  }, [advanceReceivedRupees]);

  // Pure Calculation Engine output
  const computed = useMemo(() => {
    return calculateInvoice({
      supplierMode: sellerProfile.supplierMode,
      sellerStateCode: sellerProfile.stateCode || "29",
      placeOfSupplyStateCode: placeOfSupplyStateCode || sellerProfile.stateCode || "29",
      lines: calculationLines,
      invoiceDiscount: invDiscount,
      pricesIncludeTax,
      roundOffEnabled,
      advanceReceivedPaise: advancePaise,
    });
  }, [
    sellerProfile.supplierMode,
    sellerProfile.stateCode,
    placeOfSupplyStateCode,
    calculationLines,
    invDiscount,
    pricesIncludeTax,
    roundOffEnabled,
    advancePaise,
  ]);

  // Construct draft invoice record
  const currentInvoiceDraft: InvoiceRecord = useMemo(() => {
    const fy = getFinancialYear(issueDate);
    return {
      id: initialInvoice?.id || `inv-${Date.now()}`,
      status: initialInvoice?.status || "draft",
      number: initialInvoice?.number,
      docType: computed.documentType,
      financialYear: fy,
      issueDate,
      dueDate: dueDate || undefined,
      paymentTerms,
      sellerSnapshot: sellerProfile,
      customerSnapshot: {
        id: initialInvoice?.customerSnapshot?.id || `cust-${Date.now()}`,
        name: customerName,
        isBusiness: isBusinessCustomer,
        gstin: customerGstin || undefined,
        addressLine1: customerAddress,
        city: customerCity,
        stateCode: customerStateCode,
        pincode: customerPincode,
        phone: customerPhone || undefined,
        email: customerEmail || undefined,
        createdAt: new Date().toISOString(),
      },
      placeOfSupplyStateCode,
      taxType: computed.taxType,
      pricesIncludeTax,
      roundOffEnabled,
      lines: computed.lines.map((l) => ({
        id: l.id,
        description: l.description,
        hsnSac: l.hsnSac,
        unit: l.unit,
        quantity: l.quantity,
        ratePaise: l.ratePaise,
        discount: l.totalDiscountPaise > 0 ? { mode: "amount", value: l.totalDiscountPaise / 100 } : undefined,
        gstRate: l.gstRate,
        taxTreatment: l.taxTreatment,
        grossPaise: l.grossPaise,
        lineDiscountPaise: l.lineDiscountPaise,
        allocatedInvoiceDiscountPaise: l.allocatedInvoiceDiscountPaise,
        taxablePaise: l.taxablePaise,
        cgstPaise: l.cgstPaise,
        sgstPaise: l.sgstPaise,
        utgstPaise: l.utgstPaise,
        igstPaise: l.igstPaise,
        taxTotalPaise: l.taxTotalPaise,
        lineTotalPaise: l.lineTotalPaise,
      })),
      invoiceDiscount: invDiscount,
      additionalNotes,
      terms,
      advanceReceivedPaise: advancePaise,
      totals: computed.totals,
      taxSummaryByRate: computed.taxSummaryByRate,
      hsnSummary: computed.hsnSummary,
      amountInWords: computed.amountInWords,
      currency: "INR",
      reverseCharge: false,
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [
    initialInvoice,
    computed,
    issueDate,
    dueDate,
    paymentTerms,
    sellerProfile,
    customerName,
    isBusinessCustomer,
    customerGstin,
    customerAddress,
    customerCity,
    customerStateCode,
    customerPincode,
    customerPhone,
    customerEmail,
    placeOfSupplyStateCode,
    pricesIncludeTax,
    roundOffEnabled,
    invDiscount,
    additionalNotes,
    terms,
    advancePaise,
  ]);

  // Generate UPI QR code
  useEffect(() => {
    async function updateQr() {
      if (!sellerProfile.upiId || computed.totals.balanceDuePaise <= 0) {
        setQrDataUrl("");
        return;
      }
      const upi = buildUpiPayUrl({
        vpa: sellerProfile.upiId,
        payeeName: sellerProfile.upiPayeeName || sellerProfile.name || "Merchant",
        balanceDuePaise: computed.totals.balanceDuePaise,
        invoiceNumber: initialInvoice?.number || "DRAFT",
      });
      if (upi.isValid && upi.upiUrl) {
        try {
          const url = await generateUpiQrDataUrl(upi.upiUrl, 240);
          setQrDataUrl(url);
        } catch {
          setQrDataUrl("");
        }
      } else {
        setQrDataUrl("");
      }
    }
    updateQr();
  }, [
    sellerProfile.upiId,
    sellerProfile.upiPayeeName,
    sellerProfile.name,
    computed.totals.balanceDuePaise,
    initialInvoice?.number,
  ]);

  // Autosave draft debounce
  const draftSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (initialInvoice?.status === "issued" || initialInvoice?.status === "paid" || initialInvoice?.status === "cancelled") {
      return;
    }
    if (draftSaveTimeout.current) clearTimeout(draftSaveTimeout.current);
    draftSaveTimeout.current = setTimeout(() => {
      onSaveDraft(currentInvoiceDraft);
    }, 1200);

    return () => {
      if (draftSaveTimeout.current) clearTimeout(draftSaveTimeout.current);
    };
  }, [currentInvoiceDraft, initialInvoice?.status, onSaveDraft]);

  // Validation warnings
  const gstinValidation = useMemo(() => {
    if (!customerGstin) return null;
    return validateGstin(customerGstin);
  }, [customerGstin]);

  const isUnregisteredAbove50k = useMemo(() => {
    const isUnregisteredCustomer = !isBusinessCustomer || !customerGstin;
    const isOver50k = computed.totals.grandTotalPaise > 5000000;
    const hasAddress = customerName && customerAddress && customerStateCode;
    return isOver50k && isUnregisteredCustomer && !hasAddress;
  }, [
    isBusinessCustomer,
    customerGstin,
    computed.totals.grandTotalPaise,
    customerName,
    customerAddress,
    customerStateCode,
  ]);

  const posGstinMismatch = useMemo(() => {
    if (isBusinessCustomer && customerGstin && gstinValidation?.isValidFormat) {
      const gstinState = customerGstin.slice(0, 2);
      if (gstinState !== placeOfSupplyStateCode) {
        return {
          gstinState: getStateName(gstinState),
          posState: getStateName(placeOfSupplyStateCode),
        };
      }
    }
    return null;
  }, [isBusinessCustomer, customerGstin, gstinValidation, placeOfSupplyStateCode]);

  // Line item manipulation
  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        description: "",
        hsnSac: sellerProfile.showHsnColumn ? "998314" : "",
        unit: "NOS",
        quantity: "1",
        rateRupees: "",
        discountMode: "percent",
        discountVal: "",
        gstRate: sellerProfile.defaultGstRate || DEFAULT_GST_RATE,
        taxTreatment: "taxable",
        isExpanded: false,
      },
    ]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, patch: Partial<(typeof lines)[0]>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 pb-36">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4DFD3] dark:border-[#2E2F2A]">
        <div className="flex items-center gap-2">
          <button
            onClick={onCancelDraft}
            className="p-1.5 rounded-full hover:bg-[#EBE5D7] dark:hover:bg-[#2E2F2A] text-[#6A665E] dark:text-[#A29D92]"
            title="Back to Invoices"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1D1C1A] dark:text-[#EDEAE2]">
              {initialInvoice?.number ? `Edit ${initialInvoice.number}` : "Create Invoice"}
            </h1>
            <p className="text-[11px] text-[#6A665E] dark:text-[#A29D92]">
              Autosaves locally to your device
            </p>
          </div>
        </div>

        <button
          onClick={onCancelDraft}
          className="text-xs font-semibold text-[#6A665E] dark:text-[#A29D92] hover:text-[#1D1C1A] dark:hover:text-[#EDEAE2] px-3 py-1.5 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A]"
        >
          Close
        </button>
      </div>

      {/* Mobile-First Segmented Switcher (Visible on mobile/tablet) */}
      <div className="lg:hidden flex items-center bg-[#EBE5D7]/80 dark:bg-[#252622] p-1 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] mb-5 shadow-2xs">
        <button
          type="button"
          onClick={() => setMobileTab("form")}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === "form"
              ? "bg-white dark:bg-[#1E1F1B] text-[#2E6B57] dark:text-[#7CC4A6] shadow-2xs"
              : "text-[#6A665E] dark:text-[#A29D92]"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Form</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === "preview"
              ? "bg-white dark:bg-[#1E1F1B] text-[#2E6B57] dark:text-[#7CC4A6] shadow-2xs"
              : "text-[#6A665E] dark:text-[#A29D92]"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live A4 Preview</span>
        </button>
      </div>

      {/* Desktop Grid Layout / Mobile Conditional Tab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (Left - 7 cols on desktop; shown on mobile if mobileTab === 'form') */}
        <div
          className={`lg:col-span-7 space-y-5 max-w-2xl ${
            mobileTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          {/* 1. From (Your Business) Card */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2E6B57] dark:text-[#7CC4A6]" />
                <h2 className="font-semibold text-xs uppercase tracking-wider text-[#1D1C1A] dark:text-[#EDEAE2]">
                  From (Your Business)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setExpandSellerDetails(!expandSellerDetails)}
                className="text-xs text-[#2E6B57] dark:text-[#7CC4A6] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{expandSellerDetails ? "Fold details" : "Edit details"}</span>
                {expandSellerDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Quick Summary when folded */}
            {!expandSellerDetails && (
              <div className="text-xs text-[#6A665E] dark:text-[#A29D92] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#F5F2EB] dark:bg-[#252622] p-3 rounded-xl">
                <div>
                  <p className="font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                    {sellerProfile.name || "Business name not set"}
                  </p>
                  <p className="text-[11px]">
                    {sellerProfile.supplierMode === "regular"
                      ? `GST Registered (${sellerProfile.gstin || "No GSTIN"})`
                      : sellerProfile.supplierMode === "composition"
                      ? "Composition Scheme (No GST charged)"
                      : "Not registered under GST"}
                  </p>
                </div>
                <span className="text-[11px] font-mono bg-white dark:bg-[#1E1F1B] px-2 py-0.5 rounded border border-[#E4DFD3] dark:border-[#2E2F2A]">
                  State: {getStateName(sellerProfile.stateCode || "29")}
                </span>
              </div>
            )}

            {/* Expanded fields */}
            {expandSellerDetails && (
              <div className="space-y-4 pt-2 border-t border-[#E4DFD3]/60 dark:border-[#2E2F2A]/60">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                    Business / Freelancer Name *
                  </label>
                  <input
                    type="text"
                    value={sellerProfile.name}
                    onChange={(e) => {
                      const updated = { ...sellerProfile, name: e.target.value };
                      setSellerProfile(updated);
                      onSaveProfile({ name: e.target.value });
                    }}
                    placeholder="e.g. Harsh Freelance Studio"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2] focus:outline-none focus:ring-2 focus:ring-[#2E6B57]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                    Are you registered for GST? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "regular", label: "Yes (Normal)", desc: "Charges GST" },
                      { id: "composition", label: "Composition", desc: "No tax on bill" },
                      { id: "unregistered", label: "Not Registered", desc: "Below threshold" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...sellerProfile,
                            supplierMode: opt.id as SupplierMode,
                          };
                          setSellerProfile(updated);
                          onSaveProfile({ supplierMode: opt.id as SupplierMode });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          sellerProfile.supplierMode === opt.id
                            ? "border-[#2E6B57] dark:border-[#7CC4A6] bg-[#E2EEE8]/60 dark:bg-[#233229]/60 font-semibold"
                            : "border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
                        }`}
                      >
                        <p className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-[#6A665E] dark:text-[#A29D92]">
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                      Your State *
                    </label>
                    <select
                      value={sellerProfile.stateCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const updated = { ...sellerProfile, stateCode: code };
                        setSellerProfile(updated);
                        onSaveProfile({ stateCode: code });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                    >
                      {STATE_LIST.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {sellerProfile.supplierMode === "regular" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                        Your GSTIN
                      </label>
                      <input
                        type="text"
                        value={sellerProfile.gstin || ""}
                        onChange={(e) => {
                          const val = normalizeGstin(e.target.value);
                          setSellerProfile({ ...sellerProfile, gstin: val });
                          onSaveProfile({ gstin: val });
                        }}
                        placeholder="29ABCDE1234F1Z5"
                        maxLength={15}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs font-mono uppercase text-[#1D1C1A] dark:text-[#EDEAE2]"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                      Your UPI ID (For payment QR)
                    </label>
                    <input
                      type="text"
                      value={sellerProfile.upiId || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setSellerProfile({ ...sellerProfile, upiId: val });
                        onSaveProfile({ upiId: val });
                      }}
                      placeholder="e.g. name@okaxis"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                      Street Address & City
                    </label>
                    <input
                      type="text"
                      value={sellerProfile.addressLine1 || ""}
                      onChange={(e) => {
                        setSellerProfile({ ...sellerProfile, addressLine1: e.target.value });
                        onSaveProfile({ addressLine1: e.target.value });
                      }}
                      placeholder="e.g. Indiranagar, Bengaluru"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 2. Bill To (Customer) Card */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#2E6B57] dark:text-[#7CC4A6]" />
                <h2 className="font-semibold text-xs uppercase tracking-wider text-[#1D1C1A] dark:text-[#EDEAE2]">
                  Bill To (Client / Customer)
                </h2>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#6A665E] dark:text-[#A29D92] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBusinessCustomer}
                  onChange={(e) => setIsBusinessCustomer(e.target.checked)}
                  className="rounded text-[#2E6B57] focus:ring-0 w-4 h-4"
                />
                <span>Business Customer (B2B)</span>
              </label>
            </div>

            {/* Quick customer pick if customers exist */}
            {customers.length > 0 && !customerName && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] text-[#A29D92] shrink-0">Saved:</span>
                {customers.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCustomerName(c.name);
                      setIsBusinessCustomer(c.isBusiness);
                      setCustomerGstin(c.gstin || "");
                      setCustomerAddress(c.addressLine1);
                      setCustomerCity(c.city);
                      setCustomerStateCode(c.stateCode);
                      setPlaceOfSupplyStateCode(c.stateCode);
                    }}
                    className="px-2.5 py-1 rounded-full bg-[#EBE5D7]/60 dark:bg-[#252622] hover:bg-[#E2EEE8] text-[11px] text-[#1D1C1A] dark:text-[#EDEAE2] shrink-0 transition-colors"
                  >
                    + {c.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                  Customer / Company Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                />
              </div>

              {isBusinessCustomer && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                    Customer GSTIN
                  </label>
                  <input
                    type="text"
                    value={customerGstin}
                    onChange={(e) => handleGstinChange(e.target.value)}
                    placeholder="27ABCDE1234F1Z5"
                    maxLength={15}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs font-mono uppercase text-[#1D1C1A] dark:text-[#EDEAE2]"
                  />
                  {gstinValidation && gstinValidation.warningMessage && (
                    <p className="text-[10px] text-[#9A6A12] dark:text-[#D9A441]">
                      {gstinValidation.warningMessage}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                  Billing Address
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Street, locality"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                  Customer State *
                </label>
                <select
                  value={customerStateCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setCustomerStateCode(code);
                    setPlaceOfSupplyStateCode(code);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                >
                  {STATE_LIST.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Warnings */}
            {isUnregisteredAbove50k && (
              <div className="p-3 bg-[#FFF4DC] dark:bg-[#382F17] rounded-xl border border-[#9A6A12]/30 flex items-start gap-2 text-xs text-[#9A6A12] dark:text-[#D9A441]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  This invoice is over ₹50,000 for an unregistered customer. Under GST rules, customer name, address and state are legally required.
                </span>
              </div>
            )}

            {posGstinMismatch && (
              <div className="p-3 bg-[#FFF4DC] dark:bg-[#382F17] rounded-xl border border-[#9A6A12]/30 flex items-start gap-2 text-xs text-[#9A6A12] dark:text-[#D9A441]">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Customer GSTIN is from {posGstinMismatch.gstinState} but place of supply is set to {posGstinMismatch.posState}.
                </span>
              </div>
            )}
          </section>

          {/* 3. Line Items Card */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#2E6B57] dark:text-[#7CC4A6]" />
                <h2 className="font-semibold text-xs uppercase tracking-wider text-[#1D1C1A] dark:text-[#EDEAE2]">
                  Line Items & Services ({lines.length})
                </h2>
              </div>
              {sellerProfile.supplierMode === "regular" && (
                <label className="flex items-center gap-1.5 text-xs text-[#6A665E] dark:text-[#A29D92] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pricesIncludeTax}
                    onChange={(e) => setPricesIncludeTax(e.target.checked)}
                    className="rounded text-[#2E6B57] focus:ring-0 w-4 h-4"
                  />
                  <span>Prices include GST</span>
                </label>
              )}
            </div>

            {/* Quick Catalog items suggestion pills */}
            {items.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[11px] text-[#A29D92] shrink-0">Presets:</span>
                {items.slice(0, 4).map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => {
                      setLines((prev) => [
                        ...prev,
                        {
                          id: `line-${Date.now()}`,
                          description: it.description,
                          hsnSac: it.hsnSac || "",
                          unit: it.unit || "NOS",
                          quantity: "1",
                          rateRupees: (it.defaultRatePaise / 100).toString(),
                          discountMode: "percent",
                          discountVal: "",
                          gstRate: it.gstRate,
                          taxTreatment: it.taxTreatment,
                          isExpanded: false,
                        },
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-full bg-[#EBE5D7]/60 dark:bg-[#252622] hover:bg-[#E2EEE8] text-[11px] text-[#1D1C1A] dark:text-[#EDEAE2] shrink-0 transition-colors"
                  >
                    + {it.description.slice(0, 20)}...
                  </button>
                ))}
              </div>
            )}

            {/* Line items list with mobile-first stacked cards */}
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div
                  key={line.id}
                  className="p-3.5 rounded-2xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-[#F5F2EB]/50 dark:bg-[#252622]/50 space-y-3"
                >
                  {/* Row 1: Description */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-[#6A665E] dark:text-[#A29D92]">
                        Item #{idx + 1} Description
                      </label>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-[11px] text-[#B4432F] hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(idx, { description: e.target.value })}
                      placeholder="e.g. Full-Stack Web Development"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                    />
                  </div>

                  {/* Row 2: Qty, Rate, GST% */}
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className={`${sellerProfile.supplierMode === "regular" ? "col-span-4" : "col-span-6"} space-y-1`}>
                      <label className="text-[11px] font-semibold text-[#6A665E] dark:text-[#A29D92]">
                        Qty
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        inputMode="decimal"
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, { quantity: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-center font-mono text-[#1D1C1A] dark:text-[#EDEAE2]"
                      />
                    </div>

                    <div className={`${sellerProfile.supplierMode === "regular" ? "col-span-5" : "col-span-6"} space-y-1`}>
                      <label className="text-[11px] font-semibold text-[#6A665E] dark:text-[#A29D92]">
                        Rate (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        value={line.rateRupees}
                        onChange={(e) => updateLine(idx, { rateRupees: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-2.5 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-right font-mono text-[#1D1C1A] dark:text-[#EDEAE2]"
                      />
                    </div>

                    {sellerProfile.supplierMode === "regular" && (
                      <div className="col-span-3 space-y-1">
                        <label className="text-[11px] font-semibold text-[#6A665E] dark:text-[#A29D92]">
                          GST%
                        </label>
                        <select
                          value={line.gstRate}
                          onChange={(e) => updateLine(idx, { gstRate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-1.5 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs font-mono text-[#1D1C1A] dark:text-[#EDEAE2]"
                        >
                          {STANDARD_GST_RATES.map((r) => (
                            <option key={r} value={r}>
                              {r}%
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Row 3: More options toggle (HSN, Unit, Discount) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => updateLine(idx, { isExpanded: !line.isExpanded })}
                      className="text-[11px] text-[#2E6B57] dark:text-[#7CC4A6] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>
                        {line.isExpanded
                          ? "Hide options"
                          : `More (HSN: ${line.hsnSac || "None"}, Unit: ${line.unit})`}
                      </span>
                      {line.isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {line.isExpanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E4DFD3]/60 dark:border-[#2E2F2A]/60 text-xs">
                      <div>
                        <label className="text-[10px] text-[#6A665E] dark:text-[#A29D92]">
                          HSN / SAC Code
                        </label>
                        <input
                          type="text"
                          value={line.hsnSac}
                          onChange={(e) => updateLine(idx, { hsnSac: e.target.value })}
                          placeholder="e.g. 998314"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs font-mono text-[#1D1C1A] dark:text-[#EDEAE2]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#6A665E] dark:text-[#A29D92]">
                          Unit
                        </label>
                        <select
                          value={line.unit}
                          onChange={(e) => updateLine(idx, { unit: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                        >
                          {STANDARD_UNITS.map((u) => (
                            <option key={u.code} value={u.code}>
                              {u.code}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-[#6A665E] dark:text-[#A29D92]">
                          Line Discount
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            inputMode="decimal"
                            value={line.discountVal}
                            onChange={(e) => updateLine(idx, { discountVal: e.target.value })}
                            placeholder="0"
                            className="w-full px-2 py-1.5 rounded-lg border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-right font-mono text-[#1D1C1A] dark:text-[#EDEAE2]"
                          />
                          <select
                            value={line.discountMode}
                            onChange={(e) => updateLine(idx, { discountMode: e.target.value as DiscountMode })}
                            className="px-2 py-1.5 rounded-lg border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                          >
                            <option value="percent">%</option>
                            <option value="amount">₹</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLine}
              className="w-full py-3 rounded-xl border border-dashed border-[#2E6B57] dark:border-[#7CC4A6] text-[#2E6B57] dark:text-[#7CC4A6] hover:bg-[#E2EEE8]/30 dark:hover:bg-[#233229]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Item</span>
            </button>
          </section>

          {/* 4. Details & Place of Supply */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs space-y-4">
            <h2 className="font-semibold text-xs uppercase tracking-wider text-[#1D1C1A] dark:text-[#EDEAE2]">
              Invoice Dates & Terms
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                >
                  <option value="Due on receipt">Due on receipt</option>
                  <option value="Net 7">Net 7 Days</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="50% Advance">50% Advance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                />
              </div>
            </div>

            {sellerProfile.supplierMode === "regular" && (
              <div className="space-y-1 pt-2 border-t border-[#E4DFD3]/60 dark:border-[#2E2F2A]/60">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                  <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                    Place of Supply (State)
                  </label>
                  <span className="text-[11px] text-[#2E6B57] dark:text-[#7CC4A6] font-medium">
                    {computed.plainLanguageExplanation}
                  </span>
                </div>
                <select
                  value={placeOfSupplyStateCode}
                  onChange={(e) => setPlaceOfSupplyStateCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                >
                  {STATE_LIST.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </section>

          {/* 5. Advance, Discounts & Notes */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs space-y-4">
            <h2 className="font-semibold text-xs uppercase tracking-wider text-[#1D1C1A] dark:text-[#EDEAE2]">
              Advance Received & Discounts
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                  Advance Already Received (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={advanceReceivedRupees}
                  onChange={(e) => setAdvanceReceivedRupees(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs font-mono text-[#1D1C1A] dark:text-[#EDEAE2]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                  Overall Invoice Discount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    value={invoiceDiscountVal}
                    onChange={(e) => setInvoiceDiscountVal(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs font-mono text-[#1D1C1A] dark:text-[#EDEAE2]"
                  />
                  <select
                    value={invoiceDiscountMode}
                    onChange={(e) => setInvoiceDiscountMode(e.target.value as DiscountMode)}
                    className="px-3 py-2.5 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
                  >
                    <option value="amount">₹ Off</option>
                    <option value="percent">% Off</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
                Payment Instructions / Notes
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Please scan the UPI QR code to complete payment."
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-xs text-[#1D1C1A] dark:text-[#EDEAE2]"
              />
            </div>
          </section>
        </div>

        {/* Live A4 Preview Column (Right on Desktop, or Active tab on Mobile) */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            mobileTab === "preview" ? "block" : "hidden lg:block lg:sticky lg:top-20"
          }`}
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#6A665E] dark:text-[#A29D92] uppercase tracking-wider">
              Live A4 Invoice Preview
            </span>
            <span className="text-[11px] text-[#2E6B57] dark:text-[#7CC4A6] font-semibold">
              Updates in real time
            </span>
          </div>

          <div className="bg-[#EBE5D7]/50 dark:bg-[#252622]/50 p-2 sm:p-4 rounded-3xl border border-[#E4DFD3] dark:border-[#2E2F2A] overflow-hidden max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="transform scale-[0.85] sm:scale-[0.9] lg:scale-[0.78] origin-top">
              <InvoiceA4Preview
                invoice={currentInvoiceDraft}
                computed={computed}
                qrDataUrl={qrDataUrl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#1E1F1B]/95 backdrop-blur-md border-t border-[#E4DFD3] dark:border-[#2E2F2A] px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#6A665E] dark:text-[#A29D92]">
              Grand Total:{" "}
              <span className="font-serif text-base sm:text-lg font-bold text-[#1D1C1A] dark:text-[#EDEAE2] ml-1">
                {formatPaise(computed.totals.grandTotalPaise, true)}
              </span>
            </p>
            {computed.totals.balanceDuePaise !== computed.totals.grandTotalPaise && (
              <p className="text-[10px] text-[#9A6A12] dark:text-[#D9A441] font-mono">
                Due: {formatPaise(computed.totals.balanceDuePaise, true)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileTab(mobileTab === "form" ? "preview" : "form")}
              className="lg:hidden px-3.5 py-2 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs font-bold text-[#1D1C1A] dark:text-[#EDEAE2] hover:bg-[#EBE5D7] dark:hover:bg-[#252622]"
            >
              {mobileTab === "form" ? "Preview" : "Edit Form"}
            </button>

            <button
              type="button"
              onClick={() => onFinalize(currentInvoiceDraft)}
              className="px-5 sm:px-6 py-2.5 rounded-full bg-[#2E6B57] hover:bg-[#255746] dark:bg-[#7CC4A6] dark:hover:bg-[#68a88e] text-white dark:text-[#151613] font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Finalize & Download</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
