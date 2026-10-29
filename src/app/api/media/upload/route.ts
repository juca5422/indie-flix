import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/permissions";
import { localStorage } from "@/lib/storage/local-storage";
import type { MediaType } from "@/lib/storage/storage";

const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES: Record<MediaType, string[]> = {
  videos: ["video/mp4"],
  thumbnails: ["image/jpeg", "image/png", "image/webp"],
};

const MAX_SIZES: Record<MediaType, number> = {
  videos: MAX_VIDEO_SIZE,
  thumbnails: MAX_THUMBNAIL_SIZE,
};

export async function POST(request: Request) {
  try {
    // 1. Verifica se o usuário está autenticado.
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

    // 2. Recebe os dados do formulário.
    const formData = await request.formData();

    const file = formData.get("file");
    const type = formData.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo válido foi enviado." },
        { status: 400 },
      );
    }

    if (type !== "videos" && type !== "thumbnails") {
      return NextResponse.json(
        { error: "Tipo de arquivo inválido." },
        { status: 400 },
      );
    }

    const mediaType: MediaType = type;

    // 3. Valida tamanho e tipo MIME.
    if (file.size === 0) {
      return NextResponse.json(
        { error: "O arquivo está vazio." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZES[mediaType]) {
      return NextResponse.json(
        {
          error:
            mediaType === "videos"
              ? "O vídeo ultrapassa o limite de 2 GB."
              : "A thumbnail ultrapassa o limite de 5 MB.",
        },
        { status: 413 },
      );
    }

    if (!ALLOWED_TYPES[mediaType].includes(file.type)) {
      return NextResponse.json(
        { error: "Formato de arquivo não permitido." },
        { status: 415 },
      );
    }

    // 4. Salva o arquivo e retorna uma chave relativa.
    const key = await localStorage.save(file, mediaType);

    return NextResponse.json(
      {
        message: "Arquivo enviado com sucesso.",
        key,
        type: mediaType,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao realizar upload:", error);

    return NextResponse.json(
      { error: "Não foi possível realizar o upload do arquivo." },
      { status: 500 },
    );
  }
}
