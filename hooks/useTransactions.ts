import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL, apiService } from "@/services/api";
import type {
  CreateTransactionInput,
  Transaction,
  TransactionType,
  UpdateTransactionInput,
} from "@/types/transaction";

interface ServerTransaction {
  id: number;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  categoryId: number;
  receiptUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface UploadResponse {
  url: string;
}

const absoluteUrl = (relativeOrAbsolute: string): string =>
  relativeOrAbsolute.startsWith("http")
    ? relativeOrAbsolute
    : `${API_BASE_URL}${relativeOrAbsolute}`;

const toClient = (t: ServerTransaction): Transaction => ({
  id: t.id,
  amount: t.amount,
  type: t.type,
  description: t.description,
  date: t.date,
  categoryId: t.categoryId,
  photoUri: t.receiptUrl ? absoluteUrl(t.receiptUrl) : undefined,
  location:
    t.latitude !== null && t.longitude !== null
      ? { latitude: t.latitude, longitude: t.longitude }
      : undefined,
});

const toServer = (
  input: CreateTransactionInput | UpdateTransactionInput,
  includeDate: boolean
): object => {
  const body: Record<string, unknown> = {};
  if (input.amount !== undefined) body.amount = input.amount;
  if (input.type !== undefined) body.type = input.type;
  if (input.description !== undefined) body.description = input.description;
  if (input.categoryId !== undefined) body.categoryId = input.categoryId;
  if (input.photoUri !== undefined) body.receiptUrl = input.photoUri;
  if (input.location !== undefined) {
    body.latitude = input.location.latitude;
    body.longitude = input.location.longitude;
  }
  if (includeDate) body.date = new Date().toISOString();
  return body;
};

const uploadPhoto = async (
  photoUri: string,
  token: string
): Promise<string> => {
  const formData = new FormData();
  formData.append("receipt", {
    uri: photoUri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as unknown as Blob);

  const res = await apiService.post<UploadResponse>(
    "/transactions/upload",
    formData,
    token
  );
  return absoluteUrl(res.url);
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
      const data = await apiService.get<ServerTransaction[]>(
        "/transactions",
        token
      );
      setTransactions(data.map(toClient));
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
    const body = toServer({ ...input, photoUri }, true);
    const created = await apiService.post<ServerTransaction>(
      "/transactions",
      body,
      token
    );
    setTransactions((prev) => [...prev, toClient(created)]);
  };

  const editar = async (
    id: number,
    input: UpdateTransactionInput
  ): Promise<void> => {
    if (!token) throw new Error("Sin sesión activa");
    const photoUri = await resolvePhoto(input.photoUri, token);
    const body = toServer({ ...input, photoUri }, false);
    const updated = await apiService.patch<ServerTransaction>(
      `/transactions/${id}`,
      body,
      token
    );
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? toClient(updated) : t))
    );
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
