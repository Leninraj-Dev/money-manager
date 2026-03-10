import { LayoutDashboard, List } from "lucide-react";
import type { TabType } from "../App";

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAdd: () => void;
}

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30">
      <div
        className="flex items-center justify-around px-6"
        style={{
          background: "oklch(0.13 0.022 258)",
          borderTop: "1px solid oklch(0.22 0.03 258)",
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
          paddingTop: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => onTabChange("dashboard")}
          className="flex flex-col items-center gap-1 min-w-[60px]"
          data-ocid="nav.dashboard.link"
        >
          <LayoutDashboard
            className={`w-5 h-5 transition-colors ${
              activeTab === "dashboard"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          />
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === "dashboard"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            Dashboard
          </span>
        </button>

        {/* Center FAB placeholder */}
        <div className="min-w-[60px]" />

        <button
          type="button"
          onClick={() => onTabChange("transactions")}
          className="flex flex-col items-center gap-1 min-w-[60px]"
          data-ocid="nav.transactions.link"
        >
          <List
            className={`w-5 h-5 transition-colors ${
              activeTab === "transactions"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          />
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === "transactions"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            All
          </span>
        </button>
      </div>
    </nav>
  );
}
