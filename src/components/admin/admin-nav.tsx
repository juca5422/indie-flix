"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminLinks = [
  { label: "Usuários", href: "/admin/users" },
  { label: "Categorias", href: "/admin/categories" },
  { label: "Filmes", href: "/admin/movies" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação administrativa"
      className="flex flex-wrap gap-1 border-b border-border"
    >
      {adminLinks.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-text",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
