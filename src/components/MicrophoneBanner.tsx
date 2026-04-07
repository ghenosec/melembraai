"use client";

import { useEffect, useState } from "react";
import { Mic, X } from "lucide-react";

export function MicrophoneBanner() {
  const [permission, setPermission] = useState<PermissionState | "unknown">("unknown");
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!navigator.permissions || !navigator.mediaDevices) return;

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((result) => {
        setPermission(result.state);
        result.onchange = () => setPermission(result.state);
      })
      .catch(() => setPermission("unknown"));
  }, []);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermission("granted");
    } catch {
      setPermission("denied");
    } finally {
      setLoading(false);
    }
  };

  if (permission === "granted" || permission === "unknown" || dismissed) {
    return null;
  }

  return (
    <div className="mx-6 mb-4 p-4 rounded-3xl bg-primary/10 dark:bg-primary/20 flex items-center gap-3 animate-slide-up">
      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
        <Mic className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          {permission === "denied"
            ? "Microfone bloqueado"
            : "Permitir microfone?"}
        </p>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
          {permission === "denied"
            ? "Ative nas configurações do navegador para criar lembretes por voz"
            : "Necessário para criar lembretes por voz"}
        </p>
      </div>
      {permission !== "denied" && (
        <button
          onClick={handleRequest}
          disabled={loading}
          className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold
            active:scale-95 transition-all shrink-0 disabled:opacity-60"
        >
          {loading ? "..." : "Permitir"}
        </button>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-text-secondary-light dark:text-text-secondary-dark shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}