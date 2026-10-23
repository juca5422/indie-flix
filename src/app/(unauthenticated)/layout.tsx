import { FilmSlate } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-16 size-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 size-96 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-10 sm:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-20">
          <section className="max-w-lg">
            <div className="flex items-center gap-3 lg:mb-6">
              <span className="flex size-11 items-center justify-center rounded-card bg-elevated text-primary">
                <FilmSlate size={26} weight="duotone" />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                IndieFlix
              </span>
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
