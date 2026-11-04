"use client";

import { ArrowLeftIcon, StarIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  type MovieRatingValue,
  RateMovieDialog,
} from "@/components/movies/rating-movie-dialog";

type MoviePlayerProps = {
  movieId: string;
  title: string;
  src: string;
  initialRating: MovieRatingValue | null;
};
export function MoviePlayer({
  movieId,
  title,
  src,
  initialRating,
}: MoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  const [rating, setRating] = useState(initialRating);
  const [ratingOpen, setRatingOpen] = useState(false);

  function play() {
    void videoRef.current?.play();
  }

  useEffect(() => {
    const video = videoRef.current;

    return () => {
      if (!video) return;

      video.pause();
    };
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      return;
    }
    video.pause();
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
      <Link
        href="/home"
        aria-label="Voltar ao catálogo"
        className="absolute top-4 left-4 z-20 flex size-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        <ArrowLeftIcon size={22} weight="bold" />
      </Link>
      <video
        ref={videoRef}
        className="h-full w-full"
        src={src}
        controls
        playsInline
        preload="metadata"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      >
        <track kind="captions" />
      </video>

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={paused ? `Reproduzir ${title}` : `Pausar ${title}`}
        className="absolute inset-x-0 top-0 bottom-14 cursor-pointer"
      />
      {paused && (
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-14 z-10 flex flex-col items-center justify-center gap-4 bg-bg/75 px-6 text-center">
          <p className="text-2xl font-semibold text-white">{title}</p>
          <button
            type="button"
            aria-label={
              rating ? `Editar avaliação de ${title}` : `Avaliar ${title}`
            }
            title={rating ? "Editar avaliação" : "Avaliar filme"}
            onClick={(event) => {
              event.stopPropagation();
              setRatingOpen(true);
            }}
            className="pointer-events-auto flex size-14 items-center justify-center rounded-full border border-white/30 text-star"
          >
            <StarIcon size={32} weight={rating ? "fill" : "regular"} />
          </button>
        </div>
      )}
      <RateMovieDialog
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        movieId={movieId}
        movieTitle={title}
        rating={rating}
        onSaved={setRating}
      />
    </div>
  );
}
