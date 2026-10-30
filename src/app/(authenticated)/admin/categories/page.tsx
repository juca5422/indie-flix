import { TagIcon } from "@phosphor-icons/react/ssr";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { CategoryEditDialog } from "@/components/admin/category-edit-dialog";
import { getCategories } from "@/lib/queries/queries";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Gerenciamento de categorias
          </h1>

          <p className="mt-2 text-sm text-muted">
            Cadastre e gerencie as categorias utilizadas para classificar os
            filmes do IndieFlix.
          </p>
        </div>

        <CategoryDialog />
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-5 py-4 font-medium">{category.name}</td>

                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <CategoryEditDialog id={category.id} name={category.name} />
                    <CategoryDeleteButton
                      id={category.id}
                      name={category.name}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
