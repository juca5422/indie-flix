export const instant = false;

import {
  ArrowsDownUpIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from "@phosphor-icons/react";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { requireAdmin } from "@/lib/permissions";
import { getUsers } from "@/lib/queries/queries";

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await getUsers();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Gerenciamento de usuários
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Consulte os usuários cadastrados e gerencie seus níveis de acesso.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Função</th>
              <th className="px-4 py-3 font-medium">Cadastro</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30">
                <td className="whitespace-nowrap px-4 py-3">{user.name}</td>

                <td className="px-4 py-3">{user.email}</td>

                <td className="whitespace-nowrap px-4 py-3">
                  <UserRoleSelect
                    userId={user.id}
                    currentRole={user.role}
                    isCurrentUser={user.id === session.user.id}
                  />
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        {users.length} usuário(s) cadastrado(s).
      </p>
    </section>
  );
}
