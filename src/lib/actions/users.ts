
"use server";

import {  eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/permissions";
import { updateUserRoleSchema } from "@/schemas/users";

type UpdateUserRoleResult = {
  success: boolean;
  message: string;
};

export async function updateUserRole(
  userId: string,
  role: string,
): Promise<UpdateUserRoleResult> {
  // 1. Somente administradores podem executar esta operação.
  const session = await requireAdmin();

  // 2. Valida os dados recebidos pela Action.
  const validation = updateUserRoleSchema.safeParse({
    userId,
    role,
  });

  if (!validation.success) {
    return {
      success: false,
      message: "Dados inválidos para alterar o papel do usuário.",
    };
  }

  const targetUserId = validation.data.userId;
  const newRole = validation.data.role;

  // 3. Impede que o administrador altere o próprio papel.
  if (targetUserId === session.user.id) {
    return {
      success: false,
      message: "Você não pode alterar o próprio papel.",
    };
  }

  try {
    // 4. Executa a validação e a atualização em uma transação.
    const result = await db.transaction(async (tx) => {
      // Bloqueia as linhas dos administradores durante a operação,
      // evitando que duas alterações simultâneas removam o último ADMIN.
      const admins = await tx
        .select({ id: user.id })
        .from(user)
        .where(eq(user.role, "ADMIN"))
        .for("update");

      const [targetUser] = await tx
        .select({
          id: user.id,
          role: user.role,
        })
        .from(user)
        .where(eq(user.id, targetUserId))
        .limit(1);

      if (!targetUser) {
        return {
          success: false,
          message: "Usuário não encontrado.",
        };
      }

      // 5. Impede a remoção do último administrador.
      if (
        targetUser.role === "ADMIN" &&
        newRole !== "ADMIN" &&
        admins.length <= 1
      ) {
        return {
          success: false,
          message: "Não é possível remover o último administrador.",
        };
      }

      // 6. Atualiza o papel somente se ele realmente mudou.
      if (targetUser.role !== newRole) {
        await tx
          .update(user)
          .set({
            role: newRole,
            updatedAt: new Date(),
          })
          .where(eq(user.id, targetUserId));
      }

      return {
        success: true,
        message:
          targetUser.role === newRole
            ? "O usuário já possui esse papel."
            : "Papel do usuário atualizado com sucesso.",
      };
    });

    if (result.success) {
      revalidatePath("/admin/users");
    }

    return result;
  } catch (error) {
    console.error("Erro ao atualizar papel do usuário:", error);

    return {
      success: false,
      message: "Não foi possível atualizar o papel do usuário.",
    };
  }
}
