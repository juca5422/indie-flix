"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ROLES, requireRole } from "@/lib/permissions";
import {
  banMovie as banMovieQuery,
  insertMovieWithCategories,
  resubmitMovieForReview,
  updateMovieWithCategories,
} from "@/lib/queries/queries";

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

const movieIdSchema = z.string().uuid("ID do filme inválido.");

const banMovieSchema = z.object({
  movieId: movieIdSchema,
  reason: z
    .string()
    .trim()
    .min(1, "O motivo do banimento é obrigatório.")
    .max(1000, "O motivo deve ter no máximo 1000 caracteres."),
});

const updateMovieSchema = z.object({
  movieId: movieIdSchema,
  title: z.string().trim().min(1, "O título é obrigatório.").max(200),
  synopsis: z.string().trim().min(1, "A sinopse é obrigatória.").max(5000),
  videoUrl: z.string().trim().min(1, "O vídeo é obrigatório."),
  thumbnailUrl: z.string().trim().min(1, "A thumbnail é obrigatória."),
  ageRating: z.enum(["L", "10", "12", "14", "16", "18"]),
  categoryIds: z
    .array(z.string().uuid())
    .min(1, "Selecione pelo menos uma categoria."),
});
type MovieActionResult = {
  success: boolean;
  message: string;
};

export async function createMovie(input: unknown): Promise<MovieActionResult> {
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
    revalidatePath("/filmes");

    return {
      success: true,
      message: "Filme cadastrado com sucesso.",
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

export async function requestMovieReview(
  movieId: unknown,
): Promise<MovieActionResult> {
  // Somente cineastas podem solicitar uma nova análise.
  const session = await requireRole([ROLES.FILMMAKER]);

  const validation = movieIdSchema.safeParse(movieId);

  if (!validation.success) {
    return {
      success: false,
      message: "ID do filme inválido.",
    };
  }

  try {
    // A query verifica o proprietário e se o filme está banido.
    const movie = await resubmitMovieForReview(
      validation.data,
      session.user.id,
    );

    if (!movie) {
      return {
        success: false,
        message:
          "Não foi possível solicitar a revisão. Verifique se o filme pertence a você e está banido.",
      };
    }

    revalidatePath("/filmmaker");
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      message: "Filme enviado para nova análise.",
    };
  } catch (error) {
    console.error("Erro ao solicitar revisão do filme:", error);

    return {
      success: false,
      message: "Não foi possível solicitar a revisão do filme.",
    };
  }
}

export async function banMovieAction(
  input: unknown,
): Promise<MovieActionResult> {
  // A permissão é validada no servidor, independentemente da interface.
  await requireRole([ROLES.ADMIN]);

  const validation = banMovieSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ??
        "Os dados do banimento são inválidos.",
    };
  }

  try {
    const movie = await banMovieQuery(
      validation.data.movieId,
      validation.data.reason,
    );

    if (!movie) {
      return {
        success: false,
        message:
          "Não foi possível banir o filme. Ele pode não existir ou não estar publicado.",
      };
    }

    revalidatePath("/admin");
    revalidatePath("/filmmaker");
    revalidatePath("/");
    revalidatePath("/filmes");

    return {
      success: true,
      message: "Filme banido com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao banir filme:", error);

    return {
      success: false,
      message: "Não foi possível banir o filme.",
    };
  }
}

export async function updateMovie(input: unknown): Promise<MovieActionResult> {
  const session = await requireRole([ROLES.FILMMAKER, ROLES.ADMIN]);

  const validation = updateMovieSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ??
        "Os dados do filme são inválidos.",
    };
  }

  try {
    const movie = await updateMovieWithCategories({
      ...validation.data,
      creatorId: session.user.id,
    });

    if (!movie) {
      return {
        success: false,
        message:
          "Não foi possível editar o filme. Verifique se ele pertence a você e está banido.",
      };
    }

    revalidatePath("/filmmaker");
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/filmes");

    return {
      success: true,
      message: "Filme atualizado e enviado para nova análise.",
    };
  } catch (error) {
    console.error("Erro ao editar filme:", error);

    return {
      success: false,
      message: "Não foi possível editar o filme.",
    };
  }
}
