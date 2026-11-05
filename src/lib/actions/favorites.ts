"use server";

import { revalidatePath } from "next/cache";

import { canWatchMovie } from "@/lib/movies/movie-policy";
import { requireSession } from "@/lib/permissions";
import {
  getMovieForPlayback,
  toggleMovieFavorite,
} from "@/lib/queries/queries";
import { favoriteSchema } from "@/schemas/schema";

type ToggleFavoriteResult = {
  success: boolean;
  favorited: boolean;
  message: string;
};

export async function toggleFavorite(
  input: unknown,
): Promise<ToggleFavoriteResult> {
  const session = await requireSession();
  const validation = favoriteSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      favorited: false,
      message: "Filme inválido.",
    };
  }

  const { movieId } = validation.data;

  try {
    const movie = await getMovieForPlayback(movieId);

    if (!movie) {
      return {
        success: false,
        favorited: false,
        message: "Filme não encontrado.",
      };
    }

    const allowed = canWatchMovie({
      role: session.user.role,
      status: movie.status,
      isOwner: movie.creatorId === session.user.id,
    });

    if (!allowed) {
      return {
        success: false,
        favorited: false,
        message: "Você não pode favoritar este filme.",
      };
    }

    const favorited = await toggleMovieFavorite(session.user.id, movieId);

    revalidatePath("/home");
    revalidatePath(`/filmes/${movieId}`);
    revalidatePath("/filmmaker");
    revalidatePath("/admin/movies");

    return {
      success: true,
      favorited,
      message: favorited
        ? "Filme favoritado."
        : "Filme removido dos favoritos.",
    };
  } catch (error) {
    console.error("Erro ao favoritar filme:", error);

    return {
      success: false,
      favorited: false,
      message: "Não foi possível atualizar o favorito.",
    };
  }
}
