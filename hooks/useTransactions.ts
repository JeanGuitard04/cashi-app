import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services/api";
import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from "@/types/transaction";

interface UploadResponse {
  imageUrl: string;
}

const uploadPhoto = async (
  photoUri: string,
  token: string
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", {
    uri: photoUri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as unknown as Blob);

  const res = await apiService.post<UploadResponse>(
    "/transactions/upload",
    formData,
    token
  );
  return res.imageUrl;
};

const resolvePhoto = async (
  photoUri: string | undefined,
  token: string
): Promise<string | undefined> => {
  if (!photoUri) return undefined;
  if (photoUri.startsWith("http")) return photoUri;
  return uploadPhoto(photoUri, token);
};

export const useTransactions = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!token) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<Transaction[]>(
        "/transactions",
        token
      );
      setTransactions(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al cargar transacciones"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (input: CreateTransactionInput): Promise<void> => {
    if (!token) throw new Error("Sin sesión activa");
    const photoUri = await resolvePhoto(input.photoUri, token);
    const body = { ...input, photoUri };
    const created = await apiService.post<Transaction>(
      "/transactions",
      body,
      token
    );
    setTransactions((prev) => [...prev, created]);
  };

  const editar = async (
    id: number,
    input: UpdateTransactionInput
  ): Promise<void> => {
    if (!token) throw new Error("Sin sesión activa");
    const photoUri = await resolvePhoto(input.photoUri, token);
    const body = { ...input, photoUri };
    const updated = await apiService.patch<Transaction>(
      `/transactions/${id}`,
      body,
      token
    );
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const eliminar = async (id: number): Promise<void> => {
    if (!token) throw new Error("Sin sesión activa");
    await apiService.delete(`/transactions/${id}`, token);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
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
