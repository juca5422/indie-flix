import type { Metadata } from "next";
import { inter } from "@/fonts/fonts";
import "./globals.css";
import { rubikSprayPaint } from "@/fonts/fonts";



export const metadata: Metadata = {
  title: {
    default: "IndieFlix",
    template: "%s · IndieFlix",
  },
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${rubikSprayPaint.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}