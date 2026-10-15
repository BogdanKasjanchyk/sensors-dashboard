import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login",
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100dvh-11rem)] items-center justify-center py-8">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold tracking-tight">
          Вхід у систему
        </h1>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Електронна пошта
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={inputClass}
              disabled
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={inputClass}
              disabled
            />
          </div>

          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-foreground py-2.5 font-medium text-background opacity-60"
          >
            Авторизація тимчасово недоступна
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-accent hover:underline"
          >
            ← Повернутись на головну
          </Link>
        </div>
      </div>
    </div>
  );
}
