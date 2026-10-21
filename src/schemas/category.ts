import { z } from "zod";

export const categorySchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Informe o nome").max(40),
});

export type CategoryInput = z.infer<typeof categorySchema>;
