
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { categories } from "@/db/schema/catalog";
import { requireAdmin } from "@/lib/permissions";

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome da categoria é obrigatório.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
});

type CreateCategoryResult = {
  success: boolean;
  message: string;
};

export async function createCategory(
  name: string,
): Promise<CreateCategoryResult> {
  // 1. Somente administradores podem executar esta operação.
  await requireAdmin();

  // 2. Valida os dados recebidos pela Action.
  const validation = createCategorySchema.safeParse({ name });

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ??
        "Nome inválido para a categoria.",
    };
  }

  const categoryName = validation.data.name;

  try {
    // 3. Verifica se já existe uma categoria com esse nome.
    const [existingCategory] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, categoryName))
      .limit(1);

    if (existingCategory) {
      return {
        success: false,
        message: "Já existe uma categoria com esse nome.",
      };
    }

    // 4. Cria a categoria.
    await db.insert(categories).values({
      name: categoryName,
    });

    // 5. Atualiza a página de gerenciamento.
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Categoria cadastrada com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao cadastrar categoria:", error);

    return {
      success: false,
      message: "Não foi possível cadastrar a categoria.",
    };
  }
}
