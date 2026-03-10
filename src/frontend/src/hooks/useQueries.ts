import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "../backend.d";
import { useActor } from "./useActor";

export function useTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      const txs = await actor.listTransactions();
      return txs.sort((a, b) => Number(b.date - a.date));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFinancialSummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["financialSummary"],
    queryFn: async () => {
      if (!actor) return { totalIncome: 0n, totalExpenses: 0n, netBalance: 0n };
      return actor.getFinancialSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      amount: bigint;
      transactionType: string;
      category: string;
      note: string;
      date: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTransaction(
        params.amount,
        params.transactionType,
        params.category,
        params.note,
        params.date,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

export function useEditTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: number;
      amount: bigint;
      transactionType: string;
      category: string;
      note: string;
      date: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.editTransaction(
        params.id,
        params.amount,
        params.transactionType,
        params.category,
        params.note,
        params.date,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTransaction(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}
