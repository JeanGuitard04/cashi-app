import * as z from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío")
    .max(40, "Máximo 40 caracteres"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(40).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
