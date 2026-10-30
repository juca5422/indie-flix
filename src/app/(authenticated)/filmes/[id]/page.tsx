export const instant = false;

import Link from "next/link";
import { notFound } from "next/navigation";
import { MoviePlayer } from "@/components/movies/movie-player";
import { requireSession } from "@/lib/permissions";
import { getMovieById } from "@/lib/queries/queries";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: MoviePageProps) {
  await requireSession();
  const { id } = await params;
  const movie = await getMovieById(id);

  if (!movie) {
    notFound();
  }

  return (
    <article className="space-y-4">
      <Link href="/home" className="text-sm text-muted hover:text-text">
        Voltar ao catálogo
      </Link>

      <MoviePlayer title={movie.title} src={`/api/media/${movie.videoUrl}`} />

      <h1 className="text-2xl font-semibold tracking-tight">{movie.title}</h1>
      <p className="max-w-3xl text-sm leading-relaxed text-muted">
        {movie.synopsis}
      </p>
    </article>
  );
}
