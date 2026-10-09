# Invoicely - Fast GST Invoice Generator with UPI QR Code

A fast, calm, privacy-first GST invoice and Bill of Supply generator with instant NPCI-compliant UPI payment QR codes, built for Indian freelancers, consultants, agency owners, and small sellers.

---

## Key Features (Phase 1)

1. **Lightning-Fast Invoicing (<60 Seconds):**
   - Start immediately with zero signups or onboarding walls.
   - Enter client name, item descriptions, rates, and get a legal invoice instantly.
2. **Dynamic UPI QR Code on Every Invoice:**
   - Standard NPCI `upi://pay` deep link with exact 2-decimal balance due and invoice number.
   - Embeds a crisp QR code that clients can scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI app.
   - Automatically deducts advance payments and only requests the net balance due.
3. **Statutory GST Tax Engine (October 2026 Rules):**
   - Pure, deterministic, framework-free tax engine in `src/lib/gst/tax.ts` using integer paise math.
   - Supports latest 2025-2026 reform slabs: **0%, 5%, 18%, 40%**, plus custom decimal rates.
   - Auto-detects **Intra-State (CGST + SGST or UTGST)** vs **Inter-State (IGST)** based on place of supply.
   - Union Territories without legislature (**Chandigarh (04), Dadra & Nagar Haveli (26), Lakshadweep (31), Andaman & Nicobar (35), Ladakh (38)**) correctly charge **CGST + UTGST**.
   - Union Territories with legislature (**Jammu & Kashmir (01), Delhi (07), Puducherry (34)**) charge **CGST + SGST**.
   - Pro-rata invoice-level discount allocation across lines using the **Largest Remainder Method** to prevent off-by-one paisa errors.
   - Tax-inclusive and tax-exclusive pricing modes.
   - Optional round-off to nearest whole rupee.
   - Amount in words in the Indian numbering format (*Lakhs, Crores, Thousands*).
4. **Three Seller Modes:**
   - **Regular Taxpayer:** Full GST compliance, tax breakdown table, SAC/HSN codes.
   - **Composition Scheme:** Issues statutory `BILL OF SUPPLY` with mandatory declaration: *"Composition taxable person, not eligible to collect tax on supplies"*.
   - **Not Registered:** Issues clean `INVOICE` with no tax columns or GSTIN for freelancers below the registration threshold.
5. **A4 Paper-Like Live Preview & Instant PDF:**
   - Real-time side-by-side preview on desktop; collapsible full preview on mobile.
   - Generates high-resolution A4 PDFs with embedded rupee symbols (`₹`), QR codes, and authorized signature.
   - Mobile Web Share API sheet integration for instant WhatsApp or email dispatch.
6. **100% Privacy & Device-Only Storage:**
   - All invoices, client profiles, and items stay strictly inside your browser's IndexedDB (via Dexie).
   - Zero telemetry, zero server-side storage of invoice data.
   - Versioned JSON backup export and restore anytime.
7. **Offline-Ready PWA:**
   - Installable on mobile home screens and desktops; works completely offline.

---

## Architecture & Code Structure

```
src/
├── config/
│   └── app.ts              # APP_NAME, APP_VERSION, support email, VERIFY rules
├── lib/
│   ├── gst/
│   │   ├── money.ts        # Integer paise helpers, ROUND_HALF_UP, Indian formatting
│   │   ├── states.ts       # 37 GST state/UT codes & UT-without-legislature rules
│   │   ├── gstin.ts        # GSTIN regex, state code, PAN & Modulo 36 checksum
│   │   ├── rates.ts        # Slabs (0, 5, 18, 40), default 18, HSN/SAC presets
│   │   ├── words.ts        # Indian numbering amount in words (Crores, Lakhs, Paise)
│   │   ├── numbering.ts    # Indian FY rollover (April 1) and 16-char serial format
│   │   └── tax.ts          # Pure deterministic GST calculation engine
│   ├── upi.ts              # VPA validation and NPCI upi://pay URI builder + QR generator
│   └── pdf/
│       └── generatePdf.ts  # Client-side A4 PDF generator & mobile share sheet
├── db/
│   └── database.ts         # Dexie IndexedDB schemas, transactions, backup export/import
├── features/pro/           # Phase 2 feature-flag layer & license validation stub
├── components/
│   ├── common/             # Top Header and Mobile Tab Bar
│   ├── invoice/            # InvoiceA4Preview component (shared across live UI, print & PDF)
│   ├── builder/            # Progressive-disclosure builder form & Finalize modal
│   ├── invoices/           # Invoice history list, filters, search & detail view
│   ├── library/            # Saved Customers and Items catalog
│   ├── settings/           # Profile, numbering prefixes, defaults, bank/UPI, backup
│   └── seo/                # Educational SEO knowledge base articles
└── App.tsx                 # App controller & router
```

---

## Rules to Re-Check Before Launch (`VERIFY`)

These values and statutory rules reflect the situation as understood in October 2026. All are centralized in `src/config/app.ts` and `src/lib/gst/rates.ts` for instant editing:

1. **E-Invoicing Turnover Threshold:** Currently ₹5 Crore (`eInvoicingTurnoverThresholdRupees: 50000000`). If annual turnover exceeds this, taxpayers must generate invoices on the government IRP portal.
2. **E-Way Bill Limit for Goods:** Set at ₹50,000 (`eWayBillGoodsThresholdRupees: 50000`). Moving goods valued above this threshold may require generating an e-way bill on the national e-way portal.
3. **Statutory Record Retention Period:** Set at 6 years under Section 36 of the CGST Act (`statutoryRetentionYears: 6`).
4. **GST Reform Slabs (22 Sep 2025):** Slabs are configured as 0%, 5%, 18%, and 40%. Special low rates (0.25% for cut diamonds, 3% for gold/silver jewellery) are supported via custom rate entry.
5. **Composition Inter-State Restrictions:** Composition dealers generally cannot make inter-state supplies of goods. The builder surfaces a soft advisory warning if a composition seller selects a place of supply outside their state.
6. **Unregistered Customer Threshold:** For unregistered customers with invoice values exceeding ₹50,000, recipient name, billing address, and state are legally required on the tax invoice.

---

## How to Test UPI QR Code in Real Apps

The UPI deep link generated conforms to NPCI standards:
```
upi://pay?pa={VPA}&pn={PayeeName}&am={AmountWith2Decimals}&cu=INR&tn={InvoiceNote}
```

**Testing procedure:**
1. Enter your UPI ID in Settings or on the Invoice Builder (e.g. `yourname@okhdfcbank` or `name@paytm`).
2. Finalize an invoice for a test amount (e.g. ₹10.00).
3. Open **Google Pay**, **PhonePe**, or **Paytm** on an Android or iOS device.
4. Tap **Scan QR code** and scan the code on your screen or printed PDF.
5. Verify that:
   - The payee name matches your business profile.
   - The amount is pre-filled to the exact balance due.
   - The note contains your invoice number (e.g. `Invoice INV/26-27/0001`).

---

## Phase 2 Scaffold Notes

Scaffold hooks are in place under `src/features/pro/index.ts` and `src/config/app.ts`:
- `isPro()` feature flag interface for license key unlock without cloud accounts.
- Voice-based invoice entry stub.
- Credit and debit notes scaffolding.
- Export invoices (zero-rated under LUT without UPI QR).
- CA summary export (B2B, B2C, HSN summary reports).
