"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { VoiceReminderButton } from "@/components/VoiceReminderButton";
import { ReminderCard } from "@/components/ReminderCard";
import { BottomNav } from "@/components/BottomNav";

interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string | null;
  notes: string | null;
  completed: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

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
        setReminders(
          data.reminders.filter((r: Reminder) => !r.completed).slice(0, 5)
        );
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

  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = setInterval(fetchReminders, 5000);
    return () => clearInterval(interval);
  }, [status, fetchReminders]);

  const handleComplete = async (id: string) => {
    try {
      await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setReminders((prev) => prev.filter((r) => r.id !== id));
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const firstName = session?.user?.name?.split(" ")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 safe-top">
      <header className="px-6 pt-14 pb-4">
        <h1 className="text-[32px] font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          {getGreeting()},{" "}
          <span className="text-primary">{firstName}</span>
        </h1>
      </header>
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <VoiceReminderButton />
      </section>
      <section className="px-6">
        {reminders.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                Próximos lembretes
              </h2>
              <button
                onClick={() => router.push("/reminders")}
                className="text-sm font-medium text-primary active:opacity-70 transition-opacity"
              >
                Ver todos
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {reminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  {...reminder}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}

        {!loading && reminders.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Nenhum lembrete ainda.
            </p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
              Segure o botão e fale para criar o primeiro!
            </p>
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
}
