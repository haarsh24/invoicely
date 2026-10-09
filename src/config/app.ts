/**
 * Application Configuration & Constants
 * Single source of truth for branding, metadata, and GST verification rules.
 */

export const APP_NAME = "Invoicely";
export const SUPPORT_EMAIL = "support@invoicely.local";
export const APP_VERSION = "1.0.0";

export const FEATURE_FLAGS = {
  isProEnabled: false, // Phase 1 is 100% free; Phase 2 scaffold
  enableVoiceEntry: false,
  enableCreditNotes: false,
  enableCaExport: false,
};

/**
 * Rules to re-check before launch (VERIFY)
 * Documented in README and editable via config.
 */
export const GST_VERIFY_RULES = {
  eInvoicingTurnoverThresholdRupees: 50000000, // 5 Crore (VERIFY)
  eWayBillGoodsThresholdRupees: 50000, // 50,000 (VERIFY)
  statutoryRetentionYears: 6, // 6 Years under GST Act (VERIFY)
  compositionInterstateWarning: "Composition dealers generally cannot supply goods inter-state. Verify with your tax consultant.",
  ratesEffectiveDate: "2025-09-22",
  newSlabsNote: "Since 22 Sep 2025, standard GST slabs are 0%, 5%, 18%, and 40%.",
};
