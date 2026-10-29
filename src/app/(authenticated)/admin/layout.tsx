import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <section className="space-y-6">
      <AdminNav />
      {children}
    </section>
  );
}
