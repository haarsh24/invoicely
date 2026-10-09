import React from "react";
import { Plus, Sun, Moon, ShieldCheck, Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1011]/90 backdrop-blur-md border-b border-[#E4E4E7] dark:border-[#27272A] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActiveTab("landing")}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-7 h-7 rounded-lg bg-[#2E6B57] dark:bg-[#52B788] flex items-center justify-center text-white dark:text-[#0F1011] font-serif font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
            I
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-medium text-base sm:text-lg tracking-tight text-[#18181B] dark:text-[#F4F4F5]">
              {APP_NAME}
            </span>
            <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-[#EAF3EF] dark:bg-[#1B2E24] text-[#2E6B57] dark:text-[#52B788] border border-[#2E6B57]/15 dark:border-[#52B788]/20">
              GST
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F4EFE6]/60 dark:bg-[#18191B] p-1 rounded-full border border-[#E4E4E7] dark:border-[#27272A]">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-3.5 py-1.5 rounded-full text-sm transition-all cursor-pointer ${
              activeTab === "invoices"
                ? "bg-white dark:bg-[#27272A] text-[#18181B] dark:text-[#F4F4F5] shadow-2xs font-semibold"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] font-medium"
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-3.5 py-1.5 rounded-full text-sm transition-all cursor-pointer ${
              activeTab === "library"
                ? "bg-white dark:bg-[#27272A] text-[#18181B] dark:text-[#F4F4F5] shadow-2xs font-semibold"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] font-medium"
            }`}
          >
            Customers & Items
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3.5 py-1.5 rounded-full text-sm transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-white dark:bg-[#27272A] text-[#18181B] dark:text-[#F4F4F5] shadow-2xs font-semibold"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] font-medium"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3.5 py-1.5 rounded-full text-sm transition-all cursor-pointer ${
              activeTab === "landing"
                ? "bg-white dark:bg-[#27272A] text-[#18181B] dark:text-[#F4F4F5] shadow-2xs font-semibold"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] font-medium"
            }`}
          >
            About
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Privacy badge (desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#2E6B57] dark:text-[#52B788] bg-[#EAF3EF]/70 dark:bg-[#1B2E24]/70 px-2.5 py-1 rounded-full border border-[#2E6B57]/15 dark:border-[#52B788]/20 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local Storage</span>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center w-8.5 h-8.5 rounded-full border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18191B] text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F4EFE6] dark:hover:bg-[#27272A] transition-colors cursor-pointer shadow-2xs"
            title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[#FBBF24]" />
            ) : (
              <Moon className="w-4 h-4 text-[#71717A]" />
            )}
          </button>

          {/* New Invoice CTA */}
          <button
            onClick={onNewInvoice}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#2E6B57] hover:bg-[#245746] dark:bg-[#52B788] dark:hover:bg-[#409c73] text-white dark:text-[#0F1011] text-sm font-medium shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>
    </header>
  );
};
