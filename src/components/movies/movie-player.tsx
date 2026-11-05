"use client";

import { ArrowLeftIcon, HeartIcon, StarIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  type MovieRatingValue,
  RateMovieDialog,
} from "@/components/movies/rating-movie-dialog";
import { toggleFavorite } from "@/lib/actions/favorites";
import { saveWatchProgress } from "@/lib/actions/watch-progress";

const SAVE_INTERVAL_MS = 15 * 1000; // 15 segundos

type MoviePlayerProps = {
  movieId: string;
  title: string;
  src: string;
  initialRating: MovieRatingValue | null;
  initialProgressSeconds: number;
  initialFavorited: boolean;
};

function saveProgress(movieId: string, video: HTMLVideoElement) {
  void saveWatchProgress({
    movieId,
    progressSeconds: Math.floor(video.currentTime),
  });
}
export function MoviePlayer({
  movieId,
  initialFavorited,
  title,
  src,
  initialRating,
  initialProgressSeconds,
}: MoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  const [rating, setRating] = useState(initialRating);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [favorited, setFavorited] = useState(initialFavorited);
  async function handleToggleFavorite() {
    const next = !favorited;
    setFavorited(next);
    const result = await toggleFavorite({ movieId });
    if (!result.success) {
      setFavorited(!next);
    }
  }

  function play() {
    void videoRef.current?.play();
  }

  useEffect(() => {
    const video = videoRef.current;

    return () => {
      if (!video) return;

      saveProgress(movieId, video);
      video.pause();
    };
  }, [movieId]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      return;
    }
    video.pause();
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const interval = setInterval(() => {
      if (!video.paused) {
        saveProgress(movieId, video);
      }
    }, SAVE_INTERVAL_MS);
    return () => {
      clearInterval(interval);
    };
  }, [movieId]);

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
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          if (
            initialProgressSeconds > 0 &&
            initialProgressSeconds < video.duration
          ) {
            video.currentTime = initialProgressSeconds;
          }
        }}
        onPlay={() => setPaused(false)}
        onPause={(event) => {
          setPaused(true);
          saveProgress(movieId, event.currentTarget);
        }}
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
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-14 z-10">
          <p className="absolute top-4 right-16 left-16 text-center">
            <span className="inline-block max-w-full truncate rounded-lg bg-black/60 px-4 py-2 text-2xl font-semibold text-white">
              {title}
            </span>
          </p>
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
            className="flex size-14 items-center justify-center rounded-full border border-white/30 bg-black/60 text-star"
          >
            <StarIcon size={32} weight={rating ? "fill" : "regular"} />
          </button>
          <button
            type="button"
            aria-label={
              favorited
                ? `Remover ${title} dos favoritos`
                : `Favoritar ${title}`
            }
            aria-pressed={favorited}
            title={favorited ? "Remover dos favoritos" : "Favoritar"}
            onClick={(event) => {
              event.stopPropagation();
              void handleToggleFavorite();
            }}
            className="flex size-14 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white"
          >
            <HeartIcon size={32} weight={favorited ? "fill" : "regular"} />
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
