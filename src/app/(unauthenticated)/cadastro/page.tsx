"use client";

import { CircleNotchIcon, UserPlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { type RegisterInput, registerSchema } from "@/schemas/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      const errors: Partial<Record<keyof RegisterInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (
          key === "name" ||
          key === "email" ||
          key === "password" ||
          key === "confirmPassword"
        ) {
          errors[key] ??= issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setPending(true);

    try {
      const { error } = await authClient.signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) {
        setFormError(authErrorMessage(error.message));
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setFormError("Não foi possível concluir. Tente de novo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Criar conta</h1>
        </CardTitle>
        <CardDescription>
          O cadastro é de espectador. Depois você entra no catálogo com este
          e-mail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" noValidate onSubmit={onSubmit}>
          {formError ? (
            <p
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {formError}
            </p>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Seu nome"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name ? (
              <p id="name-error" className="text-sm text-danger">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email ? (
              <p id="email-error" className="text-sm text-danger">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
            />
            {fieldErrors.password ? (
              <p id="password-error" className="text-sm text-danger">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Repita a senha"
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={
                fieldErrors.confirmPassword
                  ? "confirmPassword-error"
                  : undefined
              }
            />
            {fieldErrors.confirmPassword ? (
              <p id="confirmPassword-error" className="text-sm text-danger">
                {fieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full"
            disabled={pending}
          >
            {pending ? (
              <CircleNotchIcon className="animate-spin" size={18} />
            ) : (
              <UserPlusIcon size={18} />
            )}
            {pending ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
