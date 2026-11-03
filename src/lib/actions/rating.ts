"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/permissions";
import {
  getMovieById,
  getMovieComments,
  upsertUserMovieRating,
} from "@/lib/queries/queries";
import { ratingSchema } from "@/schemas/schema";

type SaveRatingResult = {
  success: boolean;
  message: string;
};

export async function saveRating(input: unknown): Promise<SaveRatingResult> {
  const session = await requireSession();

  const validation = ratingSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Avaliação inválida.",
    };
  }

  const { movieId, score } = validation.data;
  const comment = validation.data.comment ? validation.data.comment : null;

  try {
    const movie = await getMovieById(movieId);

    if (!movie) {
      return {
        success: false,
        message: "Este filme não está disponível para avaliação.",
      };
    }

    await upsertUserMovieRating({
      userId: session.user.id,
      movieId,
      score,
      comment,
    });

    revalidatePath(`/filmes/${movieId}`);
    revalidatePath("/home", "layout");
    revalidatePath("/filmmaker");
    revalidatePath("/admin/movies");

    return {
      success: true,
      message: "Avaliação salva.",
    };
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);

    return {
      success: false,
      message: "Não foi possível salvar a avaliação.",
    };
  }
}

const movieIdSchema = z.uuid();

export async function listMovieComments(movieId: unknown) {
  await requireSession();

  const validation = movieIdSchema.safeParse(movieId);

  if (!validation.success) {
    return [];
  }

  return getMovieComments(validation.data);
}
