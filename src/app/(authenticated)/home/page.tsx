export const instant = false;

import { MovieCarousel } from "@/components/home/movie-carousel";
import { MovieCard } from "@/components/movies/movie-card";
import { requireSession, type UserRole } from "@/lib/permissions";
import {
  getCatalogMovies,
  getCategoriesWithPublishedMovies,
} from "@/lib/queries/queries";

export default async function HomePage() {
  const session = await requireSession();
  const [categories, movies] = await Promise.all([
    getCategoriesWithPublishedMovies(),
    getCatalogMovies(),
  ]);

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
      <p className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
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
              />
            </div>
          ))}
        </MovieCarousel>
      ))}
    </div>
  );
}
