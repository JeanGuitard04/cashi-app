import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

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

  // Sincroniza el form con los defaultValues (o vacío) cada vez que la
  // pantalla recibe foco. Resuelve dos cosas:
  //   1. Native-stack a veces reusa la instancia del componente al
  //      re-pushear la misma ruta — sin este reset, el form arranca con
  //      lo último que tipeaste (modo create) o con otra categoría
  //      (modo edit).
  //   2. En modo edit, defaultValues llega async cuando AsyncStorage
  //      termina de cargar — al recibir foco sincronizamos.
  useFocusEffect(
    useCallback(() => {
      setName(defaultValues?.name ?? "");
      setErrores({});
    }, [defaultValues])
  );

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
