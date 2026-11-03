"use client";

import { StarIcon, UserCircleIcon } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type MovieCommentProps = {
  authorName: string;
  authorImage: string | null;
  comment: string | null;
  score: number;
  createdAt: Date;
};

function formatScore(score: number) {
  return score.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatCommentDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function MovieComment({
  authorName,
  authorImage,
  comment,
  score,
  createdAt,
}: MovieCommentProps) {
  return (
    <article className="flex items-start gap-3">
      <Avatar size="lg">
        {authorImage ? <AvatarImage src={authorImage} alt="" /> : null}
        <AvatarFallback>
          {initials(authorName) || <UserCircleIcon size={20} />}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="text-sm font-medium text-text">{authorName}</p>
          <time
            dateTime={createdAt.toISOString()}
            className="text-xs text-muted"
          >
            {formatCommentDate(createdAt)}
          </time>
        </div>

        {comment ? (
          <p className="mt-1 text-sm leading-relaxed break-words whitespace-pre-wrap text-text">
            {comment}
          </p>
        ) : null}
      </div>

      <p className="flex shrink-0 items-center gap-1 text-sm font-semibold text-star">
        <StarIcon size={16} weight="fill" />
        <span>{formatScore(score)}</span>
        <span className="font-normal text-muted">/ 5</span>
      </p>
    </article>
  );
}
