import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().trim().min(1, "O título é obrigatório.").max(200),
  synopsis: z.string().trim().min(1, "A sinopse é obrigatória.").max(5000),
  videoUrl: z.string().trim().min(1, "O vídeo é obrigatório."),
  thumbnailUrl: z.string().trim().min(1, "A thumbnail é obrigatória."),
  ageRating: z.enum(["L", "10", "12", "14", "16", "18"]),
  categoryIds: z
    .array(z.string().uuid())
    .min(1, "Selecione pelo menos uma categoria."),
});

export const movieIdSchema = z.string().uuid("ID do filme inválido.");

export const banMovieSchema = z.object({
  movieId: movieIdSchema,
  reason: z
    .string()
    .trim()
    .min(1, "O motivo do banimento é obrigatório.")
    .max(1000, "O motivo deve ter no máximo 1000 caracteres."),
});

export const updateMovieSchema = z.object({
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

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type BanMovieInput = z.infer<typeof banMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
