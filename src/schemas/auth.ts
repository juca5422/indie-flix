import { z } from "zod";

const email = z.email("Informe um e-mail válido");
const password = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres")
  .max(128, "A senha passou do limite de caracteres");

export const loginSchema = z.object({
  email,
  password,
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe seu nome")
      .max(80, "Nome muito longo"),
    email,
    password,
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
