export const instant = false;

import { notFound } from "next/navigation";
import { MovieCard } from "@/components/movies/movie-card";
import { toCategorySlug } from "@/lib/categories/slug";
import { requireSession, type UserRole } from "@/lib/permissions";
import {
  getCatalogMovies,
  getCategoriesWithPublishedMovies,
  getFavoriteMovieIds,
} from "@/lib/queries/queries";

type CategoryPageProps = {
  params: Promise<{ classificacao: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { classificacao } = await params;
  const session = await requireSession();

  const [categories, catalogMovies, favoriteIdList] = await Promise.all([
    getCategoriesWithPublishedMovies(),
    getCatalogMovies(),
    getFavoriteMovieIds(session.user.id),
  ]);
  const favoriteIds = new Set(favoriteIdList);

  const category = categories.find(
    (item) => toCategorySlug(item.name) === classificacao,
  );

  if (!category) {
    notFound();
  }

  const movies = catalogMovies.filter((movie) =>
    (movie.categoryIds ?? []).includes(category.id),
  );

  if (movies.length === 0) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{category.name}</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {movies.map((movie) => (
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
              movie.averageRating === null ? null : Number(movie.averageRating)
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
    </section>
  );
}
