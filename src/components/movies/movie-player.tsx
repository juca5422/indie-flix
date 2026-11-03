"use client";

import { StarIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
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
