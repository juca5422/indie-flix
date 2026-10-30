"use client";

import { useState } from "react";
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

interface BanMovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieTitle: string;
  onConfirm: (reason: string) => Promise<{ success: boolean; message: string }>;
}

export function BanMovieDialog({
  open,
  onOpenChange,
  movieTitle,
  onConfirm,
}: BanMovieDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    const description = reason.trim();

    if (!description || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const result = await onConfirm(description);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setReason("");
      setErrorMessage("");
      onOpenChange(false);
    } catch {
      setErrorMessage("Ocorreu um erro ao banir o filme.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;

    if (!nextOpen) {
      setReason("");
      setErrorMessage("");
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Banir filme: {movieTitle}</DialogTitle>

          <DialogDescription>
            Informe o motivo do banimento deste filme.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="ban-reason">Descrição do banimento *</label>

          <Textarea
            id="ban-reason"
            placeholder="Descreva o motivo do banimento..."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isSubmitting}
            required
          />

          <p className="text-sm text-muted">
            Essa descrição será registrada para justificar a decisão.
          </p>

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
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={!reason.trim() || isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? "Banindo..." : "Banir filme"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
