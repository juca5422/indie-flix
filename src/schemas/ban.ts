import { z } from "zod";

export const banMovieSchema = z.object({
  movieId: z.uuid(),
  reason: z.string().trim().min(10, "Explique o motivo do banimento"),
});

export type BanMovieInput = z.infer<typeof banMovieSchema>;
