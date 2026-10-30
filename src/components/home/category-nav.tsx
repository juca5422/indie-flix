"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type CategoryLink = {
  label: string;
  href: string;
};

export function CategoryNav({ links }: { links: CategoryLink[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Categorias"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {links.map((link) => {
        const active =
          link.href === "/home" ? pathname === "/home" : pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
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
