"use client";

import { useRef, useCallback } from "react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { Mic, Loader2, Check, AlertCircle } from "lucide-react";

function formatReminderDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";

  try {
    const cleaned = String(dateStr).split("T")[0];
    const [year, month, day] = cleaned.split("-").map(Number);

    if (!year || !month || !day) return dateStr;

    const date = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return "hoje";
    if (date.getTime() === tomorrow.getTime()) return "amanhã";

    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return String(dateStr);
  }
}

function formatReminderTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";

  const parts = String(timeStr).split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return String(timeStr);
}

export function VoiceReminderButton() {
  const {
    state,
    elapsedTime,
    result,
    errorMessage,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const startXRef = useRef<number>(0);
  const isCancelledRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      startXRef.current = e.clientX;
      isCancelledRef.current = false;

      if (state === "idle") {
        startRecording();
      }
    },
    [state, startRecording]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (!isCancelledRef.current && state === "recording") {
        stopRecording();
      }
    },
    [state, stopRecording]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (state !== "recording") return;

      const deltaX = startXRef.current - e.clientX;
      if (deltaX > 100) {
        isCancelledRef.current = true;
        cancelRecording();
      }
    },
    [state, cancelRecording]
  );

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <div className="relative">
        {state === "recording" && (
          <>
            <div className="absolute inset-0 -m-4 rounded-full bg-primary/20 animate-pulse-recording" />
            <div className="absolute inset-0 -m-8 rounded-full bg-primary/10 animate-pulse-recording [animation-delay:0.5s]" />
          </>
        )}

        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onContextMenu={(e) => e.preventDefault()}
          disabled={state === "processing" || state === "success"}
          className={`
            relative z-10 rounded-full flex items-center justify-center
            transition-all duration-200 ease-out touch-none
            ${state === "idle" ? "w-28 h-28 bg-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-95" : ""}
            ${state === "recording" ? "w-32 h-32 bg-primary animate-glow scale-105" : ""}
            ${state === "processing" ? "w-28 h-28 bg-primary/80 cursor-wait" : ""}
            ${state === "success" ? "w-28 h-28 bg-emerald-500 shadow-lg shadow-emerald-500/30" : ""}
            ${state === "error" ? "w-28 h-28 bg-red-500/90 shadow-lg shadow-red-500/20" : ""}
          `}
          style={{ WebkitTouchCallout: "none" }}
        >
          {state === "idle" && <Mic className="w-10 h-10 text-white" />}
          {state === "recording" && (
            <div className="flex flex-col items-center gap-1">
              <Mic className="w-10 h-10 text-white animate-pulse" />
              <span className="text-white/90 text-xs font-medium tabular-nums">
                {formatElapsed(elapsedTime)}
              </span>
            </div>
          )}
          {state === "processing" && (
            <Loader2 className="w-10 h-10 text-white animate-spin-slow" />
          )}
          {state === "success" && (
            <Check className="w-10 h-10 text-white animate-scale-in" />
          )}
          {state === "error" && (
            <AlertCircle className="w-10 h-10 text-white animate-scale-in" />
          )}
        </button>
      </div>

      <div className="text-center min-h-[72px] flex flex-col items-center justify-start">
        {state === "idle" && (
          <div className="animate-fade-in">
            <p className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              Segure para falar
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Fale naturalmente o lembrete
            </p>
          </div>
        )}

        {state === "recording" && (
          <div className="animate-fade-in">
            <p className="text-lg font-semibold text-primary">
              Solte para criar o lembrete
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 flex items-center gap-1">
              <span className="inline-block">←</span> deslize para cancelar
            </p>
          </div>
        )}

        {state === "processing" && (
          <div className="animate-fade-in">
            <p className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              Processando seu lembrete...
            </p>
          </div>
        )}

        {state === "success" && result && (
          <div className="animate-slide-up">
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              ✔ Lembrete criado
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {result.title}
              {result.time ? ` às ${formatReminderTime(result.time)}` : ""}
              {result.date ? ` — ${formatReminderDate(result.date)}` : ""}
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="animate-slide-up">
            <p className="text-base font-medium text-red-500 dark:text-red-400 max-w-[280px]">
              {errorMessage || "Não foi possível entender o lembrete. Tente novamente."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}