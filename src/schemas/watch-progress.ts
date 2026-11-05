import { z } from "zod";

export const saveWatchProgressSchema = z.object({
  movieId: z.uuid("ID do filme inválido."),
  progressSeconds: z
    .number()
    .int("O progresso deve ser um número inteiro de segundos.")
    .min(0, "O progresso não pode ser negativo."),
});

export type SaveWatchProgressInput = z.infer<typeof saveWatchProgressSchema>;
