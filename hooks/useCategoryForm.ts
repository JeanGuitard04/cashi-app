import { useEffect, useState } from "react";

import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/schemas/category.schema";

type Mode = "create" | "edit";

interface Props {
  mode: Mode;
  defaultValues?: { name: string };
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
}

export const useCategoryForm = ({ mode, defaultValues, onSubmit }: Props) => {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.name);
    }
  }, [defaultValues]);

  const handleSubmit = async () => {
    const schema =
      mode === "create" ? createCategorySchema : updateCategorySchema;

    const result = schema.safeParse({ name });

    if (!result.success) {
      const flat = result.error.flatten();
      setErrores({
        name: flat.fieldErrors.name?.[0] ?? "",
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
    name,
    setName,
    errores,
    submitting,
    handleSubmit,
  };
};
