import { AddMovieDialog } from "@/components/filmmaker/add-movie-dialog";
import { MovieCard } from "@/components/movies/movie-card";
import { ROLES, requireRole } from "@/lib/permissions";
import { getMoviesByCreator } from "@/lib/queries/queries";

export default async function FilmmakerPage() {
  const session = await requireRole([ROLES.FILMMAKER, ROLES.ADMIN]);

  const myMovies = await getMoviesByCreator(session.user.id);
  console.log(myMovies);

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus vídeos</h1>
          <p className="text-muted-foreground">
            Gerencie seus filmes e acompanhe a análise.
          </p>
        </div>

        <AddMovieDialog />
      </header>

      <p className="text-sm text-muted-foreground">
        {myMovies.length}{" "}
        {myMovies.length === 1 ? "filme cadastrado" : "filmes cadastrados"}
      </p>

      {myMovies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {myMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              synopsis={movie.synopsis}
              thumbnailUrl={movie.thumbnailUrl}
              category={movie.category}
              creatorName={session.user.name}
              averageRating={
                movie.averageRating === null
                  ? null
                  : Number(movie.averageRating)
              }
              ratingsCount={movie.ratingsCount}
              status={movie.status}
              banReason={movie.banReason}
              showStatus
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold">
            Você ainda não cadastrou filmes
          </h2>
          <p className="mt-2 text-sm text-muted">
            Adicione seu primeiro vídeo para começar seu catálogo.
          </p>
        </div>
      )}
    </main>
  );
}
