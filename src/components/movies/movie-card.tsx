import {
  InfoIcon,
  PlayIcon,
  StarIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

interface MovieCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  category: string;
  creatorName: string;
  averageRating: number | null;
  ratingsCount: number;
  synopsis: string;
}

export function MovieCard({
  id,
  title,
  thumbnailUrl,
  category,
  creatorName,
  averageRating,
  ratingsCount,
  synopsis,
}: MovieCardProps) {
  return (
    <Card className="group gap-0 overflow-hidden border-border bg-surface py-0 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-black/20">
      {/* Thumbnail */}
      <Link
        href={`/filmes/${id}`}
        aria-label={`Ver detalhes de ${title}`}
        className="relative block aspect-video overflow-hidden bg-elevated"
      >
        <div
          role="img"
          aria-label={`Capa de ${title}`}
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: `url("${thumbnailUrl}")`,
          }}
        />

        {/* Sobreposição */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-bg/20" />

        {/* Categoria */}
        <Badge className="absolute left-3 top-3 border border-white/10 bg-bg/80 text-text backdrop-blur hover:bg-bg/90">
          {category}
        </Badge>

        {/* Play */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-white/30 bg-primary text-bg shadow-lg transition-transform duration-200 group-hover:scale-110">
            <PlayIcon size={23} weight="fill" />
          </span>
        </span>

        {/* Título */}
        <span className="absolute inset-x-0 bottom-0 p-4">
          <span className="line-clamp-1 text-lg font-semibold text-white">
            {title}
          </span>
        </span>
      </Link>

      <CardContent className="space-y-3 p-4">
        {/* Criador e avaliação */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <UserCircleIcon size={22} className="shrink-0 text-muted" />

            <span className="truncate text-sm text-muted">{creatorName}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <StarIcon size={17} weight="fill" className="text-star" />

            <span className="text-sm font-semibold text-text">
              {averageRating !== null ? averageRating.toFixed(1) : "—"}
            </span>

            <span className="text-xs text-muted">({ratingsCount})</span>
          </div>
        </div>

        {/* Sinopse */}
        <div className="border-t border-border pt-3">
          <Button
            asChild
            variant="ghost"
            className="h-auto justify-start gap-2 px-0 py-1 text-primary hover:bg-transparent hover:text-primary-hover"
          >
            <Link href={`/filmes/${id}`}>
              <InfoIcon size={18} />
              Ver sinopse
            </Link>
          </Button>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {synopsis}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
