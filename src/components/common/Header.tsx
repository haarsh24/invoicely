import React from "react";
import { Plus, Sun, Moon, FileText, Bookmark, Settings, ShieldCheck } from "lucide-react";
import { APP_NAME } from "../../config/app";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewInvoice: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onNewInvoice,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F5F2EB]/95 dark:bg-[#151613]/95 backdrop-blur-md border-b border-[#E4DFD3] dark:border-[#2E2F2A] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActiveTab("landing")}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2E6B57] dark:bg-[#7CC4A6] flex items-center justify-center text-white dark:text-[#151613] font-serif font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
            I
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-xl tracking-tight text-[#1D1C1A] dark:text-[#EDEAE2]">
                {APP_NAME}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[#E2EEE8] dark:bg-[#233229] text-[#2E6B57] dark:text-[#7CC4A6]">
                GST
              </span>
            </div>
            <p className="text-[10px] text-[#6A665E] dark:text-[#A29D92] leading-none hidden sm:block">
              UPI Invoices for India
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-[#EBE5D7]/50 dark:bg-[#252622] p-1 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A]">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "invoices"
                ? "bg-white dark:bg-[#1E1F1B] text-[#1D1C1A] dark:text-[#EDEAE2] shadow-2xs font-semibold"
                : "text-[#6A665E] dark:text-[#A29D92] hover:text-[#1D1C1A] dark:hover:text-[#EDEAE2]"
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "library"
                ? "bg-white dark:bg-[#1E1F1B] text-[#1D1C1A] dark:text-[#EDEAE2] shadow-2xs font-semibold"
                : "text-[#6A665E] dark:text-[#A29D92] hover:text-[#1D1C1A] dark:hover:text-[#EDEAE2]"
            }`}
          >
            Customers & Items
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "settings"
                ? "bg-white dark:bg-[#1E1F1B] text-[#1D1C1A] dark:text-[#EDEAE2] shadow-2xs font-semibold"
                : "text-[#6A665E] dark:text-[#A29D92] hover:text-[#1D1C1A] dark:hover:text-[#EDEAE2]"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "landing"
                ? "bg-white dark:bg-[#1E1F1B] text-[#1D1C1A] dark:text-[#EDEAE2] shadow-2xs font-semibold"
                : "text-[#6A665E] dark:text-[#A29D92] hover:text-[#1D1C1A] dark:hover:text-[#EDEAE2]"
            }`}
          >
            About & FAQ
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Privacy badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#2E6B57] dark:text-[#7CC4A6] bg-[#E2EEE8] dark:bg-[#233229] px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Local Device Storage</span>
          </div>

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[#E4DFD3] dark:border-[#2E2F2A] bg-white dark:bg-[#1E1F1B] text-[#1D1C1A] dark:text-[#EDEAE2] hover:bg-[#EBE5D7] dark:hover:bg-[#252622] transition-colors text-xs font-medium cursor-pointer shadow-2xs"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-[#D9A441] shrink-0" />
                <span className="text-[11px] font-semibold text-[#EDEAE2]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#6A665E] shrink-0" />
                <span className="text-[11px] font-semibold text-[#1D1C1A]">Dark</span>
              </>
            )}
          </button>

          {/* New Invoice CTA */}
          <button
            onClick={onNewInvoice}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2E6B57] hover:bg-[#255746] dark:bg-[#7CC4A6] dark:hover:bg-[#68a88e] text-white dark:text-[#151613] text-xs font-semibold shadow-2xs hover:shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>
    </header>
  );
};
