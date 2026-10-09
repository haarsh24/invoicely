import React, { useState } from "react";
import {
  Users,
  Package,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Check,
  Building,
  Tag,
} from "lucide-react";
import type { Customer, Item } from "../../db/database";
import { STATE_LIST, getStateLabel } from "../../lib/gst/states";
import { STANDARD_GST_RATES, STANDARD_UNITS, COMMON_HSN_SAC_PRESETS } from "../../lib/gst/rates";
import { formatPaise, rupeesToPaise, paiseToRupees } from "../../lib/gst/money";
import { normalizeGstin } from "../../lib/gst/gstin";

interface Props {
  customers: Customer[];
  items: Item[];
  onSaveCustomer: (cust: Customer) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
  onSaveItem: (item: Item) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export const LibraryView: React.FC<Props> = ({
  customers,
  items,
  onSaveCustomer,
  onDeleteCustomer,
  onSaveItem,
  onDeleteItem,
}) => {
  const [activeTab, setActiveTab] = useState<"customers" | "items">("customers");
  const [search, setSearch] = useState("");

  // Customer Modal
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Item Modal
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);

  // Filtered lists
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase())) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredItems = items.filter(
    (it) =>
      it.description.toLowerCase().includes(search.toLowerCase()) ||
      (it.hsnSac && it.hsnSac.includes(search))
  );

  const openNewCustomer = () => {
    setEditingCustomer({
      id: `cust-${Date.now()}`,
      name: "",
      isBusiness: false,
      gstin: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      stateCode: "29",
      pincode: "",
      phone: "",
      email: "",
      createdAt: new Date().toISOString(),
    });
    setShowCustomerModal(true);
  };

  const openNewItem = () => {
    setEditingItem({
      id: `item-${Date.now()}`,
      description: "",
      hsnSac: "998314",
      unit: "NOS",
      defaultRatePaise: 0,
      gstRate: 18,
      taxTreatment: "taxable",
      kind: "services",
      createdAt: new Date().toISOString(),
    });
    setShowItemModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1D1C1A] dark:text-[#EDEAE2]">
            Library
          </h1>
          <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
            Quickly reuse saved clients and catalog items across invoices
          </p>
        </div>

        <button
          onClick={activeTab === "customers" ? openNewCustomer : openNewItem}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2E6B57] hover:bg-[#255746] dark:bg-[#7CC4A6] text-white dark:text-[#151613] text-xs font-semibold shadow-2xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{activeTab === "customers" ? "Add Customer" : "Add Item"}</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1 bg-[#EBE5D7]/50 dark:bg-[#252622] p-1 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] w-fit">
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "customers"
                ? "bg-white dark:bg-[#1E1F1B] text-[#1D1C1A] dark:text-[#EDEAE2] shadow-2xs"
                : "text-[#6A665E] dark:text-[#A29D92]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("items")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "items"
                ? "bg-white dark:bg-[#1E1F1B] text-[#1D1C1A] dark:text-[#EDEAE2] shadow-2xs"
                : "text-[#6A665E] dark:text-[#A29D92]"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Items & Services ({items.length})</span>
          </button>
        </div>

        <div className="relative max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6A665E] dark:text-[#A29D92]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs text-[#1D1C1A] dark:text-[#EDEAE2] focus:outline-none focus:ring-2 focus:ring-[#2E6B57]/30"
          />
        </div>
      </div>

      {/* Tab Content: Customers */}
      {activeTab === "customers" && (
        <div className="space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-[#1E1F1B] rounded-2xl border border-[#E4DFD3] dark:border-[#2E2F2A]">
              <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
                No customers saved yet. Add your first client to speed up invoice drafting.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] hover:border-[#2E6B57]/40 flex justify-between items-start gap-3"
                >
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-sm text-[#1D1C1A] dark:text-[#EDEAE2]">
                      {cust.name}
                    </p>
                    {cust.isBusiness && cust.gstin && (
                      <p className="font-mono text-[11px] text-[#2E6B57] dark:text-[#7CC4A6]">
                        GSTIN: {cust.gstin}
                      </p>
                    )}
                    <p className="text-[#6A665E] dark:text-[#A29D92]">
                      {[cust.city, getStateLabel(cust.stateCode)].filter(Boolean).join(", ")}
                    </p>
                    {cust.phone && <p className="text-[#A29D92]">Phone: {cust.phone}</p>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCustomer(cust);
                        setShowCustomerModal(true);
                      }}
                      className="p-1.5 rounded-lg text-[#6A665E] hover:bg-[#F5F2EB] dark:hover:bg-[#2E2F2A]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCustomer(cust.id)}
                      className="p-1.5 rounded-lg text-[#B4432F] hover:bg-[#FDE8E5] dark:hover:bg-[#341B18]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Items */}
      {activeTab === "items" && (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-[#1E1F1B] rounded-2xl border border-[#E4DFD3] dark:border-[#2E2F2A]">
              <p className="text-xs text-[#6A665E] dark:text-[#A29D92]">
                No items saved yet. Save standard design rates, development retainer, or goods.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredItems.map((it) => (
                <div
                  key={it.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1E1F1B] border border-[#E4DFD3] dark:border-[#2E2F2A] hover:border-[#2E6B57]/40 flex justify-between items-start gap-3"
                >
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-sm text-[#1D1C1A] dark:text-[#EDEAE2]">
                      {it.description}
                    </p>
                    <p className="font-serif text-base font-bold text-[#2E6B57] dark:text-[#7CC4A6]">
                      {formatPaise(it.defaultRatePaise, true)}{" "}
                      <span className="text-[11px] font-sans font-normal text-[#6A665E]">
                        / {it.unit}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#6A665E] dark:text-[#A29D92]">
                      {it.hsnSac && <span>SAC/HSN: {it.hsnSac}</span>}
                      <span>GST: {it.gstRate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(it);
                        setShowItemModal(true);
                      }}
                      className="p-1.5 rounded-lg text-[#6A665E] hover:bg-[#F5F2EB] dark:hover:bg-[#2E2F2A]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(it.id)}
                      className="p-1.5 rounded-lg text-[#B4432F] hover:bg-[#FDE8E5] dark:hover:bg-[#341B18]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F1B] rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E4DFD3] dark:border-[#2E2F2A] pb-3">
              <h3 className="font-serif font-bold text-base text-[#1D1C1A] dark:text-[#EDEAE2]">
                {editingCustomer.name ? "Edit Customer" : "Add New Customer"}
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="p-1 text-[#6A665E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Customer / Company Name *</label>
                <input
                  type="text"
                  value={editingCustomer.name}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingCustomer.isBusiness}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, isBusiness: e.target.checked })
                  }
                  className="rounded text-[#2E6B57]"
                />
                <span className="font-semibold">Business Customer (B2B)</span>
              </label>

              {editingCustomer.isBusiness && (
                <div>
                  <label className="font-semibold block mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={editingCustomer.gstin || ""}
                    onChange={(e) => {
                      const gstin = normalizeGstin(e.target.value);
                      let stateCode = editingCustomer.stateCode;
                      if (gstin.length >= 2) {
                        const s = gstin.slice(0, 2);
                        if (STATE_LIST.some((st) => st.code === s)) stateCode = s;
                      }
                      setEditingCustomer({ ...editingCustomer, gstin, stateCode });
                    }}
                    maxLength={15}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] font-mono uppercase bg-white dark:bg-[#1E1F1B]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">State *</label>
                  <select
                    value={editingCustomer.stateCode}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, stateCode: e.target.value })
                    }
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
                  <label className="font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    value={editingCustomer.city}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, city: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Billing Address</label>
                <input
                  type="text"
                  value={editingCustomer.addressLine1}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, addressLine1: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingCustomer.phone || ""}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Email</label>
                  <input
                    type="email"
                    value={editingCustomer.email || ""}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4DFD3] dark:border-[#2E2F2A] flex justify-end gap-2">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingCustomer.name) return;
                  await onSaveCustomer(editingCustomer);
                  setShowCustomerModal(false);
                }}
                className="px-5 py-2 rounded-full bg-[#2E6B57] text-white text-xs font-semibold"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F1B] rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E4DFD3] dark:border-[#2E2F2A] pb-3">
              <h3 className="font-serif font-bold text-base text-[#1D1C1A] dark:text-[#EDEAE2]">
                {editingItem.description ? "Edit Item" : "Add New Item"}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="p-1 text-[#6A665E]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Description *</label>
                <input
                  type="text"
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  placeholder="e.g. Website Development Retainer"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Default Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paiseToRupees(editingItem.defaultRatePaise)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        defaultRatePaise: rupeesToPaise(parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] font-mono bg-white dark:bg-[#1E1F1B]"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Unit</label>
                  <select
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B]"
                  >
                    {STANDARD_UNITS.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={editingItem.hsnSac || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, hsnSac: e.target.value })
                    }
                    placeholder="998314"
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] font-mono bg-white dark:bg-[#1E1F1B]"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">GST Rate</label>
                  <select
                    value={editingItem.gstRate}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        gstRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFD3] dark:border-[#2E2F2A] font-mono bg-white dark:bg-[#1E1F1B]"
                  >
                    {STANDARD_GST_RATES.map((r) => (
                      <option key={r} value={r}>
                        {r}%
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4DFD3] dark:border-[#2E2F2A] flex justify-end gap-2">
              <button
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingItem.description) return;
                  await onSaveItem(editingItem);
                  setShowItemModal(false);
                }}
                className="px-5 py-2 rounded-full bg-[#2E6B57] text-white text-xs font-semibold"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
