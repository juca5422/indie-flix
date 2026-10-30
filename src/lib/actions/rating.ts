"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { ratings } from "@/db/schema/catalog";
import { requireSession } from "@/lib/permissions";
import { getMovieById } from "@/lib/queries/queries";
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
  const storedScore = Math.round(score * 2);

  try {
    const movie = await getMovieById(movieId);

    if (!movie) {
      return {
        success: false,
        message: "Este filme não está disponível para avaliação.",
      };
    }

    await db
      .insert(ratings)
      .values({
        movieId,
        userId: session.user.id,
        score: storedScore,
        comment,
      })
      .onConflictDoUpdate({
        target: [ratings.userId, ratings.movieId],
        set: {
          score: storedScore,
          comment,
          updatedAt: new Date(),
        },
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
