import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { ROLES, type UserRole } from "@/lib/roles";

export { ROLES, type UserRole } from "@/lib/roles";

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

  if (typeof role !== "string" || !allowedRoles.includes(role as UserRole)) {
    redirect("/forbidden");
  }

  return session;
}

export async function requireAdmin() {
  return requireRole([ROLES.ADMIN]);
}
