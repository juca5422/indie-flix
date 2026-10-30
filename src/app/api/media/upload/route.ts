import { Readable } from "node:stream";
import Busboy from "busboy";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/permissions";
import {
  EmptyMediaError,
  localStorage,
  MediaTooLargeError,
} from "@/lib/storage/local-storage";
import type { MediaType } from "@/lib/storage/storage";

const MAX_VIDEO_SIZE = 10 * 1024 * 1024 * 1024; // 10 GB
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES: Record<MediaType, string[]> = {
  videos: ["video/mp4"],
  thumbnails: ["image/jpeg", "image/png", "image/webp"],
};

const MAX_SIZES: Record<MediaType, number> = {
  videos: MAX_VIDEO_SIZE,
  thumbnails: MAX_THUMBNAIL_SIZE,
};

class UploadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

function isMediaType(value: string): value is MediaType {
  return value === "videos" || value === "thumbnails";
}

function readUpload(
  request: Request,
): Promise<{ key: string; type: MediaType }> {
  const contentType = request.headers.get("content-type");
  const body = request.body;

  if (!contentType || !body) {
    return Promise.reject(
      new UploadError("Nenhum arquivo válido foi enviado.", 400),
    );
  }

  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: { "content-type": contentType },
      // O busboy marca o arquivo como cortado ao atingir o limite, inclusive
      // quando o tamanho é exatamente esse valor. +1 deixa o teto real no Transform.
      limits: { files: 1, fields: 1, fileSize: MAX_VIDEO_SIZE + 1 },
    });

    let mediaType: MediaType | null = null;
    let pending: Promise<string> | null = null;
    let failed = false;

    const fail = (error: unknown) => {
      if (failed) return;
      failed = true;
      reject(error);
    };

    busboy.on("field", (name, value) => {
      if (name === "type" && isMediaType(value)) {
        mediaType = value;
      }
    });

    busboy.on("file", (name, file, info) => {
      if (name !== "file") {
        file.resume();
        return;
      }

      if (!mediaType) {
        file.resume();
        fail(new UploadError("Tipo de arquivo inválido.", 400));
        return;
      }

      if (!ALLOWED_TYPES[mediaType].includes(info.mimeType)) {
        file.resume();
        fail(new UploadError("Formato de arquivo não permitido.", 415));
        return;
      }

      const type = mediaType;

      pending = localStorage
        .saveStream(file, type, info.mimeType, MAX_SIZES[type])
        .then(async (key) => {
          if (file.truncated) {
            await localStorage.delete(key);
            throw new MediaTooLargeError();
          }

          return key;
        });

      pending.catch((error: unknown) => {
        fail(error);
      });
    });

    busboy.on("close", () => {
      if (failed) return;

      if (!pending || !mediaType) {
        fail(new UploadError("Nenhum arquivo válido foi enviado.", 400));
        return;
      }

      pending.then(
        (key) => resolve({ key, type: mediaType as MediaType }),
        fail,
      );
    });

    busboy.on("error", fail);

    Readable.fromWeb(
      body as import("node:stream/web").ReadableStream<Uint8Array>,
    ).pipe(busboy);
  });
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado para enviar arquivos." },
        { status: 401 },
      );
    }

    if (
      session.user.role !== ROLES.FILMMAKER &&
      session.user.role !== ROLES.ADMIN
    ) {
      return NextResponse.json(
        { error: "Você não tem permissão para enviar arquivos." },
        { status: 403 },
      );
    }

    const uploaded = await readUpload(request);

    return NextResponse.json(
      {
        message: "Arquivo enviado com sucesso.",
        key: uploaded.key,
        type: uploaded.type,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof EmptyMediaError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof MediaTooLargeError) {
      return NextResponse.json(
        { error: "O arquivo ultrapassa o limite permitido." },
        { status: 413 },
      );
    }

    if (error instanceof UploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Erro ao realizar upload:", error);

    return NextResponse.json(
      { error: "Não foi possível realizar o upload do arquivo." },
      { status: 500 },
    );
  }
}
