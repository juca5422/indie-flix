"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateUserRole } from "@/lib/actions/users";

const roles = [
  { value: "USER", label: "Usuário" },
  { value: "FILMMAKER", label: "Cineasta" },
  { value: "ADMIN", label: "Administrador" },
] as const;

type UserRole = (typeof roles)[number]["value"];

type UserRoleSelectProps = {
  userId: string;
  currentRole: string | null;
  isCurrentUser: boolean;
};

export function UserRoleSelect({
  userId,
  currentRole,
  isCurrentUser,
}: UserRoleSelectProps) {
  const [role, setRole] = useState<UserRole>(
    roles.some((item) => item.value === currentRole)
      ? (currentRole as UserRole)
      : "USER",
  );
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(newRole: UserRole) {
    const previousRole = role;

    setRole(newRole);

    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);

      if (!result.success) {
        setRole(previousRole);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  return (
    <select
      value={role}
      disabled={isCurrentUser || isPending}
      onChange={(event) =>
        handleRoleChange(event.target.value as UserRole)
      }
      aria-label="Papel do usuário"
      className="w-full min-w-36 rounded-md border border-border bg-field px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {roles.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}