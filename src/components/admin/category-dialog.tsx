"use client";

import { PlusIcon } from "@phosphor-icons/react";
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
import { createCategory } from "@/lib/actions/categories";

export function CategoryDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(isOpen: boolean) {
    if (isPending) return;

    setOpen(isOpen);

    if (!isOpen) {
      setName("");
      setMessage("");
      setIsSuccess(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createCategory(name);

      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        setName("");
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon size={18} />
          Nova categoria
        </Button>
      </DialogTrigger>

      <DialogContent className="border-border bg-surface text-text">
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
          <DialogDescription className="text-muted">
            Informe o nome da categoria que deseja cadastrar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome</Label>
            <Input
              id="category-name"
              name="name"
              placeholder="Ex.: Ficção científica"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              disabled={isPending}
              autoFocus
            />
          </div>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className={
                isSuccess ? "text-sm text-accent" : "text-sm text-danger"
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

            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Salvando..." : "Salvar categoria"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
