"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-500 font-medium">Link inválido ou expirado.</p>
        <Link
          href="/forgot-password"
          className="inline-block px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm
            active:scale-95 transition-all"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 animate-slide-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
          Senha alterada!
        </p>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Redirecionando para o login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Nova senha (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full h-14 px-5 pr-14 rounded-3xl
            bg-surface-light dark:bg-surface-dark
            text-text-primary-light dark:text-text-primary-dark
            placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50
            border border-black/5 dark:border-white/5
            focus:border-primary/30
            transition-all duration-200 text-base"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1
            text-text-secondary-light dark:text-text-secondary-dark"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <input
        type={showPassword ? "text" : "password"}
        placeholder="Confirmar nova senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={6}
        className="w-full h-14 px-5 rounded-3xl
          bg-surface-light dark:bg-surface-dark
          text-text-primary-light dark:text-text-primary-dark
          placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50
          border border-black/5 dark:border-white/5
          focus:border-primary/30
          transition-all duration-200 text-base"
      />

      {error && (
        <p className="text-sm text-red-500 text-center animate-fade-in">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 rounded-full
          bg-primary text-white font-semibold text-base
          shadow-lg shadow-primary/25
          active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Redefinir senha"
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-primary shadow-lg shadow-primary/30 mb-1">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Redefinir senha
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Crie uma nova senha para sua conta
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}