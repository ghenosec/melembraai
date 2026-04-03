"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { BottomNavBar } from "@/components/BottomNavBar";
import {
  Crown,
  Check,
  Mic,
  Bell,
  Calendar,
  Infinity,
  Loader2,
  Sparkles,
} from "lucide-react";

interface PlanInfo {
  plan: "free" | "pro";
  audioCount: number;
  audioLimit: number;
  canRecord: boolean;
  subscriptionStatus: string;
  expiresAt: string | null;
}

function SettingsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const upgraded = searchParams.get("upgraded") === "true";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/subscription/plan")
        .then((r) => r.json())
        .then((data) => setPlan(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/subscription/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro ao iniciar pagamento. Tente novamente.");
      }
    } catch {
      alert("Erro ao iniciar pagamento.");
    } finally {
      setUpgrading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const isPro = plan?.plan === "pro";

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 safe-top">
      <header className="px-6 pt-14 pb-6">
        <h1 className="text-[28px] font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Configurações
        </h1>
      </header>

      {upgraded && (
        <div className="mx-6 mb-4 p-4 rounded-3xl bg-emerald-500/10 animate-slide-up">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Parabéns! Seu plano Pro está ativo!
          </p>
        </div>
      )}

      <section className="px-6 mb-6">
        <div className="p-5 rounded-3xl bg-surface-light dark:bg-surface-dark">
          <div className="flex items-center gap-3 mb-3">
            {isPro ? (
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gray-500/10 flex items-center justify-center">
                <Mic className="w-5 h-5 text-gray-500" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                Plano {isPro ? "Pro" : "Gratuito"}
              </h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {isPro
                  ? "Lembretes ilimitados"
                  : `${plan?.audioCount || 0}/10 áudios usados este mês`}
              </p>
            </div>
          </div>

          {!isPro && plan && (
            <div className="mt-3">
              <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min((plan.audioCount / 10) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {!isPro && (
        <section className="px-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
            Upgrade para o Pro
          </h3>

          <div className="p-6 rounded-3xl border-2 border-primary bg-primary/5 dark:bg-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  Pro
                </h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-primary">R$9</span>
                  <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    /mês
                  </span>
                </div>
              </div>
              <Crown className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-3 mb-6">
              {[
                { icon: Infinity, text: "Áudios ilimitados" },
                { icon: Sparkles, text: "Lembretes inteligentes" },
                { icon: Calendar, text: "Integração com calendário" },
                { icon: Bell, text: "Notificações push" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full h-14 rounded-full
                bg-primary text-white font-semibold text-base
                shadow-lg shadow-primary/25
                active:scale-[0.98]
                disabled:opacity-60
                transition-all duration-200
                flex items-center justify-center gap-2"
            >
              {upgrading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Assinar Pro — R$9/mês
                </>
              )}
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-surface-light dark:bg-surface-dark mt-3">
            <h4 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
              Plano Gratuito
            </h4>
            <div className="space-y-2">
              {[
                "10 áudios por mês",
                "Notificações push",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <Check className="w-3.5 h-3.5 text-text-secondary-light dark:text-text-secondary-dark" />
                  <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6">
        <div className="p-5 rounded-3xl bg-surface-light dark:bg-surface-dark">
          <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            Conta
          </h3>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {session?.user?.email}
          </p>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {session?.user?.name}
          </p>
        </div>
      </section>

      <BottomNavBar />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}