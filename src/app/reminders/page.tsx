"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ReminderCard } from "@/components/ReminderCard";
import { BottomNavBar } from "@/components/BottomNavBar";
import { Loader2 } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string | null;
  notes: string | null;
  completed: boolean;
}

type FilterType = "all" | "today" | "completed";

export default function RemindersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      if (data.reminders) {
        setReminders(data.reminders);
      }
    } catch (err) {
      console.error("Error fetching reminders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchReminders();
    }
  }, [status, fetchReminders]);

  const handleComplete = async (id: string) => {
    try {
      await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completed: true } : r))
      );
    } catch (err) {
      console.error("Error completing reminder:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/reminders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredReminders = reminders.filter((r) => {
    if (filter === "today") return r.date === todayStr && !r.completed;
    if (filter === "completed") return r.completed;
    return !r.completed;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "today", label: "Hoje" },
    { key: "completed", label: "Concluídos" },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 safe-top">
      <header className="px-6 pt-14 pb-2">
        <h1 className="text-[28px] font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Seus lembretes
        </h1>
      </header>
      <div className="px-6 py-4">
        <div className="flex gap-2">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                px-5 py-2.5 rounded-full text-sm font-semibold
                transition-all duration-200 active:scale-95
                ${
                  filter === key
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <section className="px-6">
        {filteredReminders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                {...reminder}
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              {filter === "today"
                ? "Nenhum lembrete para hoje"
                : filter === "completed"
                ? "Nenhum lembrete concluído"
                : "Nenhum lembrete pendente"}
            </p>
          </div>
        )}
      </section>

      <BottomNavBar />
    </div>
  );
}
