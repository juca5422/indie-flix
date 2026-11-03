"use client";

import { useEffect, useState } from "react";
import { MovieComment } from "@/components/movies/movie-comment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listMovieComments } from "@/lib/actions/rating";

type MovieCommentItem = {
  id: string;
  authorName: string;
  authorImage: string | null;
  comment: string | null;
  score: number;
  createdAt: Date | string;
};

type MovieCommentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId: string;
  movieTitle: string;
};

export function MovieCommentsDialog({
  open,
  onOpenChange,
  movieId,
  movieTitle,
}: MovieCommentsDialogProps) {
  const [comments, setComments] = useState<MovieCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) return;

    let ignore = false;

    async function load() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const result = await listMovieComments(movieId);
        if (!ignore) setComments(result);
      } catch {
        if (!ignore) {
          setErrorMessage("Não foi possível carregar os comentários.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [open, movieId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comentários</DialogTitle>
          <DialogDescription>{movieTitle}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted">Carregando comentários...</p>
        ) : errorMessage ? (
          <p role="alert" className="text-sm text-danger">
            {errorMessage}
          </p>
        ) : comments.length > 0 ? (
          <ul className="space-y-6">
            {comments.map((item) => (
              <li key={item.id}>
                <MovieComment
                  authorName={item.authorName}
                  authorImage={item.authorImage}
                  comment={item.comment}
                  score={item.score}
                  createdAt={
                    item.createdAt instanceof Date
                      ? item.createdAt
                      : new Date(item.createdAt)
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nenhum comentário ainda.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
