"use client";

import { TrashIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/lib/actions/categories";

type CategoryDeleteButtonProps = {
  id: string;
  name: string;
};

export function CategoryDeleteButton({ id, name }: CategoryDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleDelete() {
    const confirmed = window.confirm(
      `Deseja realmente excluir a categoria "${name}"?`,
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      const result = await deleteCategory(id);
      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isPending}
        aria-label={`Excluir categoria ${name}`}
        title={`Excluir ${name}`}
        className="text-destructive hover:bg-destructive/10"
      >
        <TrashIcon size={18} />
      </Button>

      {message && (
        <span
          role="status"
          className="max-w-64 text-right text-xs text-muted-foreground"
        >
          {message}
        </span>
      )}
    </div>
  );
}
