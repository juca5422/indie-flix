import { z } from "zod";

const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "O nome da categoria é obrigatório.")
  .max(100, "O nome deve ter no máximo 100 caracteres.");

const categoryIdSchema = z.string().uuid("Identificador de categoria inválido.");

export const createCategorySchema = z.object({
  name: categoryNameSchema,
});

export const deleteCategorySchema = z.object({
  id: categoryIdSchema,
});

export const updateCategorySchema = z.object({
  id: categoryIdSchema,
  name: categoryNameSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
