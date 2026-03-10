import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { Transaction } from "./backend.d";
import AddEditSheet from "./components/AddEditSheet";
import BottomNav from "./components/BottomNav";
import LoginScreen from "./components/LoginScreen";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";

export type TabType = "dashboard" | "transactions";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const openAdd = () => {
    setEditingTransaction(null);
    setSheetOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingTransaction(null);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center">
      <div className="w-full max-w-[430px] min-h-screen relative flex flex-col bg-background">
        <main className="flex-1 overflow-y-auto pb-24">
          {activeTab === "dashboard" && (
            <Dashboard
              onAddTransaction={openAdd}
              onEditTransaction={openEdit}
            />
          )}
          {activeTab === "transactions" && (
            <Transactions
              onAddTransaction={openAdd}
              onEditTransaction={openEdit}
            />
          )}
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAdd={openAdd}
        />

        <AddEditSheet
          open={sheetOpen}
          onClose={closeSheet}
          transaction={editingTransaction}
        />

        <Toaster />
      </div>
    </div>
  );
}
