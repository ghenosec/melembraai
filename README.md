# 🎙️ meLembrAI

**Nunca esqueça o que acabou de lembrar.**

App PWA mobile-first onde você segura um botão, fala naturalmente, e a IA cria o lembrete automaticamente.

---

## Stack

- **Framework:** Next.js 15 + App Router
- **Linguagem:** TypeScript
- **Estilo:** TailwindCSS
- **Banco:** Neon PostgreSQL (SQL puro com `pg`)
- **Auth:** Auth.js v5 (Google + Credentials)
- **Speech-to-Text:** Groq Whisper
- **NLP:** OpenAI GPT-4.1-mini
- **PWA:** next-pwa
- **Deploy:** Vercel


---


## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # Auth endpoints
│   │   ├── reminder-from-audio/route.ts   # Voice → Reminder pipeline
│   │   └── reminders/route.ts             # CRUD lembretes
│   ├── login/page.tsx                     # Tela de login
│   ├── reminders/page.tsx                 # Lista de lembretes
│   ├── layout.tsx                         # Root layout
│   ├── page.tsx                           # Tela principal
│   └── globals.css
├── components/
│   ├── VoiceReminderButton.tsx            # Botão principal de voz
│   ├── ReminderCard.tsx                   # Card de lembrete
│   ├── BottomNav.tsx                      # Navegação inferior
│   ├── ThemeProvider.tsx                  # Dark/Light mode
│   └── SessionProvider.tsx                # Auth session
├── hooks/
│   └── useVoiceRecorder.ts               # Hook de gravação
├── services/
│   ├── ai.ts                             # Groq Whisper + OpenAI
│   └── reminders.ts                      # CRUD SQL puro
├── lib/
│   └── db.ts                             # Pool Neon PostgreSQL
├── auth.ts                                # Config Auth.js
└── middleware.ts                           # Proteção de rotas

database/
├── migrations/
│   └── 001_create_reminders.sql
└── migrate.js

public/
├── manifest.json
└── icons/
    └── icon.svg
```

---

## Fluxo de Funcionamento

```
1. Usuário segura o botão 🎙️
2. MediaRecorder captura áudio (webm/opus)
3. Ao soltar, envia para /api/reminder-from-audio
4. Groq Whisper transcreve o áudio → texto
5. OpenAI GPT-4.1-mini extrai título, data, hora → JSON
6. Salva no Neon PostgreSQL
7. Retorna confirmação → "✔ Lembrete criado"
```

Tempo total esperado: **< 2 segundos**

---

## Licença

MIT
