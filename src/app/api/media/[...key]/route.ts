import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { localStorage } from "@/lib/storage/local-storage";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type RouteContext = {
  params: Promise<{ key: string[] }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { key } = await params;
    const mediaKey = key.join("/");

    // Esta rota serve somente thumbnails.
    if (!mediaKey.startsWith("thumbnails/")) {
      return NextResponse.json(
        { error: "Tipo de mídia não permitido." },
        { status: 403 },
      );
    }

    const absolutePath = localStorage.getAbsolutePath(mediaKey);
    const extension = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[extension];

    if (!contentType) {
      return NextResponse.json(
        { error: "Formato de imagem não permitido." },
        { status: 400 },
      );
    }

    const image = await readFile(absolutePath);

    return new NextResponse(image, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Imagem não encontrada ou referência inválida." },
      { status: 404 },
    );
  }
}
