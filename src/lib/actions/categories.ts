"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { categories, movieCategories } from "@/db/schema/catalog";
import { requireAdmin } from "@/lib/permissions";
import { getCategories } from "@/lib/queries/queries";

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

// Adicione junto às outras funções do arquivo.
const deleteCategorySchema = z.object({
  id: z.string().uuid("Identificador de categoria inválido."),
});

type DeleteCategoryResult = {
  success: boolean;
  message: string;
};

export async function deleteCategory(
  id: string,
): Promise<DeleteCategoryResult> {
  await requireAdmin();

  const validation = deleteCategorySchema.safeParse({ id });

  if (!validation.success) {
    return {
      success: false,
      message: "Categoria inválida.",
    };
  }

  try {
    const [association] = await db
      .select({ categoryId: movieCategories.categoryId })
      .from(movieCategories)
      .where(eq(movieCategories.categoryId, validation.data.id))
      .limit(1);

    if (association) {
      return {
        success: false,
        message:
          "Esta categoria não pode ser excluída porque possui filmes associados.",
      };
    }

    const deleted = await db
      .delete(categories)
      .where(eq(categories.id, validation.data.id))
      .returning({ id: categories.id });

    if (deleted.length === 0) {
      return {
        success: false,
        message: "Categoria não encontrada.",
      };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Categoria excluída com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);

    return {
      success: false,
      message:
        "Não foi possível excluir a categoria. Verifique se ela está associada a algum filme.",
    };
  }
}

const updateCategorySchema = z.object({
  id: z.string().uuid("Identificador de categoria inválido."),
  name: z
    .string()
    .trim()
    .min(1, "O nome da categoria é obrigatório.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
});

type UpdateCategoryResult = {
  success: boolean;
  message: string;
};

export async function updateCategory(
  id: string,
  name: string,
): Promise<UpdateCategoryResult> {
  await requireAdmin();

  const validation = updateCategorySchema.safeParse({ id, name });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { id: categoryId, name: categoryName } = validation.data;

  try {
    const [existingCategory] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(eq(categories.name, categoryName), ne(categories.id, categoryId)),
      )
      .limit(1);

    if (existingCategory) {
      return {
        success: false,
        message: "Já existe uma categoria com esse nome.",
      };
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({ name: categoryName })
      .where(eq(categories.id, categoryId))
      .returning({ id: categories.id });

    if (!updatedCategory) {
      return {
        success: false,
        message: "Categoria não encontrada.",
      };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Categoria atualizada com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);

    return {
      success: false,
      message: "Não foi possível atualizar a categoria.",
    };
  }
}

export async function listCategories() {
  return getCategories();
}
