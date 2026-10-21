import { z } from "zod";

export const movieSchema = z.object({
  title: z.string().trim().min(1, "Informe o título").max(120),
  synopsis: z.string().trim().min(1, "Informe a sinopse").max(2000),
  ageRating: z.enum(["L", "10", "12", "14", "16", "18"]),
  categoryIds: z.array(z.uuid()).min(1, "Escolha ao menos uma categoria"),
  videoUrl: z.url(),
  thumbnailUrl: z.url(),
});

export type MovieInput = z.infer<typeof movieSchema>;
