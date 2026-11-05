export const instant = false;

import Link from "next/link";
import { notFound } from "next/navigation";
import { MovieComment } from "@/components/movies/movie-comment";
import { MoviePlayer } from "@/components/movies/movie-player";
import { canWatchMovie } from "@/lib/movies/movie-policy";
import { requireSession, type UserRole } from "@/lib/permissions";
import {
  getMovieComments,
  getMovieForPlayback,
  getMovieRatingSummary,
  getUserMovieRating,
  getUserWatchProgress,
} from "@/lib/queries/queries";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: MoviePageProps) {
  const session = await requireSession();
  const { id } = await params;
  const movie = await getMovieForPlayback(id);

  if (!movie) {
    notFound();
  }
  const role = session.user.role;
  const canWatch =
    typeof role === "string" &&
    canWatchMovie({
      role: role as UserRole,
      status: movie.status,
      isOwner: movie.creatorId === session.user.id,
    });
  if (!canWatch) {
    notFound();
  }
  const comments = await getMovieComments(movie.id);
  const rating = await getUserMovieRating(session.user.id, movie.id);
  const watchProgress = await getUserWatchProgress(session.user.id, movie.id);
  const summary = await getMovieRatingSummary(movie.id);
  const averageRating =
    summary.averageRating === null ? null : Number(summary.averageRating);

  return (
    <article className="space-y-4">
      <MoviePlayer
        title={movie.title}
        src={`/api/media/${movie.videoUrl}`}
        movieId={movie.id}
        initialRating={rating}
        initialProgressSeconds={watchProgress}
      />

      <h1 className="flex flex-wrap items-center gap-3 text-2xl font-semibold tracking-tight">
        <span className="inline-flex items-center gap-1 text-base text-star">
          <span aria-hidden="true">★</span>
          <span className="text-text">
            {averageRating !== null ? averageRating.toFixed(1) : "—"}
          </span>
          <span className="font-normal text-muted">
            ({summary.ratingsCount})
          </span>
        </span>
        <span>{movie.title}</span>
      </h1>
      <p className="max-w-3xl text-sm leading-relaxed text-muted">
        {movie.synopsis}
      </p>
      <section className="max-w-3xl space-y-4">
        <h2 className="text-lg font-semibold">Comentários</h2>
        {comments.length > 0 ? (
          <ul className="space-y-6">
            {comments.map((item) => (
              <li key={item.id}>
                <MovieComment
                  authorName={item.authorName}
                  authorImage={item.authorImage}
                  comment={item.comment}
                  score={item.score}
                  createdAt={item.createdAt}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nenhum comentário ainda.</p>
        )}
      </section>
    </article>
  );
}
