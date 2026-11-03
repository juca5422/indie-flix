"use client";

import { StarIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { saveRating } from "@/lib/actions/rating";

export type MovieRatingValue = {
  score: number;
  comment: string | null;
};

type RateMovieDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId: string;
  movieTitle: string;
  rating: MovieRatingValue | null;
  onSaved: (rating: MovieRatingValue) => void;
};

const STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

function formatScore(score: number) {
  return score.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function RatingStars({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}) {
  function changeByKey(key: string) {
    const index = STEPS.indexOf(value as (typeof STEPS)[number]);

    if (key === "Home") return 0.5;
    if (key === "End") return 5;
    if (key === "ArrowRight" || key === "ArrowUp") {
      return index === -1 ? 0.5 : STEPS[Math.min(STEPS.length - 1, index + 1)];
    }
    if (key === "ArrowLeft" || key === "ArrowDown") {
      return index <= 0 ? 0.5 : STEPS[index - 1];
    }

    return null;
  }

  return (
    <div
      role="slider"
      aria-label="Nota do filme"
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={value > 0 ? value : undefined}
      aria-valuetext={
        value > 0 ? `${formatScore(value)} de 5` : "Nenhuma nota selecionada"
      }
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event) => {
        const next = changeByKey(event.key);
        if (next === null || disabled) return;
        event.preventDefault();
        onChange(next);
      }}
      className="flex w-fit items-center gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = value >= star ? 1 : value >= star - 0.5 ? 0.5 : 0;

        return (
          <div key={star} className="relative size-9 text-star">
            <StarIcon size={36} weight="regular" />
            <span
              className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
              style={{
                width: fill === 1 ? "100%" : fill === 0.5 ? "50%" : "0%",
              }}
            >
              <StarIcon size={36} weight="fill" />
            </span>
            <button
              type="button"
              disabled={disabled}
              aria-label={`${formatScore(star - 0.5)} de 5`}
              onClick={() => onChange(star - 0.5)}
              className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
            />
            <button
              type="button"
              disabled={disabled}
              aria-label={`${formatScore(star)} de 5`}
              onClick={() => onChange(star)}
              className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
            />
          </div>
        );
      })}
    </div>
  );
}

export function RateMovieDialog({
  open,
  onOpenChange,
  movieId,
  movieTitle,
  rating,
  onSaved,
}: RateMovieDialogProps) {
  const [score, setScore] = useState(rating?.score ?? 0);
  const [comment, setComment] = useState(rating?.comment ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setScore(rating?.score ?? 0);
    setComment(rating?.comment ?? "");
    setErrorMessage("");
  }, [open, rating]);

  async function handleSubmit() {
    if (score < 0.5 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const result = await saveRating({
        movieId,
        score,
        comment,
      });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      onSaved({
        score,
        comment: comment.trim() ? comment.trim() : null,
      });
      onOpenChange(false);
    } catch {
      setErrorMessage("Ocorreu um erro ao salvar a avaliação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasRating = rating !== null;

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? () => {} : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasRating ? "Editar avaliação" : "Avaliar filme"}
          </DialogTitle>
          <DialogDescription>
            {movieTitle}. A nota vai de 0,5 a 5. O comentário é opcional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <RatingStars
              value={score}
              onChange={setScore}
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted">
              {score > 0 ? formatScore(score) : "Escolha uma nota"}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="movie-rating-comment">Comentário</label>
            <Textarea
              id="movie-rating-comment"
              value={comment}
              maxLength={1000}
              disabled={isSubmitting}
              placeholder="O que você achou do filme?"
              onChange={(event) => setComment(event.target.value)}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-danger">
              {errorMessage}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={score < 0.5 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting
              ? "Salvando..."
              : hasRating
                ? "Atualizar avaliação"
                : "Publicar avaliação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
