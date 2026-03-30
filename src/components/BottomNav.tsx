"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListTodo, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/reminders", icon: ListTodo, label: "Lembretes" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-black/5 dark:border-white/5 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-4 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-2xl
                transition-all duration-200
                ${
                  isActive
                    ? "text-primary"
                    : "text-text-secondary-light dark:text-text-secondary-dark"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-2xl
            transition-all duration-200
            text-text-secondary-light dark:text-text-secondary-dark"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[11px] font-medium">Sair</span>
        </button>
      </div>
    </nav>
  );
}
