import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { canWatchMovie } from "@/lib/movies/movie-policy";
import { requireSession, type UserRole } from "@/lib/permissions";
import { getMovieByMediaKey } from "@/lib/queries/queries";
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
  const session = await requireSession();
  try {
    const { key } = await params;
    const mediaKey = key.join("/");
    const movie = await getMovieByMediaKey(mediaKey);
    const role = session.user.role;
    const canWatch =
      movie !== null &&
      typeof role === "string" &&
      canWatchMovie({
        role: role as UserRole,
        status: movie.status,
        isOwner: movie.creatorId === session.user.id,
      });
    if (!canWatch) {
      return NextResponse.json(
        { error: "Mídia não encontrada." },
        { status: 404 },
      );
    }
    // Esta rota serve somente thumbnails.
    const absolutePath = localStorage.getAbsolutePath(mediaKey);
    const extension = path.extname(absolutePath).toLowerCase();
    if (mediaKey.startsWith("videos/")) {
      if (extension !== ".mp4") {
        return NextResponse.json(
          { error: "Formato de vídeo não permitido." },
          { status: 400 },
        );
      }
      const video = await readFile(absolutePath);
      return new NextResponse(video, {
        headers: {
          "Content-Type": "video/mp4",
          "Cache-Control": "private, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (!mediaKey.startsWith("thumbnails/")) {
      return NextResponse.json(
        { error: "Tipo de mídia não permitido." },
        { status: 403 },
      );
    }
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
