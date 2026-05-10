import * as z from "zod";

export const createTransactionSchema = z.object({
  amount: z
    .number({ message: "El monto debe ser un número" })
    .positive("El monto debe ser mayor a 0"),
  type: z.enum(["income", "expense"], {
    message: "Selecciona ingreso o egreso",
  }),
  description: z
    .string()
    .min(1, "La descripción no puede estar vacía")
    .max(120, "Máximo 120 caracteres"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(["income", "expense"]).optional(),
  description: z.string().min(1).max(120).optional(),
  categoryId: z.string().min(1).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
