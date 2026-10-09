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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#F5F2EB]/95 dark:bg-[#151613]/95 backdrop-blur-md border-t border-[#E4DFD3] dark:border-[#2E2F2A] px-2 py-1.5 flex items-center justify-around transition-colors">
      <button
        onClick={() => setActiveTab("invoices")}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
          activeTab === "invoices"
            ? "text-[#2E6B57] dark:text-[#7CC4A6] font-semibold"
            : "text-[#6A665E] dark:text-[#A29D92]"
        }`}
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span>Invoices</span>
      </button>

      <button
        onClick={onNewInvoice}
        className="flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold text-[#2E6B57] dark:text-[#7CC4A6] cursor-pointer"
      >
        <PlusCircle className="w-6 h-6 mb-0.5 fill-[#2E6B57]/15 dark:fill-[#7CC4A6]/15" />
        <span>New</span>
      </button>

      <button
        onClick={() => setActiveTab("library")}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
          activeTab === "library"
            ? "text-[#2E6B57] dark:text-[#7CC4A6] font-semibold"
            : "text-[#6A665E] dark:text-[#A29D92]"
        }`}
      >
        <Bookmark className="w-5 h-5 mb-0.5" />
        <span>Library</span>
      </button>

      <button
        onClick={() => setActiveTab("settings")}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
          activeTab === "settings"
            ? "text-[#2E6B57] dark:text-[#7CC4A6] font-semibold"
            : "text-[#6A665E] dark:text-[#A29D92]"
        }`}
      >
        <Settings className="w-5 h-5 mb-0.5" />
        <span>Settings</span>
      </button>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium text-[#6A665E] dark:text-[#A29D92] transition-colors cursor-pointer"
        title="Toggle Theme"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 mb-0.5 text-[#D9A441]" />
        ) : (
          <Moon className="w-5 h-5 mb-0.5 text-[#6A665E]" />
        )}
        <span>{darkMode ? "Light" : "Dark"}</span>
      </button>
    </nav>
  );
};
