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

export const favoriteSchema = z.object({
  movieId: z.uuid(),
});

export type FavoriteInput = z.infer<typeof favoriteSchema>;
