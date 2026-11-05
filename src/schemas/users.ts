import { z } from "zod";

import { userRoleSchema } from "@/lib/roles";

export const updateUserRoleSchema = z.object({
  userId: z.string().trim().min(1, "Usuário inválido."),
  role: userRoleSchema,
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
