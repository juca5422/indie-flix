import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 341;

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  const size = cn("h-10 w-auto", className);

  return (
    <>
      {/* Indie em branco: some quando html recebe a classe light. */}
      <Image
        src="/brand/IndieLight.png"
        alt="IndieFlix"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className={cn("block [html.light_&]:hidden", size)}
      />
      {/* Indie escuro: só aparece no tema claro. */}
      <Image
        src="/brand/IndieDark.png"
        alt="IndieFlix"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className={cn("hidden [html.light_&]:block", size)}
      />
    </>
  );
}
