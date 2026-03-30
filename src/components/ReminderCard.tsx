"use client";

import { Check, Trash2, Clock, Calendar } from "lucide-react";

interface ReminderCardProps {
  id: string;
  title: string;
  date: string;
  time: string | null;
  notes: string | null;
  completed: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";

  try {
    const cleaned = String(dateStr).split("T")[0];
    const [year, month, day] = cleaned.split("-").map(Number);

    if (!year || !month || !day) return String(dateStr);

    const date = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return "Hoje";
    if (date.getTime() === tomorrow.getTime()) return "Amanhã";

    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return String(dateStr);
  }
}

function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";

  const parts = String(timeStr).split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return String(timeStr);
}

export function ReminderCard({
  id,
  title,
  date,
  time,
  notes,
  completed,
  onComplete,
  onDelete,
}: ReminderCardProps) {
  return (
    <div
      className={`
        group relative bg-surface-light dark:bg-surface-dark
        rounded-3xl p-5 
        shadow-sm hover:shadow-md
        transition-all duration-200 ease-out
        active:scale-[0.98]
        ${completed ? "opacity-60" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className={`
              text-base font-semibold text-text-primary-light dark:text-text-primary-dark
              ${completed ? "line-through" : ""}
            `}
          >
            {title}
          </h3>

          <div className="flex items-center gap-3 mt-2">
            {date && (
              <span className="flex items-center gap-1.5 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(date)}
              </span>
            )}
            {time && (
              <span className="flex items-center gap-1.5 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(time)}
              </span>
            )}
          </div>

          {notes && (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2 line-clamp-2">
              {notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!completed && (
            <button
              onClick={() => onComplete(id)}
              className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
                hover:bg-emerald-500/20 active:scale-90
                transition-all duration-150"
              title="Concluir"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(id)}
            className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 dark:text-red-400
              hover:bg-red-500/20 active:scale-90
              transition-all duration-150"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}