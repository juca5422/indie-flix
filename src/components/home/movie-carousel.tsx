"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { type ReactNode, useRef } from "react";

export function MovieCarousel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByPage(direction: "left" | "right") {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const amount = scroller.clientWidth * 0.8;
    scroller.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByPage("left")}
            aria-label={`Voltar em ${title}`}
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted hover:text-text"
          >
            <CaretLeftIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage("right")}
            aria-label={`Avançar em ${title}`}
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted hover:text-text"
          >
            <CaretRightIcon size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none]"
      >
        {children}
      </div>
    </section>
  );
}
