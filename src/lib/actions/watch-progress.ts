"use server";

import { canWatchMovie } from "@/lib/movies/movie-policy";
import { requireSession } from "@/lib/permissions";
import {
  getMovieForPlayback,
  upsertWatchProgress,
} from "@/lib/queries/queries";
import { saveWatchProgressSchema } from "@/schemas/watch-progress";

type SaveWatchProgressResult = {
  success: boolean;
  message: string;
};

export async function saveWatchProgress(
  input: unknown,
): Promise<SaveWatchProgressResult> {
  // 1. Só usuários logados salvam progresso.
  const session = await requireSession();

  // 2. Valida o que veio do player.
  const validation = saveWatchProgressSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Progresso inválido.",
    };
  }

  const { movieId, progressSeconds } = validation.data;

  try {
    // 3. Confere se o filme existe e se este usuário pode assisti-lo.
    const movie = await getMovieForPlayback(movieId);

    if (!movie) {
      return { success: false, message: "Filme não encontrado." };
    }

    const allowed = canWatchMovie({
      role: session.user.role,
      status: movie.status,
      isOwner: movie.creatorId === session.user.id,
    });

    if (!allowed) {
      return { success: false, message: "Você não pode assistir este filme." };
    }

    // 4. Cria ou atualiza a linha deste usuário neste filme.
    await upsertWatchProgress({
      userId: session.user.id,
      movieId,
      progressSeconds,
    });

    return { success: true, message: "Progresso salvo." };
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);

    return {
      success: false,
      message: "Não foi possível salvar o progresso.",
    };
  }
}
