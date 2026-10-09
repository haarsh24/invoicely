import React, { useState } from "react";
import {
  Building2,
  Sliders,
  CreditCard,
  HardDrive,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Palette,
} from "lucide-react";
import type { BusinessProfile } from "../../db/database";
import { STATE_LIST, getStateLabel } from "../../lib/gst/states";
import { STANDARD_GST_RATES, DEFAULT_GST_RATE } from "../../lib/gst/rates";
import { validateGstin, normalizeGstin } from "../../lib/gst/gstin";
import { validateInvoiceNumber } from "../../lib/gst/numbering";
import { validateVpa } from "../../lib/upi";
import { APP_NAME, GST_VERIFY_RULES } from "../../config/app";

interface Props {
  profile: BusinessProfile;
  onSaveProfile: (profile: Partial<BusinessProfile>) => Promise<BusinessProfile>;
  onExportBackup: () => void;
  onImportBackup: (file: File) => Promise<void>;
  onClearData: () => Promise<void>;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const SettingsView: React.FC<Props> = ({
  profile,
  onSaveProfile,
  onExportBackup,
  onImportBackup,
  onClearData,
  darkMode,
  setDarkMode,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Client-side resize and compression to keep logo under ~150KB
        const canvas = document.createElement("canvas");
        const maxDim = 300;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/png");
          setFormData((prev) => ({ ...prev, logoDataUrl: dataUrl }));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const prefixValidation = validateInvoiceNumber(`${formData.invoicePrefix}/26-27/0001`);

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1D1C1A] dark:text-[#EDEAE2]">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#6A665E] dark:text-[#A29D92]">
          Configure your business profile, default GST rates, UPI payment details, and data backups
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E4DFD3] dark:border-[#2E2F2A] pb-3">
            <Building2 className="w-4 h-4 text-[#2E6B57] dark:text-[#7CC4A6]" />
            <h2 className="font-serif font-bold text-base text-[#1D1C1A] dark:text-[#EDEAE2]">
              Business Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Business / Trade Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Business Name"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Trade Name / Subtitle</label>
              <input
                type="text"
                value={formData.tradeName || ""}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                placeholder="Optional brand / division name"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">GST Registration Mode *</label>
              <select
                value={formData.supplierMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplierMode: e.target.value as BusinessProfile["supplierMode"],
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              >
                <option value="regular">Regular GST Registered (Charges GST)</option>
                <option value="composition">Composition Scheme (Bill of Supply)</option>
                <option value="unregistered">Not Registered under GST (Invoice)</option>
              </select>
            </div>

            {formData.supplierMode === "regular" && (
              <div>
                <label className="font-semibold block mb-1">Your GSTIN</label>
                <input
                  type="text"
                  value={formData.gstin || ""}
                  onChange={(e) => {
                    const g = normalizeGstin(e.target.value);
                    setFormData({ ...formData, gstin: g });
                  }}
                  maxLength={15}
                  placeholder="29ABCDE1234F1Z5"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] font-mono uppercase bg-white dark:bg-[#1E1F1B]"
                />
              </div>
            )}

            <div>
              <label className="font-semibold block mb-1">Your State *</label>
              <select
                value={formData.stateCode}
                onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              >
                {STATE_LIST.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">City & Pincode</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-2/3 px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
                />
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                  maxLength={6}
                  className="w-1/3 px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] font-mono bg-white dark:bg-[#1E1F1B]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold block mb-1">Street Address</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="Building, street, locality"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="billing@example.com"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            {/* Logo upload */}
            <div>
              <label className="font-semibold block mb-1">Business Logo</label>
              <div className="flex items-center gap-3">
                {formData.logoDataUrl && (
                  <img
                    src={formData.logoDataUrl}
                    alt="Logo"
                    className="w-10 h-10 object-contain rounded-lg border border-[#E4DFD3] bg-white p-0.5"
                  />
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleLogoUpload}
                  className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#E2EEE8] file:text-[#2E6B57]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Defaults & Numbering */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E4DFD3] dark:border-[#2E2F2A] pb-3">
            <Sliders className="w-4 h-4 text-[#2E6B57] dark:text-[#7CC4A6]" />
            <h2 className="font-serif font-bold text-base text-[#1D1C1A] dark:text-[#EDEAE2]">
              Invoice Numbering & Defaults
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Invoice Prefix *</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoicePrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9/-]/g, ""),
                  })
                }
                placeholder="INV"
                maxLength={6}
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] font-mono bg-white dark:bg-[#1E1F1B]"
              />
              <p className="text-[10px] text-[#6A665E] mt-1">
                Sample: {formData.invoicePrefix || "INV"}/26-27/0001
              </p>
              {!prefixValidation.isValid && (
                <p className="text-[10px] text-[#B4432F]">{prefixValidation.error}</p>
              )}
            </div>

            <div>
              <label className="font-semibold block mb-1">Starting Sequence Number</label>
              <input
                type="number"
                min="1"
                value={formData.numberingStartAt}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberingStartAt: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] font-mono bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Default GST Rate</label>
              <select
                value={formData.defaultGstRate}
                onChange={(e) =>
                  setFormData({ ...formData, defaultGstRate: parseFloat(e.target.value) || 18 })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              >
                {STANDARD_GST_RATES.map((r) => (
                  <option key={r} value={r}>
                    {r}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.roundOffEnabled}
                onChange={(e) => setFormData({ ...formData, roundOffEnabled: e.target.checked })}
                className="rounded text-[#2E6B57]"
              />
              <span className="font-semibold">Round off grand total to nearest rupee</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showHsnColumn}
                onChange={(e) => setFormData({ ...formData, showHsnColumn: e.target.checked })}
                className="rounded text-[#2E6B57]"
              />
              <span className="font-semibold">Show HSN/SAC column on invoice</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="font-semibold block mb-1">Default Notes</label>
              <textarea
                rows={2}
                value={formData.defaultNotes}
                onChange={(e) => setFormData({ ...formData, defaultNotes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Default Terms & Conditions</label>
              <textarea
                rows={2}
                value={formData.defaultTerms}
                onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
            </div>
          </div>
        </div>

        {/* Payment & Bank Details */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E4DFD3] dark:border-[#2E2F2A] pb-3">
            <CreditCard className="w-4 h-4 text-[#2E6B57] dark:text-[#7CC4A6]" />
            <h2 className="font-serif font-bold text-base text-[#1D1C1A] dark:text-[#EDEAE2]">
              UPI & Bank Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Your UPI ID (VPA)</label>
              <input
                type="text"
                value={formData.upiId || ""}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value.trim() })}
                placeholder="name@okaxis"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
              <p className="text-[10px] text-[#6A665E] mt-1">
                Generates instant payment QR code on every invoice
              </p>
            </div>

            <div>
              <label className="font-semibold block mb-1">UPI Payee Name</label>
              <input
                type="text"
                value={formData.upiPayeeName || ""}
                onChange={(e) => setFormData({ ...formData, upiPayeeName: e.target.value })}
                placeholder="Merchant / Personal name on UPI"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bank?.bankName || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank: {
                      accountName: formData.bank?.accountName || formData.name,
                      accountNumber: formData.bank?.accountNumber || "",
                      ifsc: formData.bank?.ifsc || "",
                      bankName: e.target.value,
                    },
                  })
                }
                placeholder="e.g. HDFC Bank"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Account Holder Name</label>
              <input
                type="text"
                value={formData.bank?.accountName || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank: {
                      bankName: formData.bank?.bankName || "",
                      accountNumber: formData.bank?.accountNumber || "",
                      ifsc: formData.bank?.ifsc || "",
                      accountName: e.target.value,
                    },
                  })
                }
                placeholder="Account name"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bank?.accountNumber || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank: {
                      bankName: formData.bank?.bankName || "",
                      accountName: formData.bank?.accountName || formData.name,
                      ifsc: formData.bank?.ifsc || "",
                      accountNumber: e.target.value.trim(),
                    },
                  })
                }
                placeholder="Account number"
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] font-mono bg-white dark:bg-[#1E1F1B]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.bank?.ifsc || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank: {
                      bankName: formData.bank?.bankName || "",
                      accountName: formData.bank?.accountName || formData.name,
                      accountNumber: formData.bank?.accountNumber || "",
                      ifsc: e.target.value.toUpperCase().trim(),
                    },
                  })
                }
                placeholder="HDFC0001234"
                maxLength={11}
                className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] font-mono uppercase bg-white dark:bg-[#1E1F1B]"
              />
            </div>
          </div>
        </div>

        {/* Save button banner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs text-[#2E7D5B] dark:text-[#6FC49B] flex items-center gap-1 font-semibold">
                <CheckCircle className="w-4 h-4" />
                Settings saved successfully!
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#2E6B57] hover:bg-[#255746] dark:bg-[#7CC4A6] text-white dark:text-[#151613] font-semibold text-xs shadow-2xs transition-all"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Appearance & Theme */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E4DFD3] dark:border-[#2E2F2A] pb-3">
          <Palette className="w-4 h-4 text-[#2E6B57] dark:text-[#7CC4A6]" />
          <h2 className="font-serif font-bold text-base text-[#1D1C1A] dark:text-[#EDEAE2]">
            Appearance & Theme
          </h2>
        </div>

        <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
          Choose your interface theme. Automatically saves your preference across visits.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => setDarkMode(false)}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
              !darkMode
                ? "border-[#2E6B57] bg-[#EAF3EF] text-[#2E6B57] font-semibold shadow-2xs"
                : "border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18191B] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#FAF8F5] dark:hover:bg-[#27272A]"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs border border-[#E4E4E7] text-sm">
              ☀️
            </div>
            <span className="text-xs font-medium">Light Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setDarkMode(true)}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
              darkMode
                ? "border-[#52B788] bg-[#1B2E24] text-[#52B788] font-semibold shadow-2xs"
                : "border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18191B] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#FAF8F5] dark:hover:bg-[#27272A]"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#0F1011] flex items-center justify-center shadow-xs border border-[#27272A] text-sm text-[#FBBF24]">
              🌙
            </div>
            <span className="text-xs font-medium">Dark Theme</span>
          </button>
        </div>
      </div>

      {/* Backup and Data Maintenance */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E4DFD3] dark:border-[#2E2F2A] pb-3">
          <HardDrive className="w-4 h-4 text-[#2E6B57] dark:text-[#7CC4A6]" />
          <h2 className="font-serif font-bold text-base text-[#1D1C1A] dark:text-[#EDEAE2]">
            Data, Backup & Privacy
          </h2>
        </div>

        <p className="text-xs text-[#6A665E] dark:text-[#A29D92] leading-relaxed">
          {APP_NAME} stores 100% of your records locally inside your browser's IndexedDB database. Nothing is sent to any cloud server. Statutory guideline recommends keeping invoice records for at least {GST_VERIFY_RULES.statutoryRetentionYears} years.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExportBackup}
            className="px-4 py-2 rounded-full bg-[#E2EEE8] dark:bg-[#233229] text-[#2E6B57] dark:text-[#7CC4A6] text-xs font-semibold flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="px-4 py-2 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs font-semibold cursor-pointer flex items-center gap-2 hover:bg-[#F5F2EB] dark:hover:bg-[#2E2F2A]">
            <Upload className="w-3.5 h-3.5 text-[#6A665E]" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  try {
                    await onImportBackup(f);
                    setImportStatus("Backup restored successfully!");
                  } catch (err: unknown) {
                    setImportStatus(`Restore failed: ${(err as Error).message}`);
                  }
                }
              }}
            />
          </label>
        </div>

        {importStatus && (
          <p className="text-xs text-[#2E7D5B] dark:text-[#6FC49B]">{importStatus}</p>
        )}

        {/* Clear Data Danger Zone */}
        <div className="pt-4 border-t border-[#E4DFD3] dark:border-[#2E2F2A]">
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="text-xs text-[#B4432F] hover:underline flex items-center gap-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete all local data...</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F1B] rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#FDE8E5] dark:bg-[#341B18] text-[#B4432F] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-[#1D1C1A] dark:text-[#EDEAE2]">
                Erase all local invoices and data?
              </h3>
              <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
                This will permanently delete all invoices, customers, items, and settings stored in this browser. Please export a backup first if you want to keep records.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onClearData();
                  setDeleteConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-full bg-[#B4432F] text-white text-xs font-semibold"
              >
                Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
