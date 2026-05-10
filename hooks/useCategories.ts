import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/category";

const STORAGE_KEY = "categories";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data: Category[] = raw ? JSON.parse(raw) : [];
      setCategories(data);
    } catch {
      setError("No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const persistir = async (next: Category[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCategories(next);
  };

  const crear = async (input: CreateCategoryInput): Promise<void> => {
    const nueva: Category = {
      id: Date.now().toString(),
      ...input,
    };
    await persistir([...categories, nueva]);
  };

  const editar = async (
    id: string,
    input: UpdateCategoryInput
  ): Promise<void> => {
    const next = categories.map((c) =>
      c.id === id ? { ...c, ...input } : c
    );
    await persistir(next);
  };

  const eliminar = async (id: string): Promise<void> => {
    await persistir(categories.filter((c) => c.id !== id));
  };

  return {
    categories,
    loading,
    error,
    crear,
    editar,
    eliminar,
    recargar: cargar,
  };
};
