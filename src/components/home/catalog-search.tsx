"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function CatalogSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [value, setValue] = useState(query);

  useEffect(() => {
    setValue(query);
  }, [query]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const term = value.trim();

      if (term === query) return;

      if (!term) {
        router.replace("/home");
        return;
      }

      router.replace(`/home?q=${encodeURIComponent(term)}`);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [value, query, router]);

  return (
    <label className="relative block">
      <span className="sr-only">Pesquisar filmes</span>
      <MagnifyingGlassIcon
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar por título"
        className="h-9 w-36 rounded-lg border border-border bg-elevated pl-9 pr-3 text-sm text-text outline-none placeholder:text-muted focus:border-primary sm:w-56"
      />
    </label>
  );
}
