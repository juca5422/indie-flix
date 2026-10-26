import { z } from "zod";

export const ratingSchema = z.object({
    movieId: z.uuid(),
    score: z
      .number()
      .min(0.5, "A nota mínima é 0,5")
      .max(5, "A nota máxima é 5")
      .refine(
        (score) => Number.isInteger(score * 2),
        "A nota deve avançar em intervalos de 0,5",
      ),
    comment: z.string().trim().max(1000, "Comentário muito longo").optional(),
  });

export type RatingInput = z.infer<typeof ratingSchema>;

export const movieSchema = z.object({
    title: z.string().trim().min(1, "Informe o título").max(120),
    synopsis: z.string().trim().min(1, "Informe a sinopse").max(2000),
    ageRating: z.enum(["L", "10", "12", "14", "16", "18"]),
    categoryIds: z.array(z.uuid()).min(1, "Escolha ao menos uma categoria"),
    videoUrl: z.url(),
    thumbnailUrl: z.url(),
  });
  
export type MovieInput = z.infer<typeof movieSchema>;

export const categorySchema = z.object({
    id: z.uuid().optional(),
    name: z.string().trim().min(2, "Informe o nome").max(40),
  });
  
export type CategoryInput = z.infer<typeof categorySchema>;

export const banMovieSchema = z.object({
    movieId: z.uuid(),
    reason: z.string().trim().min(10, "Explique o motivo do banimento"),
  });
  
export type BanMovieInput = z.infer<typeof banMovieSchema>;

// Alteração de perfil de usuário
export const updateUserRoleSchema = z.object({
    userId: z.uuid(),
    role: z.enum(["user", "filmmaker", "admin"]),
  });
  
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
  
export const favoriteSchema = z.object({
    movieId: z.uuid(),
  });
  
export type FavoriteInput = z.infer<typeof favoriteSchema>;