import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../backend.d";
import { useDeleteTransaction, useTransactions } from "../hooks/useQueries";
import { formatAmount, formatDate, getCategoryConfig } from "../lib/categories";

interface Props {
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export default function Transactions({
  onAddTransaction,
  onEditTransaction,
}: Props) {
  const { data: transactions, isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const monthStart = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1,
  );
  const monthEnd = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const filtered = (transactions ?? []).filter((tx) => {
    const d = new Date(Number(tx.date / 1_000_000n));
    return d >= monthStart && d <= monthEnd;
  });

  const prevMonth = () =>
    setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  };

  const monthLabel = selectedMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col min-h-full px-5 pt-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Transactions</h1>
        <Button
          size="sm"
          onClick={onAddTransaction}
          className="rounded-xl gap-1 h-8 px-3"
          data-ocid="transaction.open_modal_button"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {/* Month Filter */}
      <div className="flex items-center justify-between bg-card rounded-2xl px-3 py-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="h-8 w-8 rounded-xl"
          data-ocid="transactions.pagination_prev"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <p className="text-sm font-semibold">{monthLabel}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-8 w-8 rounded-xl"
          data-ocid="transactions.pagination_next"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Monthly summary */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-income-subtle border border-income/20 rounded-2xl px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Income</p>
            <p className="text-sm font-bold text-income">
              {formatAmount(
                filtered
                  .filter((t) => t.transactionType === "income")
                  .reduce((sum, t) => sum + t.amount, 0n),
              )}
            </p>
          </div>
          <div className="bg-expense-subtle border border-expense/20 rounded-2xl px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Expenses</p>
            <p className="text-sm font-bold text-expense">
              {formatAmount(
                filtered
                  .filter((t) => t.transactionType === "expense")
                  .reduce((sum, t) => sum + t.amount, 0n),
              )}
            </p>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="transactions.loading_state">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 rounded-2xl bg-card mt-2"
          data-ocid="transactions.empty_state"
        >
          <p className="text-sm font-medium text-muted-foreground">
            No transactions this month
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Try a different month or add one
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {filtered.map((tx, i) => (
              <TxRow
                key={tx.id}
                tx={tx}
                index={i + 1}
                onEdit={() => onEditTransaction(tx)}
                onDelete={() => setDeleteTarget(tx)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="max-w-xs rounded-3xl"
          data-ocid="transactions.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              data-ocid="transactions.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
              data-ocid="transactions.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TxRow({
  tx,
  index,
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cat = getCategoryConfig(tx.category);
  const Icon = cat.icon;
  const isIncome = tx.transactionType === "income";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3"
      data-ocid={`transactions.item.${index}`}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: cat.bgColor }}
      >
        <Icon className="w-5 h-5" style={{ color: cat.color }} />
      </div>
      <button
        type="button"
        className="flex-1 min-w-0 text-left"
        onClick={onEdit}
      >
        <p className="text-sm font-medium truncate">{tx.note || cat.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {cat.label} · {formatDate(tx.date)}
        </p>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        <p
          className={`text-sm font-bold ${isIncome ? "text-income" : "text-expense"}`}
        >
          {isIncome ? "+" : "-"}
          {formatAmount(tx.amount)}
        </p>
        <button
          type="button"
          onClick={onDelete}
          className="w-7 h-7 rounded-lg bg-destructive/10 hover:bg-destructive/25 flex items-center justify-center transition-colors"
          data-ocid={`transactions.delete_button.${index}`}
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>
    </motion.div>
  );
}
