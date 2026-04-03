"use client";

import { useState } from "react";
import { X, Loader2, Crown } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

export function CheckoutModal({ isOpen, onClose, userEmail }: CheckoutModalProps) {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const cpfNumbers = cpf.replace(/\D/g, "");
  const phoneNumbers = phone.replace(/\D/g, "");
  const isValid = name.trim().length >= 3 && cpfNumbers.length === 11 && phoneNumbers.length >= 10;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerCpf: cpfNumbers,
          customerPhone: phoneNumbers,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Erro ao iniciar pagamento. Tente novamente.");
      }
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-background-light dark:bg-background-dark rounded-3xl shadow-2xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                Assinar Pro
              </h2>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                R$9,90/mês — cancele quando quiser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
            Preencha seus dados para o pagamento:
          </p>

          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-13 px-4 rounded-2xl
              bg-surface-light dark:bg-surface-dark
              text-text-primary-light dark:text-text-primary-dark
              placeholder:text-text-secondary-light/40 dark:placeholder:text-text-secondary-dark/40
              border border-black/5 dark:border-white/5
              focus:border-primary/30
              transition-all duration-200 text-[15px]"
          />

          <input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            inputMode="numeric"
            className="w-full h-13 px-4 rounded-2xl
              bg-surface-light dark:bg-surface-dark
              text-text-primary-light dark:text-text-primary-dark
              placeholder:text-text-secondary-light/40 dark:placeholder:text-text-secondary-dark/40
              border border-black/5 dark:border-white/5
              focus:border-primary/30
              transition-all duration-200 text-[15px]"
          />

          <input
            type="text"
            placeholder="Telefone com DDD"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            inputMode="numeric"
            className="w-full h-13 px-4 rounded-2xl
              bg-surface-light dark:bg-surface-dark
              text-text-primary-light dark:text-text-primary-dark
              placeholder:text-text-secondary-light/40 dark:placeholder:text-text-secondary-dark/40
              border border-black/5 dark:border-white/5
              focus:border-primary/30
              transition-all duration-200 text-[15px]"
          />

          <div className="px-1 py-1">
            <p className="text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60">
              Email: {userEmail}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center animate-fade-in">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full h-14 rounded-full
              bg-primary text-white font-semibold text-base
              shadow-lg shadow-primary/25
              active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Ir para pagamento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}