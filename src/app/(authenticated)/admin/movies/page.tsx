import Link from "next/link";
import { MovieCard } from "@/components/movies/movie-card";
import type { MovieContext } from "@/lib/movies/movie-policy";
import { requireAdmin, type UserRole } from "@/lib/permissions";
import {
  getFavoriteMovieIds,
  getMoviesForModeration,
} from "@/lib/queries/queries";
import { cn } from "@/lib/utils";

type AdminMoviesPageProps = {
  searchParams: Promise<{ aba?: string }>;
};

export default async function AdminMoviesPage({
  searchParams,
}: AdminMoviesPageProps) {
  const session = await requireAdmin();
  const { aba } = await searchParams;
  const isReview = aba === "revisao";

  const [movies, favoriteIdList] = await Promise.all([
    getMoviesForModeration(),
    getFavoriteMovieIds(session.user.id),
  ]);
  const favoriteIds = new Set(favoriteIdList);
  const pendingMovies = movies.filter(
    (movie) => movie.status === "PENDING_REVIEW",
  );
  const catalogMovies = movies.filter(
    (movie) => movie.status !== "PENDING_REVIEW",
  );

  const visibleMovies = isReview ? pendingMovies : catalogMovies;
  const context: MovieContext = isReview ? "ADMIN_REVIEW" : "ADMIN_MOVIES";

  const tabs = [
    { label: "Todos", href: "/admin/movies", active: !isReview, count: null },
    {
      label: "Revisão",
      href: "/admin/movies?aba=revisao",
      active: isReview,
      count: pendingMovies.length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Filmes</h1>
        <p className="mt-2 text-sm text-muted">
          {isReview
            ? "Filmes corrigidos que estão aguardando análise."
            : "Publicados e banidos. Os pendentes ficam na aba Revisão."}
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Listas de filmes"
      >
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={tab.active}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab.active
                ? "bg-primary text-bg"
                : "bg-elevated text-muted hover:text-text",
            )}
          >
            {tab.label}
            {tab.count !== null && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  tab.active ? "bg-bg/15" : "bg-bg",
                )}
              >
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {visibleMovies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleMovies.map((movie) => (
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
              showStatus
              role={session.user.role as UserRole}
              context={context}
              isOwner={movie.creatorId === session.user.id}
              initialFavorited={favoriteIds.has(movie.id)}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-border p-8 text-center text-sm text-muted">
          {isReview
            ? "Nenhum filme aguardando revisão."
            : "Nenhum filme publicado ou banido."}
        </p>
      )}
    </div>
  );
}
