"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCategory } from "@/lib/actions/categories";

type CategoryEditDialogProps = {
  id: string;
  name: string;
};

export function CategoryEditDialog({ id, name }: CategoryEditDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(isOpen: boolean) {
    if (isPending) return;

    setOpen(isOpen);

    if (isOpen) {
      setNewName(name);
      setMessage("");
      setIsSuccess(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await updateCategory(id, newName);

      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        router.refresh();
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Editar categoria ${name}`}
          title={`Editar ${name}`}
        >
          <PencilSimpleIcon size={18} />
        </Button>
      </DialogTrigger>

      <DialogContent className="border-border bg-surface text-text">
        <DialogHeader>
          <DialogTitle>Editar categoria</DialogTitle>
          <DialogDescription className="text-muted">
            Altere o nome da categoria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`category-name-${id}`}>Nome</Label>
            <Input
              id={`category-name-${id}`}
              name="name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              maxLength={100}
              required
              disabled={isPending}
              autoFocus
            />
          </div>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className={
                isSuccess ? "text-sm text-accent" : "text-sm text-destructive"
              }
            >
              {message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isPending || !newName.trim()}>
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
