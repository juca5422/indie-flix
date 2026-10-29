"use client";

import { InfoIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MovieStatus = "PENDING_REVIEW" | "PUBLISHED" | "BANNED";

interface MovieStatusBannerProps {
  status: MovieStatus;
  banReason?: string | null;
}

const STATUS_CONFIG = {
  PUBLISHED: {
    label: "Ativo",
    description: "Este filme está publicado no catálogo.",
    className: "bg-emerald-500/15 text-emerald-400",
  },
  PENDING_REVIEW: {
    label: "Pendente de revisão",
    description: "Este filme está aguardando análise.",
    className: "bg-amber-500/15 text-amber-400",
  },
  BANNED: {
    label: "Banido",
    description: "Este filme foi banido. Clique para consultar o motivo.",
    className: "bg-red-500/15 text-red-400",
  },
} satisfies Record<
  MovieStatus,
  { label: string; description: string; className: string }
>;

export function MovieStatusBanner({
  status,
  banReason,
}: MovieStatusBannerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const config = STATUS_CONFIG[status];
  const isBanned = status === "BANNED";

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                if (isBanned) setDialogOpen(true);
              }}
              aria-label={
                isBanned
                  ? "Consultar motivo do banimento"
                  : `Status do filme: ${config.label}`
              }
              className={`flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-semibold ${config.className} ${
                isBanned
                  ? "cursor-pointer hover:brightness-110"
                  : "cursor-default"
              }`}
            >
              {isBanned && <InfoIcon size={15} />}
              {config.label}
            </button>
          </TooltipTrigger>

          <TooltipContent>
            <p>{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filme banido</DialogTitle>
            <DialogDescription>
              Este filme não está disponível no catálogo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Motivo do banimento</h4>
            <p className="whitespace-pre-wrap text-sm text-muted">
              {banReason?.trim() || "Nenhum motivo detalhado foi informado."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
