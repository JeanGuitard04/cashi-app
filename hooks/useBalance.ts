import { useMemo } from "react";

import { useTransactions } from "@/hooks/useTransactions";

export const useBalance = () => {
  const { transactions, loading, error, recargar } = useTransactions();

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions]);

  return {
    totalIncome,
    totalExpense,
    balance,
    loading,
    error,
    recargar,
  };
};
