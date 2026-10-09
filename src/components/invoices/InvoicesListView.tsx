import React, { useState } from "react";
import {
  Search,
  Plus,
  FileText,
  Download,
  Share2,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HardDriveDownload,
  Eye,
  Calendar,
} from "lucide-react";
import type { InvoiceRecord, InvoiceStatus } from "../../db/database";
import { formatPaise } from "../../lib/gst/money";
import { downloadInvoicePdf, shareInvoicePdf } from "../../lib/pdf/generatePdf";

interface Props {
  invoices: InvoiceRecord[];
  onNewInvoice: () => void;
  onEditInvoice: (id: string) => void;
  onViewInvoice: (id: string) => void;
  onDuplicateInvoice: (invoice: InvoiceRecord) => void;
  onDeleteDraft: (id: string) => void;
  onCancelInvoice: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onExportBackup: () => void;
}

export const InvoicesListView: React.FC<Props> = ({
  invoices,
  onNewInvoice,
  onEditInvoice,
  onViewInvoice,
  onDuplicateInvoice,
  onDeleteDraft,
  onCancelInvoice,
  onMarkPaid,
  onExportBackup,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");

  const filtered = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "issued"
        ? inv.status === "issued" && (inv.totals?.balanceDuePaise || 0) > 0
        : inv.status === statusFilter;

    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      (inv.number && inv.number.toLowerCase().includes(term)) ||
      (inv.customerSnapshot?.name && inv.customerSnapshot.name.toLowerCase().includes(term)) ||
      (inv.lines && inv.lines.some((l) => l.description.toLowerCase().includes(term)));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 px-4 sm:px-6 space-y-4">
      {/* Backup banner reminder */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#EBE5D7]/50 dark:bg-[#252622] border border-[#E4DFD3] dark:border-[#2E2F2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-white dark:bg-[#1E1F1B] text-[#2E6B57] dark:text-[#7CC4A6] shadow-2xs">
            <HardDriveDownload className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-[#1D1C1A] dark:text-[#EDEAE2]">
              On-Device Storage
            </p>
            <p className="text-[#6A665E] dark:text-[#A29D92]">
              Invoices are stored in your browser. Export backups regularly to prevent accidental cache clearing.
            </p>
          </div>
        </div>
        <button
          onClick={onExportBackup}
          className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] text-[#1D1C1A] dark:text-[#EDEAE2] font-medium text-xs sm:text-sm hover:bg-[#F5F2EB] dark:hover:bg-[#2E2F2A] transition-colors shrink-0 cursor-pointer"
        >
          Back up data
        </button>
      </div>

      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-medium text-[#1D1C1A] dark:text-[#EDEAE2]">
            Invoices
          </h1>
          <p className="text-xs sm:text-sm text-[#6A665E] dark:text-[#A29D92]">
            {invoices.length} recorded {invoices.length === 1 ? "invoice" : "invoices"}
          </p>
        </div>

        <button
          onClick={onNewInvoice}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E6B57] hover:bg-[#255746] dark:bg-[#7CC4A6] text-white dark:text-[#151613] text-sm font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Search and Filter Chips */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6A665E] dark:text-[#A29D92]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number, customer..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] text-sm text-[#1D1C1A] dark:text-[#EDEAE2] placeholder-[#A29D92] focus:outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "draft", "issued", "paid", "cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium capitalize transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? "bg-[#2E6B57] dark:bg-[#7CC4A6] text-white dark:text-[#151613] font-semibold"
                  : "bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] text-[#6A665E] dark:text-[#A29D92] hover:text-[#1D1C1A] dark:hover:text-[#EDEAE2]"
              }`}
            >
              {status === "issued" ? "Unpaid" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List / Empty State */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#1E1F1B] rounded-3xl border border-[#E4DFD3] dark:border-[#2E2F2A] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E2EEE8] dark:bg-[#233229] text-[#2E6B57] dark:text-[#7CC4A6] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-[#1D1C1A] dark:text-[#EDEAE2]">
              {search || statusFilter !== "all"
                ? "No matching invoices found"
                : "No invoices yet"}
            </h3>
            <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
              {search || statusFilter !== "all"
                ? "Try clearing your search query or status filter."
                : "Create your first professional invoice in under a minute."}
            </p>
          </div>
          {!search && statusFilter === "all" && (
            <button
              onClick={onNewInvoice}
              className="px-5 py-2.5 rounded-full bg-[#2E6B57] dark:bg-[#7CC4A6] text-white dark:text-[#151613] text-xs font-semibold shadow-2xs"
            >
              Create an Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => {
            const isDraft = inv.status === "draft";
            const isCancelled = inv.status === "cancelled";
            const isPaid = inv.status === "paid";
            const isUnpaid = inv.status === "issued" && (inv.totals?.balanceDuePaise || 0) > 0;

            let statusBadge = (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EBE5D7] dark:bg-[#252622] text-[#6A665E] dark:text-[#A29D92]">
                Draft
              </span>
            );

            if (isPaid) {
              statusBadge = (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E2EEE8] dark:bg-[#233229] text-[#2E7D5B] dark:text-[#6FC49B]">
                  Paid
                </span>
              );
            } else if (isUnpaid) {
              statusBadge = (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF4DC] dark:bg-[#382F17] text-[#9A6A12] dark:text-[#D9A441]">
                  Unpaid
                </span>
              );
            } else if (isCancelled) {
              statusBadge = (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FDE8E5] dark:bg-[#341B18] text-[#B4432F] dark:text-[#E27D68]">
                  Cancelled
                </span>
              );
            }

            return (
              <div
                key={inv.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] hover:border-[#2E6B57]/40 dark:hover:border-[#7CC4A6]/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                {/* Left info */}
                <div
                  onClick={() => onViewInvoice(inv.id)}
                  className="space-y-1 cursor-pointer flex-1"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-[#1D1C1A] dark:text-[#EDEAE2]">
                      {inv.number || "Draft (Unassigned)"}
                    </span>
                    {statusBadge}
                    <span className="text-[11px] text-[#A29D92]">
                      {inv.docType}
                    </span>
                  </div>

                  <p className="font-semibold text-sm text-[#1D1C1A] dark:text-[#EDEAE2]">
                    {inv.customerSnapshot?.name || "Unnamed Customer"}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#6A665E] dark:text-[#A29D92]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString("en-IN") : "Today"}
                    </span>
                    {inv.dueDate && (
                      <span>Due: {new Date(inv.dueDate).toLocaleDateString("en-IN")}</span>
                    )}
                    <span>{inv.lines?.length || 0} items</span>
                  </div>
                </div>

                {/* Right amounts & actions */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4DFD3]/60 dark:border-[#2E2F2A]/60">
                  <div className="text-left sm:text-right">
                    <p className="font-serif text-base font-bold tabular-nums text-[#1D1C1A] dark:text-[#EDEAE2]">
                      {formatPaise(inv.totals?.grandTotalPaise || 0, true)}
                    </p>
                    {isUnpaid && (
                      <p className="text-[11px] font-mono text-[#9A6A12] dark:text-[#D9A441]">
                        Due: {formatPaise(inv.totals?.balanceDuePaise || 0, true)}
                      </p>
                    )}
                  </div>

                  {/* Actions Dropdown / Quick buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewInvoice(inv.id)}
                      className="p-2.5 rounded-xl text-[#6A665E] dark:text-[#A29D92] hover:bg-[#F5F2EB] dark:hover:bg-[#2E2F2A] transition-colors cursor-pointer"
                      title="View Invoice"
                      aria-label="View Invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {isDraft ? (
                      <>
                        <button
                          onClick={() => onEditInvoice(inv.id)}
                          className="px-4 py-2 rounded-full bg-[#2E6B57] dark:bg-[#7CC4A6] text-white dark:text-[#151613] text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteDraft(inv.id)}
                          className="p-2.5 rounded-xl text-[#B4432F] hover:bg-[#FDE8E5] dark:hover:bg-[#341B18] transition-colors cursor-pointer"
                          title="Delete Draft"
                          aria-label="Delete Draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        {isUnpaid && (
                          <button
                            onClick={() => onMarkPaid(inv.id)}
                            className="p-2.5 rounded-xl text-[#2E7D5B] dark:text-[#6FC49B] hover:bg-[#E2EEE8] dark:hover:bg-[#233229] transition-colors cursor-pointer"
                            title="Mark as Paid"
                            aria-label="Mark as Paid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDuplicateInvoice(inv)}
                          className="p-2.5 rounded-xl text-[#6A665E] dark:text-[#A29D92] hover:bg-[#F5F2EB] dark:hover:bg-[#2E2F2A] transition-colors cursor-pointer"
                          title="Duplicate as New Draft"
                          aria-label="Duplicate as New Draft"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {!isCancelled && (
                          <button
                            onClick={() => onCancelInvoice(inv.id)}
                            className="p-2.5 rounded-xl text-[#B4432F] hover:bg-[#FDE8E5] dark:hover:bg-[#341B18] transition-colors cursor-pointer"
                            title="Cancel Invoice"
                            aria-label="Cancel Invoice"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
