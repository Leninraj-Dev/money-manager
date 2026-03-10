import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../backend.d";
import { useAddTransaction, useEditTransaction } from "../hooks/useQueries";
import { CATEGORIES, dateFromBigInt, dateToBigInt } from "../lib/categories";

interface Props {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

function dateToInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AddEditSheet({ open, onClose, transaction }: Props) {
  const isEditing = !!transaction;
  const addMutation = useAddTransaction();
  const editMutation = useEditTransaction();
  const isPending = addMutation.isPending || editMutation.isPending;

  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(dateToInputValue(new Date()));

  useEffect(() => {
    if (transaction) {
      setTxType(transaction.transactionType as "income" | "expense");
      setAmount((Number(transaction.amount) / 100).toFixed(2));
      setCategory(transaction.category);
      setNote(transaction.note);
      setDate(dateToInputValue(dateFromBigInt(transaction.date)));
    } else {
      setTxType("expense");
      setAmount("");
      setCategory("Food");
      setNote("");
      setDate(dateToInputValue(new Date()));
    }
  }, [transaction]);

  const handleSave = async () => {
    const amountNum = Number.parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    const amountCents = BigInt(Math.round(amountNum * 100));
    const dateBigInt = dateToBigInt(new Date(`${date}T12:00:00`));

    try {
      if (isEditing && transaction) {
        await editMutation.mutateAsync({
          id: transaction.id,
          amount: amountCents,
          transactionType: txType,
          category,
          note,
          date: dateBigInt,
        });
        toast.success("Transaction updated");
      } else {
        await addMutation.mutateAsync({
          amount: amountCents,
          transactionType: txType,
          category,
          note,
          date: dateBigInt,
        });
        toast.success("Transaction added");
      }
      onClose();
    } catch {
      toast.error("Failed to save transaction");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card rounded-t-3xl z-50 px-5 pt-4 pb-10"
            data-ocid="transaction.modal"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />

            {/* Title + close */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {isEditing ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"
                data-ocid="transaction.close_button"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Income / Expense Toggle */}
            <div className="flex bg-muted rounded-2xl p-1 mb-5">
              <button
                type="button"
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  txType === "income"
                    ? "bg-income-subtle text-income"
                    : "text-muted-foreground"
                }`}
                onClick={() => setTxType("income")}
                data-ocid="transaction.toggle"
              >
                Income
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  txType === "expense"
                    ? "bg-expense-subtle text-expense"
                    : "text-muted-foreground"
                }`}
                onClick={() => setTxType("expense")}
                data-ocid="transaction.toggle"
              >
                Expense
              </button>
            </div>

            {/* Amount */}
            <div className="mb-5">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 text-3xl font-bold h-16 rounded-2xl bg-muted border-0 focus-visible:ring-primary"
                  data-ocid="transaction.input"
                />
              </div>
            </div>

            {/* Category Grid */}
            <div className="mb-5">
              <Label className="text-xs text-muted-foreground mb-3 block">
                Category
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const selected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${
                        selected ? "" : "bg-muted hover:bg-accent"
                      }`}
                      style={{
                        backgroundColor: selected ? cat.bgColor : undefined,
                        outline: selected ? `2px solid ${cat.color}` : "none",
                      }}
                      data-ocid="transaction.toggle"
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: selected ? cat.color : undefined }}
                      />
                      <span
                        className={`text-[10px] font-medium ${
                          selected ? "" : "text-muted-foreground"
                        }`}
                        style={{ color: selected ? cat.color : undefined }}
                      >
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div className="mb-5">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Note (optional)
              </Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="rounded-2xl bg-muted border-0 h-11 focus-visible:ring-primary"
                data-ocid="transaction.textarea"
              />
            </div>

            {/* Date */}
            <div className="mb-6">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Date
              </Label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted px-4 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
                data-ocid="transaction.input"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="w-full rounded-2xl text-base font-bold h-12"
              data-ocid="transaction.submit_button"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  {isEditing ? "Update" : "Save"}
                </>
              )}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
