import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "@/components/global/navbar";
import { auth } from "@/lib/auth";

export const instant = false;
export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
