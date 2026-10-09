/**
 * Invoicely - GST Invoice Generator with UPI QR Code
 * Main Application Shell & State Controller
 */

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/common/Header";
import { MobileTabBar } from "./components/common/MobileTabBar";
import { LandingView } from "./components/landing/LandingView";
import { InvoicesListView } from "./components/invoices/InvoicesListView";
import { InvoiceBuilderView } from "./components/builder/InvoiceBuilderView";
import { FinalizeModal } from "./components/builder/FinalizeModal";
import { InvoiceDetailView } from "./components/invoices/InvoiceDetailView";
import { LibraryView } from "./components/library/LibraryView";
import { SettingsView } from "./components/settings/SettingsView";
import { SeoArticleView } from "./components/seo/SeoArticleView";

import {
  db,
  getProfile,
  saveProfile,
  getAllInvoices,
  getInvoiceById,
  saveInvoice,
  deleteDraftInvoice,
  issueInvoiceTransaction,
  cancelInvoice,
  markInvoicePaid,
  exportDatabaseBackup,
  importDatabaseBackup,
  clearAllLocalData,
  DEFAULT_BUSINESS_PROFILE,
  type BusinessProfile,
  type Customer,
  type Item,
  type InvoiceRecord,
} from "./db/database";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("invoicely_theme") === "dark" ||
        (!("invoicely_theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  // DB State
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_BUSINESS_PROFILE);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active document states
  const [currentDraft, setCurrentDraft] = useState<InvoiceRecord | undefined>(undefined);
  const [activeInvoiceDetail, setActiveInvoiceDetail] = useState<InvoiceRecord | undefined>(
    undefined
  );
  const [finalizedInvoice, setFinalizedInvoice] = useState<InvoiceRecord | undefined>(undefined);
  const [seoSlug, setSeoSlug] = useState<string>("gst-invoice-generator");

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (darkMode) {
      root.classList.add("dark");
      body.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      body.setAttribute("data-theme", "dark");
      localStorage.setItem("invoicely_theme", "dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      body.setAttribute("data-theme", "light");
      localStorage.setItem("invoicely_theme", "light");
    }
  }, [darkMode]);

  // Initial data load
  const refreshAllData = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);

      const invs = await getAllInvoices();
      setInvoices(invs);

      const custs = await db.customers.toArray();
      setCustomers(custs);

      const its = await db.items.toArray();
      // Seed starter presets if first visit
      if (its.length === 0) {
        const starterItems: Item[] = [
          {
            id: "starter-1",
            description: "Full-Stack Web Development & UI/UX Design",
            hsnSac: "998314",
            unit: "PROJECT",
            defaultRatePaise: 4000000, // ₹40,000
            gstRate: 18,
            taxTreatment: "taxable",
            kind: "services",
            createdAt: new Date().toISOString(),
          },
          {
            id: "starter-2",
            description: "Technical Consulting & Architecture Review",
            hsnSac: "998313",
            unit: "HRS",
            defaultRatePaise: 250000, // ₹2,500/hr
            gstRate: 18,
            taxTreatment: "taxable",
            kind: "services",
            createdAt: new Date().toISOString(),
          },
        ];
        await db.items.bulkPut(starterItems);
        setItems(starterItems);
      } else {
        setItems(its);
      }
    } catch (err) {
      console.error("Database initialization error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Actions
  const handleNewInvoice = () => {
    setCurrentDraft(undefined);
    setActiveTab("builder");
  };

  const handleEditInvoice = async (id: string) => {
    const inv = await getInvoiceById(id);
    if (inv) {
      setCurrentDraft(inv);
      setActiveTab("builder");
    }
  };

  const handleViewInvoice = async (id: string) => {
    const inv = await getInvoiceById(id);
    if (inv) {
      setActiveInvoiceDetail(inv);
      setActiveTab("detail");
    }
  };

  const handleDuplicateInvoice = async (sourceInvoice: InvoiceRecord) => {
    const newDraft: InvoiceRecord = {
      ...sourceInvoice,
      id: `inv-${Date.now()}`,
      status: "draft",
      number: undefined,
      sequenceNumber: undefined,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      issuedAt: undefined,
      cancelledAt: undefined,
      cancelReason: undefined,
    };
    await saveInvoice(newDraft);
    await refreshAllData();
    setCurrentDraft(newDraft);
    setActiveTab("builder");
  };

  const handleDeleteDraft = async (id: string) => {
    await deleteDraftInvoice(id);
    await refreshAllData();
  };

  const handleCancelInvoice = async (id: string, reason: string) => {
    const cancelled = await cancelInvoice(id, reason);
    await refreshAllData();
    if (activeInvoiceDetail?.id === id) {
      setActiveInvoiceDetail(cancelled);
    }
  };

  const handleMarkPaid = async (id: string) => {
    const paid = await markInvoicePaid(id);
    await refreshAllData();
    if (activeInvoiceDetail?.id === id) {
      setActiveInvoiceDetail(paid);
    }
  };

  const handleSaveProfile = async (patch: Partial<BusinessProfile>) => {
    const updated = await saveProfile(patch);
    setProfile(updated);
    return updated;
  };

  const handleSaveDraft = async (invoice: InvoiceRecord) => {
    await saveInvoice(invoice);
    const updatedList = await getAllInvoices();
    setInvoices(updatedList);
  };

  const handleFinalize = async (invoice: InvoiceRecord) => {
    // Lock and issue with sequential numbering inside a transaction
    const issued = await issueInvoiceTransaction(invoice, profile.invoicePrefix || "INV");
    await refreshAllData();
    setFinalizedInvoice(issued);
    setActiveTab("finalize");
  };

  const handleExportBackup = async () => {
    const backup = await exportDatabaseBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoicely_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    await importDatabaseBackup(data);
    await refreshAllData();
  };

  const handleClearData = async () => {
    await clearAllLocalData();
    await refreshAllData();
    setActiveTab("landing");
  };

  const handleOpenSeoTopic = (slug: string) => {
    setSeoSlug(slug);
    setActiveTab("seo");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#151613] flex items-center justify-center text-xs text-[#6A665E] dark:text-[#A29D92]">
        Loading Invoicely...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EB] dark:bg-[#151613] text-[#1D1C1A] dark:text-[#EDEAE2] transition-colors pb-20 md:pb-6">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewInvoice={handleNewInvoice}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === "landing" && (
          <LandingView
            onStartInvoice={handleNewInvoice}
            onOpenSeoTopic={handleOpenSeoTopic}
          />
        )}

        {activeTab === "invoices" && (
          <InvoicesListView
            invoices={invoices}
            onNewInvoice={handleNewInvoice}
            onEditInvoice={handleEditInvoice}
            onViewInvoice={handleViewInvoice}
            onDuplicateInvoice={handleDuplicateInvoice}
            onDeleteDraft={handleDeleteDraft}
            onCancelInvoice={(id) => handleCancelInvoice(id, "Cancelled by user")}
            onMarkPaid={handleMarkPaid}
            onExportBackup={handleExportBackup}
          />
        )}

        {activeTab === "builder" && (
          <InvoiceBuilderView
            initialInvoice={currentDraft}
            profile={profile}
            customers={customers}
            items={items}
            onSaveProfile={handleSaveProfile}
            onSaveDraft={handleSaveDraft}
            onFinalize={handleFinalize}
            onCancelDraft={() => setActiveTab("invoices")}
          />
        )}

        {activeTab === "finalize" && finalizedInvoice && (
          <FinalizeModal
            invoice={finalizedInvoice}
            onBackToInvoices={() => setActiveTab("invoices")}
            onCreateAnother={handleNewInvoice}
          />
        )}

        {activeTab === "detail" && activeInvoiceDetail && (
          <InvoiceDetailView
            invoice={activeInvoiceDetail}
            onBack={() => setActiveTab("invoices")}
            onDuplicate={handleDuplicateInvoice}
            onCancel={handleCancelInvoice}
            onMarkPaid={handleMarkPaid}
          />
        )}

        {activeTab === "library" && (
          <LibraryView
            customers={customers}
            items={items}
            onSaveCustomer={async (c) => {
              await db.customers.put(c);
              const all = await db.customers.toArray();
              setCustomers(all);
            }}
            onDeleteCustomer={async (id) => {
              await db.customers.delete(id);
              const all = await db.customers.toArray();
              setCustomers(all);
            }}
            onSaveItem={async (it) => {
              await db.items.put(it);
              const all = await db.items.toArray();
              setItems(all);
            }}
            onDeleteItem={async (id) => {
              await db.items.delete(id);
              const all = await db.items.toArray();
              setItems(all);
            }}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onClearData={handleClearData}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}

        {activeTab === "seo" && (
          <SeoArticleView
            slug={seoSlug}
            onBack={() => setActiveTab("landing")}
            onStartInvoice={handleNewInvoice}
          />
        )}
      </main>

      {/* Mobile Navigation Tab Bar (hidden when inside builder or finalize to give full screen to invoice actions) */}
      {activeTab !== "builder" && activeTab !== "finalize" && (
        <MobileTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNewInvoice={handleNewInvoice}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}
    </div>
  );
}
