"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setSent(true);
      }
    } catch {
      setError("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-primary shadow-lg shadow-primary/30 mb-1">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Esqueceu a senha?
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Informe seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mx-auto">
              <Mail className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              Email enviado!
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Se o email estiver cadastrado, você receberá um link de recuperação.
              Verifique também a caixa de spam.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm
                active:scale-95 transition-all"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
                "Enviar link de recuperação"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}