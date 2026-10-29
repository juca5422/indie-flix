"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ROLES, requireRole } from "@/lib/permissions";
import { insertMovieWithCategories } from "@/lib/queries/queries";

const createMovieSchema = z.object({
  title: z.string().trim().min(1, "O título é obrigatório.").max(200),
  synopsis: z.string().trim().min(1, "A sinopse é obrigatória.").max(5000),
  videoUrl: z.string().trim().min(1, "O vídeo é obrigatório."),
  thumbnailUrl: z.string().trim().min(1, "A thumbnail é obrigatória."),
  ageRating: z.enum(["L", "10", "12", "14", "16", "18"]),
  categoryIds: z
    .array(z.string().uuid())
    .min(1, "Selecione pelo menos uma categoria."),
});

type CreateMovieResult = {
  success: boolean;
  message: string;
};

export async function createMovie(input: unknown): Promise<CreateMovieResult> {
  const session = await requireRole([ROLES.FILMMAKER, ROLES.ADMIN]);

  const validation = createMovieSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ??
        "Os dados do filme são inválidos.",
    };
  }

  try {
    await insertMovieWithCategories({
      ...validation.data,
      creatorId: session.user.id,
    });

    revalidatePath("/filmmaker");
    revalidatePath("/");

    return {
      success: true,
      message: "Filme cadastrado e enviado para análise.",
    };
  } catch (error) {
    console.error("Erro ao cadastrar filme:", error);

    return {
      success: false,
      message:
        "Não foi possível cadastrar o filme. Verifique os dados e as categorias.",
    };
  }
}
