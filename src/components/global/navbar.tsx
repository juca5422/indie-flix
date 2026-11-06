"use client";

import { SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import { CatalogSearch } from "@/components/home/catalog-search";
import { authClient } from "@/lib/auth-client";
import type { UserRole } from "@/lib/roles";
import { ROLES, userRoleSchema } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";

const links: {
  label: string;
  href: string;
  roles: readonly UserRole[];
}[] = [
  {
    label: "Filmmaker",
    href: "/filmmaker",
    roles: [ROLES.FILMMAKER, ROLES.ADMIN],
  },
  {
    label: "Admin",
    href: "/admin/users",
    roles: [ROLES.ADMIN],
  },
];
function isLinkActive(pathname: string, href: string) {
  if (href.startsWith("/admin")) {
    return pathname === "/admin" || pathname.startsWith("/admin/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const parsedRole = userRoleSchema.safeParse(session?.user?.role);
  const role = parsedRole.success ? parsedRole.data : undefined;

  const visibleLinks = links.filter(
    (link) => role !== undefined && link.roles.includes(role),
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
          className="flex shrink-0 items-center"
        >
          <BrandLogo className="h-9" />
        </Link>

        {/* Navegação desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => {
            const active = isLinkActive(pathname, link.href);

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
          <Suspense
            fallback={
              <div className="h-9 w-36 rounded-lg border border-border bg-elevated sm:w-56" />
            }
          >
            <CatalogSearch />
          </Suspense>

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

          <ThemeToggle />

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
            const active = isLinkActive(pathname, link.href);

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
