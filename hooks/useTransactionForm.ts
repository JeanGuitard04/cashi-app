import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import {
  createTransactionSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/schemas/transaction.schema";
import type { TransactionType } from "@/types/transaction";

type Mode = "create" | "edit";

export interface TransactionFormDefaults {
  amount: string;
  type: TransactionType;
  description: string;
  categoryId: string;
}

interface Props {
  mode: Mode;
  defaultValues?: TransactionFormDefaults;
  onSubmit: (
    data: CreateTransactionInput | UpdateTransactionInput
  ) => Promise<void>;
}

export const useTransactionForm = ({
  mode,
  defaultValues,
  onSubmit,
}: Props) => {
  const [amount, setAmount] = useState(defaultValues?.amount ?? "");
  const [type, setType] = useState<TransactionType>(
    defaultValues?.type ?? "expense"
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [categoryId, setCategoryId] = useState(
    defaultValues?.categoryId ?? ""
  );
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Sincroniza el form con los defaultValues (o vacíos) cada vez que la
  // pantalla recibe foco. Mismo motivo que en useCategoryForm:
  // native-stack puede reusar la instancia del componente al re-pushear,
  // dejando state stale. Reseteamos también `errores` para que no
  // queden mensajes rojos viejos.
  useFocusEffect(
    useCallback(() => {
      setAmount(defaultValues?.amount ?? "");
      setType(defaultValues?.type ?? "expense");
      setDescription(defaultValues?.description ?? "");
      setCategoryId(defaultValues?.categoryId ?? "");
      setErrores({});
    }, [defaultValues])
  );

  const handleSubmit = async () => {
    const schema =
      mode === "create" ? createTransactionSchema : updateTransactionSchema;

    const parsedAmount = parseFloat(amount.replace(",", "."));

    const result = schema.safeParse({
      amount: Number.isNaN(parsedAmount) ? undefined : parsedAmount,
      type,
      description,
      categoryId,
    });

    if (!result.success) {
      const flat = result.error.flatten();
      setErrores({
        amount: flat.fieldErrors.amount?.[0] ?? "",
        type: flat.fieldErrors.type?.[0] ?? "",
        description: flat.fieldErrors.description?.[0] ?? "",
        categoryId: flat.fieldErrors.categoryId?.[0] ?? "",
      });
      return;
    }

    setErrores({});
    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    amount,
    setAmount,
    type,
    setType,
    description,
    setDescription,
    categoryId,
    setCategoryId,
    errores,
    submitting,
    handleSubmit,
  };
};
