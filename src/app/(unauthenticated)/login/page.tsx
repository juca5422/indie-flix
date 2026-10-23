"use client";

import { CircleNotchIcon, SignInIcon } from "@phosphor-icons/react";

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
import { type LoginInput, loginSchema } from "@/schemas/auth";



export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginInput, string>>
  >({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      const errors: Partial<Record<keyof LoginInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "email" || key === "password") errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setPending(true);

    try {
      const { error } = await authClient.signIn.email({
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
          <h1>Entrar</h1>
        </CardTitle>
        <CardDescription>
          Use o e-mail e a senha da sua conta para acessar o catálogo.
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
              autoComplete="current-password"
              placeholder="Sua senha"
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

          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full"
            disabled={pending}
          >
            {pending ? (
              <CircleNotchIcon className="animate-spin" size={18} />
            ) : (
              <SignInIcon size={18} />
            )}
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted">
          Ainda não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Criar conta
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
