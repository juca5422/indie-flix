import { z } from "zod";

export const ROLES = {
  USER: "USER",
  FILMMAKER: "FILMMAKER",
  ADMIN: "ADMIN",
} as const;

export const userRoleSchema = z.enum(ROLES);

export type UserRole = z.infer<typeof userRoleSchema>;
