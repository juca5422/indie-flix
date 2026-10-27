
import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export const ROLES = {
  USER: "USER",
  FILMMAKER: "FILMMAKER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireSession();

  const role = session.user.role;

  if (
    typeof role !== "string" ||
    !allowedRoles.includes(role as UserRole)
  ) {
    redirect("/forbidden");
  }

  return session;
}

export async function requireAdmin() {
  return requireRole([ROLES.ADMIN]);
}
