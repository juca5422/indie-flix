export const instant = false;

import { MovieCarousel } from "@/components/home/movie-carousel";
import { MovieCard } from "@/components/movies/movie-card";
import { requireSession, type UserRole } from "@/lib/permissions";
import {
  getCatalogMovies,
  getCategoriesWithPublishedMovies,
  getFavoriteMovieIds,
} from "@/lib/queries/queries";

type HomePageProps = {
  searchParams: Promise<{ q?: string }>;
};
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await requireSession();
  const { q } = await searchParams;
  const term = q?.trim() ?? "";
  const favoriteIds = new Set(await getFavoriteMovieIds(session.user.id));
  const [categories, movies] = await Promise.all([
    getCategoriesWithPublishedMovies(),
    getCatalogMovies(),
  ]);
  if (term) {
    const results = movies.filter((movie) =>
      normalize(movie.title).includes(normalize(term)),
    );
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Resultados para “{term}”
        </h1>
        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((movie) => (
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
                initialFavorited={favoriteIds.has(movie.id)}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-border p-8 text-center text-sm text-muted">
            Nenhum filme publicado com esse título.
          </p>
        )}
      </section>
    );
  }

  const sections = categories
    .map((category) => ({
      ...category,
      movies: movies.filter((movie) =>
        (movie.categoryIds ?? []).includes(category.id),
      ),
    }))
    .filter((section) => section.movies.length > 0);

  if (sections.length === 0) {
    return (
      <p className="rounded-xl border border-border p-8 text-center text-sm text-muted">
        Nenhum filme publicado no catálogo.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <MovieCarousel key={section.id} title={section.name}>
          {section.movies.map((movie) => (
            <div key={movie.id} className="w-72 shrink-0">
              <MovieCard
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
                initialFavorited={favoriteIds.has(movie.id)}
              />
            </div>
          ))}
        </MovieCarousel>
      ))}
    </div>
  );
}
