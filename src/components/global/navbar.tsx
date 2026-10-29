"use client";

import {
  FilmSlateIcon,
  MagnifyingGlassIcon,
  SignOutIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const links = [
  {
    label: "Filmmaker",
    href: "/filmmaker",
    roles: ["FILMMAKER", "ADMIN"],
  },
  {
    label: "Admin",
    href: "/admin/users",
    roles: ["ADMIN"],
  },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const role = session?.user?.role;

  const visibleLinks = links.filter(
    (link) => role && link.roles.includes(role as (typeof link.roles)[number]),
  );

  async function handleSignOut() {
    const { error } = await authClient.signOut();

    if (error) {
      console.error("Não foi possível sair da conta.", error);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        {/* Marca */}
        <Link
          href="/home"
          aria-label="IndieFlix — início"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-bg">
            <FilmSlateIcon size={21} weight="duotone" />
          </span>

          <span className="text-xl font-semibold tracking-tight text-text">
            Indie<span className="font-display text-primary">Flix</span>
          </span>
        </Link>

        {/* Navegação desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted hover:bg-elevated hover:text-text",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Ações e usuário */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/filmes"
            aria-label="Pesquisar filmes"
            title="Pesquisar filmes"
            className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-text"
          >
            <MagnifyingGlassIcon size={20} />
          </Link>

          <div className="hidden h-8 w-px bg-border sm:block" />

          <div className="hidden items-center gap-2 sm:flex">
            <UserCircleIcon size={25} className="text-primary" />

            <div className="max-w-36">
              <p className="truncate text-sm font-medium text-text">
                {isPending
                  ? "Carregando..."
                  : (session?.user.name ?? "Usuário")}
              </p>
              <p className="text-xs text-muted">Minha conta</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sair da conta"
            title="Sair da conta"
            className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <SignOutIcon size={20} />
          </button>
        </div>
      </nav>

      {/* Navegação mobile */}
      {visibleLinks.length > 0 && (
        <div className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 md:hidden">
          {visibleLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted hover:bg-elevated hover:text-text",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
