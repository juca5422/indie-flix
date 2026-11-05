"use client";

import {
  ArrowCounterClockwiseIcon,
  DotsThreeVerticalIcon,
  HeartIcon,
  InfoIcon,
  PlayIcon,
  ProhibitIcon,
  StarIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { AddMovieDialog } from "@/components/filmmaker/add-movie-dialog";
import { BanMovieDialog } from "@/components/movies/ban-movie";
import { MovieCommentsDialog } from "@/components/movies/movie-comments-dialog";
import { MovieStatusBanner } from "@/components/movies/movie-status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleFavorite } from "@/lib/actions/favorites";
import { banMovieAction, publishMovieAction } from "@/lib/actions/movies";
import {
  getMovieActions,
  type MovieContext,
  type MovieStatus,
} from "@/lib/movies/movie-policy";
import type { UserRole } from "@/lib/roles";

interface EditableMovie {
  id: string;
  title: string;
  synopsis: string;
  ageRating: "L" | "10" | "12" | "14" | "16" | "18";
  categoryIds: string[];
  videoUrl: string;
  thumbnailUrl: string;
}

interface MovieCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  category: string;
  categoryIds: string[];
  creatorName: string;
  averageRating: number | null;
  ratingsCount: number | null;
  synopsis: string;
  status: MovieStatus;
  banReason?: string | null;
  showStatus?: boolean;
  role: UserRole;
  context: MovieContext;
  isOwner: boolean;
  initialFavorited: boolean;

  // Necessário para abrir o formulário com os dados completos.
  editableMovie?: EditableMovie;
}

export function MovieCard({
  id,
  title,
  thumbnailUrl,
  category,
  categoryIds,
  creatorName,
  averageRating,
  ratingsCount,
  synopsis,
  status,
  banReason,
  showStatus = false,
  role,
  context,
  isOwner,
  editableMovie,
  initialFavorited,
}: MovieCardProps) {
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [synopsisOpen, setSynopsisOpen] = useState(false);
  const [favorited, setFavorited] = useState(initialFavorited);

  async function handleToggleFavorite() {
    const next = !favorited;
    setFavorited(next);

    const result = await toggleFavorite({ movieId: id });

    if (!result.success) {
      setFavorited(!next);
    }
  }

  const actions = getMovieActions({
    role,
    context,
    status,
    isOwner,
  });

  const canRequestReview = actions.includes("REQUEST_REVIEW");
  const canEdit = actions.includes("EDIT");
  const canBanMovie = actions.includes("BAN");
  const canPublishMovie = actions.includes("PUBLISH");
  const hasMenuActions = actions.length > 0;

  return (
    <>
      <Card className="group gap-0 overflow-hidden border-border bg-surface py-0 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-black/20">
        {showStatus && (
          <MovieStatusBanner status={status} banReason={banReason} />
        )}

        <div className="relative">
          <Link
            href={`/filmes/${id}`}
            aria-label={`Ver detalhes de ${title}`}
            className="relative block aspect-video overflow-hidden bg-elevated"
          >
            <img
              src={`/api/media/${thumbnailUrl}`}
              alt={`Capa de ${title}`}
              width={640}
              height={360}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

            <Badge className="absolute left-3 top-3 border border-white/10 bg-bg/80 text-text backdrop-blur hover:bg-bg/90">
              {category}
            </Badge>

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-12 items-center justify-center rounded-full border border-white/30 bg-primary text-bg shadow-lg transition-transform duration-200 group-hover:scale-110">
                <PlayIcon size={23} weight="fill" />
              </span>
            </span>
          </Link>
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 p-4">
            <span className="line-clamp-1 min-w-0 text-lg font-semibold text-white">
              {title}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void handleToggleFavorite();
              }}
              aria-label={
                favorited
                  ? `Remover ${title} dos favoritos`
                  : `Favoritar ${title}`
              }
              aria-pressed={favorited}
              className="shrink-0 text-white"
            >
              <HeartIcon size={22} weight={favorited ? "fill" : "regular"} />
            </button>
          </div>

          {hasMenuActions && (
            <div className="absolute right-3 top-3 z-20">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Ações para ${title}`}
                    title="Ações do filme"
                    className="size-9 border border-white/15 bg-bg/85 text-white shadow-md backdrop-blur hover:bg-elevated hover:text-white"
                  >
                    <DotsThreeVerticalIcon size={22} weight="bold" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="z-50 w-52 border border-border bg-popover text-popover-foreground shadow-lg"
                >
                  {(canEdit || canRequestReview) && (
                    <DropdownMenuItem
                      disabled={!editableMovie}
                      onSelect={(event) => {
                        event.preventDefault();
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <ArrowCounterClockwiseIcon size={18} />
                      {canEdit ? "Editar filme" : "Solicitar revisão"}
                    </DropdownMenuItem>
                  )}

                  {canBanMovie && (
                    <DropdownMenuItem
                      className="text-danger focus:text-danger"
                      onSelect={(event) => {
                        event.preventDefault();
                        setIsBanDialogOpen(true);
                      }}
                    >
                      <ProhibitIcon size={18} />
                      Banir filme
                    </DropdownMenuItem>
                  )}

                  {canPublishMovie && (
                    <DropdownMenuItem
                      onSelect={() => {
                        void publishMovieAction(id);
                      }}
                    >
                      <PlayIcon size={18} />
                      Publicar filme
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <UserCircleIcon size={22} className="shrink-0 text-muted" />
              <span className="truncate text-sm text-muted">{creatorName}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsCommentsDialogOpen(true)}
              aria-label={`Ver comentários de ${title}`}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 hover:bg-elevated"
            >
              <StarIcon size={17} weight="fill" className="text-star" />
              <span className="text-sm font-semibold text-text">
                {averageRating !== null ? averageRating.toFixed(1) : "—"}
              </span>
              <span className="text-xs text-muted">({ratingsCount ?? 0})</span>
            </button>
          </div>

          <div className="border-t border-border pt-3">
            <Button
              type="button"
              variant="ghost"
              aria-expanded={synopsisOpen}
              onClick={() => setSynopsisOpen((open) => !open)}
              className="h-auto justify-start gap-2 px-0 py-1 text-primary hover:bg-transparent hover:text-primary-hover"
            >
              <InfoIcon size={18} />
              {synopsisOpen ? "Ocultar sinopse" : "Ver sinopse"}
            </Button>

            <p
              className={`mt-2 text-sm leading-relaxed text-muted ${
                synopsisOpen ? "" : "hidden group-hover:block"
              }`}
            >
              {synopsis}
            </p>
          </div>
        </CardContent>
      </Card>

      {editableMovie && (
        <AddMovieDialog
          mode="edit"
          movie={{
            ...editableMovie,
            categoryIds: editableMovie.categoryIds ?? categoryIds,
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      <BanMovieDialog
        open={isBanDialogOpen}
        onOpenChange={setIsBanDialogOpen}
        movieTitle={title}
        onConfirm={async (reason: string) => {
          return banMovieAction({
            movieId: id,
            reason,
          });
        }}
      />
      <MovieCommentsDialog
        open={isCommentsDialogOpen}
        onOpenChange={setIsCommentsDialogOpen}
        movieId={id}
        movieTitle={title}
      />
    </>
  );
}
