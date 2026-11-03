import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
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

const VIDEO_CHUNK_BYTES = 8 * 1024 * 1024;

type ByteRange = {
  start: number;
  end: number;
};

function parseByteRange(
  header: string,
  size: number,
): ByteRange | "unsatisfiable" {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());

  if (!match || size <= 0) {
    return "unsatisfiable";
  }

  const [, startText, endText] = match;

  if (startText === "" && endText === "") {
    return "unsatisfiable";
  }

  if (startText === "") {
    const suffixLength = Number(endText);

    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      return "unsatisfiable";
    }

    const length = Math.min(suffixLength, size);

    return { start: size - length, end: size - 1 };
  }

  const start = Number(startText);

  if (!Number.isSafeInteger(start) || start < 0 || start >= size) {
    return "unsatisfiable";
  }

  const requestedEnd = endText === "" ? size - 1 : Number(endText);

  if (!Number.isSafeInteger(requestedEnd) || requestedEnd < start) {
    return "unsatisfiable";
  }

  return {
    start,
    end: Math.min(requestedEnd, start + VIDEO_CHUNK_BYTES - 1, size - 1),
  };
}

function videoHeaders(size: number, range?: ByteRange) {
  const headers: Record<string, string> = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  };

  if (!range) {
    headers["Content-Length"] = String(size);
    return headers;
  }

  headers["Content-Length"] = String(range.end - range.start + 1);
  headers["Content-Range"] = `bytes ${range.start}-${range.end}/${size}`;
  return headers;
}

function openVideoStream(
  absolutePath: string,
  request: Request,
  start: number,
  end: number,
) {
  const nodeStream = createReadStream(absolutePath, { start, end });

  request.signal.addEventListener("abort", () => {
    nodeStream.destroy();
  });

  return Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
}

function streamVideo(absolutePath: string, request: Request, size: number) {
  const rangeHeader = request.headers.get("range");

  if (!rangeHeader) {
    return new NextResponse(
      openVideoStream(absolutePath, request, 0, size - 1),
      {
        status: 200,
        headers: videoHeaders(size),
      },
    );
  }

  const range = parseByteRange(rangeHeader, size);

  if (range === "unsatisfiable") {
    return new NextResponse(null, {
      status: 416,
      headers: {
        "Content-Range": `bytes */${size}`,
        "Accept-Ranges": "bytes",
      },
    });
  }

  return new NextResponse(
    openVideoStream(absolutePath, request, range.start, range.end),
    {
      status: 206,
      headers: videoHeaders(size, range),
    },
  );
}

type RouteContext = {
  params: Promise<{ key: string[] }>;
};

export async function GET(request: Request, { params }: RouteContext) {
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

    const absolutePath = localStorage.getAbsolutePath(mediaKey);
    const extension = path.extname(absolutePath).toLowerCase();
    if (mediaKey.startsWith("videos/")) {
      if (extension !== ".mp4") {
        return NextResponse.json(
          { error: "Formato de vídeo não permitido." },
          { status: 400 },
        );
      }

      const { size } = await stat(absolutePath);
      return streamVideo(absolutePath, request, size);
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
