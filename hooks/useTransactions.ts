import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from "@/types/transaction";

const STORAGE_KEY = "transactions";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data: Transaction[] = raw ? JSON.parse(raw) : [];
      setTransactions(data);
    } catch {
      setError("No se pudieron cargar las transacciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const persistir = async (next: Transaction[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setTransactions(next);
  };

  const crear = async (input: CreateTransactionInput): Promise<void> => {
    const nueva: Transaction = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...input,
    };
    await persistir([...transactions, nueva]);
  };

  const editar = async (
    id: number,
    input: UpdateTransactionInput
  ): Promise<void> => {
    const next = transactions.map((t) =>
      t.id === id ? { ...t, ...input } : t
    );
    await persistir(next);
  };

  const eliminar = async (id: number): Promise<void> => {
    await persistir(transactions.filter((t) => t.id !== id));
  };

  return {
    transactions,
    loading,
    error,
    crear,
    editar,
    eliminar,
    recargar: cargar,
  };
};
