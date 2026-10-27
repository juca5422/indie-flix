
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Acesso negado</h1>

      <p className="text-muted">
        Você não tem permissão para acessar esta página.
      </p>

      <Link
        href="/home"
        className="rounded-lg bg-primary px-4 py-2 font-medium text-bg transition-opacity hover:opacity-90"
      >
        Voltar ao início
      </Link>
    </section>
  );
}
