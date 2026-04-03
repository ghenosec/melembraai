"use client";

import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, X } from "lucide-react";

export function NotificationBanner() {
  const { supported, permission, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!supported || permission === "granted" || permission === "denied" || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    await subscribe();
    setLoading(false);
  };

  return (
    <div className="mx-6 mb-4 p-4 rounded-3xl bg-primary/10 dark:bg-primary/20 flex items-center gap-3 animate-slide-up">
      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
        <Bell className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          Ativar notificações?
        </p>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
          Receba alertas quando seus lembretes estiverem chegando
        </p>
      </div>
      <button
        onClick={handleEnable}
        disabled={loading}
        className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold
          active:scale-95 transition-all shrink-0"
      >
        {loading ? "..." : "Ativar"}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-text-secondary-light dark:text-text-secondary-dark shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}