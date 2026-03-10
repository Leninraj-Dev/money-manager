import { Skeleton } from "@/components/ui/skeleton";
import { Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { motion } from "motion/react";
import type { Transaction } from "../backend.d";
import { useFinancialSummary, useTransactions } from "../hooks/useQueries";
import { formatAmount, formatDate, getCategoryConfig } from "../lib/categories";

interface Props {
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export default function Dashboard({
  onAddTransaction,
  onEditTransaction,
}: Props) {
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  const recent = (transactions ?? []).slice(0, 5);
  const balance = summary?.netBalance ?? 0n;
  const income = summary?.totalIncome ?? 0n;
  const expenses = summary?.totalExpenses ?? 0n;
  const isPositive = balance >= 0n;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-muted-foreground text-sm font-medium">
            Total Balance
          </p>
          <div
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
            data-ocid="dashboard.button"
          >
            <Wallet className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl p-6 mb-4 relative overflow-hidden"
          style={{
            background: isPositive
              ? "linear-gradient(135deg, oklch(0.25 0.07 208), oklch(0.20 0.05 208))"
              : "linear-gradient(135deg, oklch(0.25 0.07 25), oklch(0.20 0.05 25))",
          }}
          data-ocid="dashboard.card"
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{
              background: isPositive
                ? "oklch(0.72 0.16 208)"
                : "oklch(0.62 0.22 25)",
              transform: "translate(30%, -30%)",
            }}
          />
          {summaryLoading ? (
            <Skeleton
              className="h-12 w-48 bg-white/10"
              data-ocid="dashboard.loading_state"
            />
          ) : (
            <p
              className="text-5xl font-black tracking-tight"
              style={{
                color: isPositive
                  ? "oklch(0.72 0.16 208)"
                  : "oklch(0.65 0.22 25)",
              }}
            >
              {formatAmount(balance < 0n ? -balance : balance)}
              {balance < 0n && (
                <span className="text-3xl ml-1 opacity-80">DR</span>
              )}
            </p>
          )}
          <p className="text-sm text-white/50 mt-2">Net Balance</p>
        </motion.div>

        {/* Income / Expense Sub-cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl p-4 bg-income-subtle border border-income/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-income/20 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-income" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Income
              </span>
            </div>
            {summaryLoading ? (
              <Skeleton className="h-6 w-24 bg-white/10" />
            ) : (
              <p className="text-xl font-bold text-income">
                {formatAmount(income)}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-2xl p-4 bg-expense-subtle border border-expense/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-expense/20 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5 text-expense" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Expenses
              </span>
            </div>
            {summaryLoading ? (
              <Skeleton className="h-6 w-24 bg-white/10" />
            ) : (
              <p className="text-xl font-bold text-expense">
                {formatAmount(expenses)}
              </p>
            )}
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Recent Transactions</h2>
          <span className="text-xs text-muted-foreground">Last 5</span>
        </div>

        {txLoading ? (
          <div className="space-y-3" data-ocid="transactions.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl bg-card" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 rounded-2xl bg-card"
            data-ocid="transactions.empty_state"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Wallet className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No transactions yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Tap + to add your first one
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {recent.map((tx, i) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                index={i + 1}
                onClick={() => onEditTransaction(tx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        onClick={onAddTransaction}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center z-40"
        data-ocid="transaction.open_modal_button"
        style={{
          maxWidth: "calc(430px - 20px)",
          right: "max(20px, calc((100vw - 430px) / 2 + 20px))",
        }}
      >
        <Plus className="w-7 h-7 text-primary-foreground" />
      </motion.button>
    </div>
  );
}

function TransactionRow({
  tx,
  index,
  onClick,
}: {
  tx: Transaction;
  index: number;
  onClick: () => void;
}) {
  const cat = getCategoryConfig(tx.category);
  const Icon = cat.icon;
  const isIncome = tx.transactionType === "income";

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-card rounded-2xl px-4 py-3 text-left hover:bg-accent transition-colors"
      data-ocid={`transactions.item.${index}`}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: cat.bgColor }}
      >
        <Icon className="w-5 h-5" style={{ color: cat.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.note || cat.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDate(tx.date)}
        </p>
      </div>
      <p
        className={`text-sm font-bold shrink-0 ${isIncome ? "text-income" : "text-expense"}`}
      >
        {isIncome ? "+" : "-"}
        {formatAmount(tx.amount)}
      </p>
    </motion.button>
  );
}
