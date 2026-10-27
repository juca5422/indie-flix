
import Link from "next/link";
import { requireAdmin } from "@/lib/permissions";

const adminLinks = [
  { label: "Usuários", href: "/admin/users" },
  { label: "Categorias", href: "/admin/categories" },
  { label: "Filmes", href: "/admin/movies" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <section className="space-y-6">
      <nav
        aria-label="Navegação administrativa"
        className="flex flex-wrap gap-2 border-b border-border pb-3"
      >
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {children}
    </section>
  );
}
