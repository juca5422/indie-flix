import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/global/brand-logo";
import { ThemeToggle } from "@/components/global/theme-toggle";
import { auth } from "@/lib/auth";
export const instant = false;

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/home");
  }
  return (
    <div className="relative grid min-h-dvh place-items-center px-5 py-10 sm:px-8">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-16 size-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 size-96 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-20">
          <section className="max-w-lg">
            <div className="lg:mb-6">
              <BrandLogo className="h-12 lg:h-16" />
            </div>
            <div className="hidden lg:block">
              <p className="text-4xl font-semibold tracking-tight text-balance">
                Cinema independente, no seu ritmo.
              </p>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
                Entre para explorar o catálogo, avaliar filmes e acompanhar o
                que os cineastas publicam.
              </p>
            </div>
          </section>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
