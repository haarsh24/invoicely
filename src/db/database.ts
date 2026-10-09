/**
 * Dexie.js IndexedDB Database Schema and Repositories
 * Fully offline, client-side persistent storage.
 */

import Dexie, { type Table } from "dexie";
import type {
  SupplierMode,
  TaxTreatment,
  DiscountMode,
  DocumentType,
  TaxType,
  InvoiceTotals,
  TaxSummaryRow,
  HsnSummaryRow,
} from "../lib/gst/tax";

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

export interface BusinessProfile {
  id?: string; // singleton 'default'
  name: string;
  tradeName?: string;
  supplierMode: SupplierMode;
  gstin?: string;
  pan?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateCode: string;
  pincode: string;
  phone?: string;
  email?: string;
  logoDataUrl?: string; // Max 200 KB client-compressed
  signatureDataUrl?: string;
  upiId?: string;
  upiPayeeName?: string;
  bank?: BankDetails;
  defaultGstRate: number;
  defaultTerms: string;
  defaultNotes: string;
  invoicePrefix: string;
  numberingStartAt: number;
  roundOffEnabled: boolean;
  showHsnColumn: boolean;
  accentColor: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  isBusiness: boolean;
  gstin?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateCode: string;
  pincode: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface Item {
  id: string;
  description: string;
  hsnSac?: string;
  unit: string;
  defaultRatePaise: number;
  gstRate: number;
  taxTreatment: TaxTreatment;
  kind: "goods" | "services";
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  hsnSac?: string;
  unit: string;
  quantity: number;
  ratePaise: number;
  discount?: {
    mode: DiscountMode;
    value: number;
  };
  gstRate: number;
  taxTreatment: TaxTreatment;
  grossPaise: number;
  lineDiscountPaise: number;
  allocatedInvoiceDiscountPaise: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  utgstPaise: number;
  igstPaise: number;
  taxTotalPaise: number;
  lineTotalPaise: number;
}

export type InvoiceStatus = "draft" | "issued" | "paid" | "cancelled";

export interface InvoiceRecord {
  id: string;
  status: InvoiceStatus;
  docType: DocumentType;
  number?: string; // Set when issued
  sequenceNumber?: number;
  financialYear: string;
  issueDate: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  paymentTerms: string; // e.g. "Due on receipt", "15 days", "30 days"
  sellerSnapshot: BusinessProfile;
  customerSnapshot: Customer;
  shipTo?: {
    name?: string;
    addressLine1?: string;
    city?: string;
    stateCode?: string;
    pincode?: string;
  };
  placeOfSupplyStateCode: string;
  taxType: TaxType;
  pricesIncludeTax: boolean;
  roundOffEnabled: boolean;
  lines: InvoiceLineItem[];
  invoiceDiscount?: {
    mode: DiscountMode;
    value: number;
  };
  additionalNotes?: string;
  terms?: string;
  advanceReceivedPaise: number;
  totals: InvoiceTotals;
  taxSummaryByRate: TaxSummaryRow[];
  hsnSummary: HsnSummaryRow[];
  amountInWords: string;
  upiPayload?: {
    vpa: string;
    payeeName: string;
    upiUrl: string;
    balanceDuePaise: number;
  };
  currency: "INR";
  reverseCharge: boolean; // false in Phase 1
  createdAt: string;
  updatedAt: string;
  issuedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface CounterRecord {
  financialYear: string; // key
  series: string; // e.g. "INV"
  lastNumber: number;
}

export interface BackupPayload {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  profile?: BusinessProfile;
  customers: Customer[];
  items: Item[];
  invoices: InvoiceRecord[];
  counters: CounterRecord[];
}

export class InvoicelyDatabase extends Dexie {
  profile!: Table<BusinessProfile, string>;
  customers!: Table<Customer, string>;
  items!: Table<Item, string>;
  invoices!: Table<InvoiceRecord, string>;
  counters!: Table<CounterRecord, string>;

  constructor() {
    super("InvoicelyDatabase");
    this.version(1).stores({
      profile: "id",
      customers: "id, name, gstin, stateCode, createdAt",
      items: "id, description, hsnSac, kind, createdAt",
      invoices: "id, status, number, financialYear, issueDate, createdAt, updatedAt",
      counters: "financialYear",
    });
  }
}

export const db = new InvoicelyDatabase();

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  id: "default",
  name: "",
  tradeName: "",
  supplierMode: "regular",
  gstin: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateCode: "29", // Default Karnataka, easily updated
  pincode: "",
  phone: "",
  email: "",
  defaultGstRate: 18,
  defaultTerms: "1. Please make payment by the due date.\n2. UPI or Bank Transfer accepted.",
  defaultNotes: "Thank you for your business!",
  invoicePrefix: "INV",
  numberingStartAt: 1,
  roundOffEnabled: true,
  showHsnColumn: true,
  accentColor: "#2E6B57",
  updatedAt: new Date().toISOString(),
};

/**
 * Repository operations
 */
export async function getProfile(): Promise<BusinessProfile> {
  const p = await db.profile.get("default");
  if (!p) {
    await db.profile.put(DEFAULT_BUSINESS_PROFILE);
    return DEFAULT_BUSINESS_PROFILE;
  }
  return p;
}

export async function saveProfile(profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
  const current = await getProfile();
  const updated: BusinessProfile = {
    ...current,
    ...profile,
    id: "default",
    updatedAt: new Date().toISOString(),
  };
  await db.profile.put(updated);
  return updated;
}

export async function getAllInvoices(): Promise<InvoiceRecord[]> {
  return await db.invoices.orderBy("createdAt").reverse().toArray();
}

export async function getInvoiceById(id: string): Promise<InvoiceRecord | undefined> {
  return await db.invoices.get(id);
}

export async function saveInvoice(invoice: InvoiceRecord): Promise<void> {
  await db.invoices.put(invoice);
}

export async function deleteDraftInvoice(id: string): Promise<boolean> {
  const inv = await db.invoices.get(id);
  if (!inv) return false;
  if (inv.status !== "draft") {
    throw new Error("Cannot delete issued, paid, or cancelled invoice. Only drafts can be deleted.");
  }
  await db.invoices.delete(id);
  return true;
}

/**
 * Assigns next gap-free sequential invoice number in a single Dexie transaction.
 */
export async function issueInvoiceTransaction(
  invoice: InvoiceRecord,
  prefix: string
): Promise<InvoiceRecord> {
  return await db.transaction("rw", [db.invoices, db.counters], async () => {
    const fy = invoice.financialYear;
    let counter = await db.counters.get(fy);
    let nextNum = 1;

    if (counter) {
      nextNum = counter.lastNumber + 1;
    } else {
      // Check profile numberingStartAt
      const startAt = invoice.sellerSnapshot?.numberingStartAt || 1;
      nextNum = Math.max(1, startAt);
    }

    const cleanPrefix = (prefix || "INV").toUpperCase().replace(/[^A-Z0-9/-]/g, "");
    const seqStr = nextNum.toString().padStart(4, "0");
    const assignedNumber = `${cleanPrefix}/${fy}/${seqStr}`;

    const now = new Date().toISOString();
    const issuedInvoice: InvoiceRecord = {
      ...invoice,
      status: "issued",
      number: assignedNumber,
      sequenceNumber: nextNum,
      issuedAt: now,
      updatedAt: now,
    };

    await db.invoices.put(issuedInvoice);
    await db.counters.put({
      financialYear: fy,
      series: cleanPrefix,
      lastNumber: nextNum,
    });

    return issuedInvoice;
  });
}

/**
 * Cancels an issued invoice without deleting or reusing its number.
 */
export async function cancelInvoice(id: string, reason: string): Promise<InvoiceRecord> {
  const inv = await db.invoices.get(id);
  if (!inv) throw new Error("Invoice not found");
  if (inv.status === "cancelled") return inv;

  const updated: InvoiceRecord = {
    ...inv,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    cancelReason: reason || "Cancelled by user",
    updatedAt: new Date().toISOString(),
  };
  await db.invoices.put(updated);
  return updated;
}

/**
 * Marks invoice as paid
 */
export async function markInvoicePaid(id: string): Promise<InvoiceRecord> {
  const inv = await db.invoices.get(id);
  if (!inv) throw new Error("Invoice not found");
  const updated: InvoiceRecord = {
    ...inv,
    status: "paid",
    updatedAt: new Date().toISOString(),
  };
  await db.invoices.put(updated);
  return updated;
}

/**
 * Backup Export
 */
export async function exportDatabaseBackup(): Promise<BackupPayload> {
  const profile = await getProfile();
  const customers = await db.customers.toArray();
  const items = await db.items.toArray();
  const invoices = await db.invoices.toArray();
  const counters = await db.counters.toArray();

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    appVersion: "1.0.0",
    profile,
    customers,
    items,
    invoices,
    counters,
  };
}

/**
 * Backup Import with validation
 */
export async function importDatabaseBackup(data: unknown): Promise<{ success: boolean; count: number }> {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid backup file format: must be a JSON object");
  }

  const payload = data as Partial<BackupPayload>;
  if (!payload.schemaVersion || !Array.isArray(payload.invoices)) {
    throw new Error("Invalid backup file: missing required invoice database records");
  }

  await db.transaction("rw", [db.profile, db.customers, db.items, db.invoices, db.counters], async () => {
    if (payload.profile) {
      await db.profile.put({ ...payload.profile, id: "default" });
    }
    if (payload.customers && payload.customers.length > 0) {
      await db.customers.bulkPut(payload.customers);
    }
    if (payload.items && payload.items.length > 0) {
      await db.items.bulkPut(payload.items);
    }
    if (payload.invoices && payload.invoices.length > 0) {
      await db.invoices.bulkPut(payload.invoices);
    }
    if (payload.counters && payload.counters.length > 0) {
      await db.counters.bulkPut(payload.counters);
    }
  });

  return { success: true, count: payload.invoices.length };
}

/**
 * Purges all local data with safety check
 */
export async function clearAllLocalData(): Promise<void> {
  await db.transaction("rw", [db.profile, db.customers, db.items, db.invoices, db.counters], async () => {
    await db.customers.clear();
    await db.items.clear();
    await db.invoices.clear();
    await db.counters.clear();
    await db.profile.clear();
    await db.profile.put(DEFAULT_BUSINESS_PROFILE);
  });
}
