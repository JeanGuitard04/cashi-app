import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services/api";
import type { Category } from "@/types/category";

export const useCategories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!token) {
      setCategories([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<Category[]>("/categories", token);
      setCategories(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al cargar categorías"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    categories,
    loading,
    error,
    recargar: cargar,
  };
};
