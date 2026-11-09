export const instant = false;

import { MovieCard } from "@/components/movies/movie-card";
import { requireSession, type UserRole } from "@/lib/permissions";
import { getCatalogMovies, getFavoriteMovieIds } from "@/lib/queries/queries";

export default async function FavoritesPage() {
  const session = await requireSession();
  const [favoriteIdList, movies] = await Promise.all([
    getFavoriteMovieIds(session.user.id),
    getCatalogMovies(),
  ]);
  const moviesById = new Map(movies.map((movie) => [movie.id, movie]));
  const favoriteMovies = favoriteIdList.flatMap((id) => {
    const movie = moviesById.get(id);
    return movie ? [movie] : [];
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Meus favoritos</h1>
      {favoriteMovies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favoriteMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              synopsis={movie.synopsis}
              thumbnailUrl={movie.thumbnailUrl}
              category={movie.category}
              categoryIds={movie.categoryIds ?? []}
              creatorName={movie.creatorName}
              averageRating={
                movie.averageRating === null
                  ? null
                  : Number(movie.averageRating)
              }
              ratingsCount={movie.ratingsCount}
              status={movie.status}
              banReason={movie.banReason}
              role={session.user.role as UserRole}
              context="HOME"
              isOwner={movie.creatorId === session.user.id}
              initialFavorited={true}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-border p-8 text-center text-sm text-muted">
          Você ainda não favoritou nenhum filme.
        </p>
      )}
    </section>
  );
}
