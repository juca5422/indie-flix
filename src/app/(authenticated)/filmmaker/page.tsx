import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { movies } from "@/db/schema/catalog";
import { ROLES, requireRole } from "@/lib/permissions";

export default async function FilmmakerPage() {
  const session = await requireRole([ROLES.FILMMAKER, ROLES.ADMIN]);

  const myMovies = await db
    .select()
    .from(movies)
    .where(
      // A condição de propriedade será adicionada abaixo.
      // Não consulte filmes sem filtrar pelo criador.
    )
    .orderBy(desc(movies.createdAt));

  return (
    <main className="space-y-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meus vídeos</h1>
          <p className="text-muted-foreground">
            Gerencie seus filmes e acompanhe a análise.
          </p>
        </div>
      </header>

      <p>{myMovies.length} filme(s) cadastrado(s).</p>
    </main>
  );
}
