import React from "react";
import { FileText, PlusCircle, Bookmark, Settings, Sun, Moon } from "lucide-react";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewInvoice: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const MobileTabBar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onNewInvoice,
  darkMode,
  setDarkMode,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#0F1011]/95 backdrop-blur-lg border-t border-[#E4E4E7] dark:border-[#27272A] px-2 py-1 flex items-center justify-around transition-colors">
      <button
        onClick={() => setActiveTab("invoices")}
        className={`flex flex-col items-center py-1.5 px-2 rounded-xl text-[10px] transition-colors cursor-pointer ${
          activeTab === "invoices"
            ? "text-[#2E6B57] dark:text-[#52B788] font-semibold"
            : "text-[#71717A] dark:text-[#A1A1AA] font-normal"
        }`}
      >
        <FileText className="w-4.5 h-4.5 mb-0.5" />
        <span>Invoices</span>
      </button>

      <button
        onClick={onNewInvoice}
        className="flex flex-col items-center py-1.5 px-2 rounded-xl text-[10px] font-semibold text-[#2E6B57] dark:text-[#52B788] cursor-pointer"
      >
        <PlusCircle className="w-5 h-5 mb-0.5 fill-[#2E6B57]/15 dark:fill-[#52B788]/20" />
        <span>New</span>
      </button>

      <button
        onClick={() => setActiveTab("library")}
        className={`flex flex-col items-center py-1.5 px-2 rounded-xl text-[10px] transition-colors cursor-pointer ${
          activeTab === "library"
            ? "text-[#2E6B57] dark:text-[#52B788] font-semibold"
            : "text-[#71717A] dark:text-[#A1A1AA] font-normal"
        }`}
      >
        <Bookmark className="w-4.5 h-4.5 mb-0.5" />
        <span>Library</span>
      </button>

      <button
        onClick={() => setActiveTab("settings")}
        className={`flex flex-col items-center py-1.5 px-2 rounded-xl text-[10px] transition-colors cursor-pointer ${
          activeTab === "settings"
            ? "text-[#2E6B57] dark:text-[#52B788] font-semibold"
            : "text-[#71717A] dark:text-[#A1A1AA] font-normal"
        }`}
      >
        <Settings className="w-4.5 h-4.5 mb-0.5" />
        <span>Settings</span>
      </button>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="flex flex-col items-center py-1.5 px-2 rounded-xl text-[10px] font-normal text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors cursor-pointer"
        title="Toggle Theme"
        aria-label="Toggle Theme"
      >
        {darkMode ? (
          <Sun className="w-4.5 h-4.5 mb-0.5 text-[#FBBF24]" />
        ) : (
          <Moon className="w-4.5 h-4.5 mb-0.5 text-[#71717A]" />
        )}
        <span>{darkMode ? "Light" : "Dark"}</span>
      </button>
    </nav>
  );
};
