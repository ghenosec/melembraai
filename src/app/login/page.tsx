"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mic, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha inválidos");
      } else {
        router.push("/");
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-10 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-primary shadow-lg shadow-primary/30 mb-2">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            meLembr<span className="text-primary">AI</span>
          </h1>
          <p className="text-base text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Nunca esqueça o que acabou de lembrar
          </p>
        </div>
        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
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
                transition-all duration-200
                text-base"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-14 px-5 rounded-3xl
                bg-surface-light dark:bg-surface-dark
                text-text-primary-light dark:text-text-primary-dark
                placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50
                border border-black/5 dark:border-white/5
                focus:border-primary/30
                transition-all duration-200
                text-base"
            />
          </div>

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
              hover:shadow-xl hover:shadow-primary/35
              active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Entrar"
            )}
          </button>
        </form>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-black/5 dark:bg-white/10" />
          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest">
            ou
          </span>
          <div className="flex-1 h-px bg-black/5 dark:bg-white/10" />
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full h-14 rounded-full
            bg-surface-light dark:bg-surface-dark
            text-text-primary-light dark:text-text-primary-dark
            font-semibold text-base
            border border-black/5 dark:border-white/10
            hover:bg-black/[0.02] dark:hover:bg-white/[0.02]
            active:scale-[0.98]
            transition-all duration-200
            flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
