
import { TagIcon } from "@phosphor-icons/react/ssr";

import { CategoryDialog } from "@/components/admin/category-dialog";
import { getCategories } from "@/lib/queries/queries";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <section className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Gerenciamento de categorias
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre e gerencie as categorias utilizadas para classificar
            os filmes do IndieFlix.
          </p>
        </div>

        <CategoryDialog />
      </div>

      {/* Lista de categorias */}
      {categories.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 text-right font-medium">
                  Identificador
                </th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium">
                    {category.name}
                  </td>

                  <td className="px-5 py-4 text-right font-mono text-xs text-muted-foreground">
                    {category.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <TagIcon
              size={28}
              className="text-muted-foreground"
            />
          </div>

          <h2 className="text-lg font-medium">
            Nenhuma categoria cadastrada
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Cadastre uma categoria para começar a organizar os filmes
            do IndieFlix.
          </p>
        </div>
      )}
    </section>
  );
}
