
import { TagIcon } from "@phosphor-icons/react/ssr";
import { CategoryDialog } from "@/components/admin/category-dialog";

export default function AdminCategoriesPage() {
  return (
    <section className="space-y-6">
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
      
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <TagIcon size={28} className="text-muted-foreground" />
        </div>

        <h2 className="text-lg font-medium">
          Nenhuma categoria carregada
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Quando conectarmos a página ao banco de dados,
          as categorias cadastradas serão exibidas aqui.
        </p>
      </div>
    </section>
  );
}
