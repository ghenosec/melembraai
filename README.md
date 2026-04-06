# 🎙️ meLembraAI

**Nunca esqueça o que acabou de lembrar.**

App PWA onde você segura um botão, fala naturalmente, e a IA cria o lembrete automaticamente. Plano gratuito com 10 áudios por mês e plano Pro ilimitado por R$9,90/mês.

🔗 **Acesse:** [melembraai.netlify.app](https://melembraai.netlify.app)

---

## Stack

- **Framework:** Next.js 15 + App Router
- **Linguagem:** TypeScript
- **Estilo:** TailwindCSS
- **Banco:** Neon PostgreSQL (SQL puro com `pg`)
- **Auth:** Auth.js v5 (Google + Credentials com bcrypt)
- **Speech-to-Text:** Groq Whisper
- **NLP:** Groq Llama 3.3 70B
- **Pagamentos:** AbacatePay (PIX)
- **Email:** Nodemailer + Gmail SMTP
- **Push Notifications:** Web Push API + VAPID
- **PWA:** Service Worker manual
- **Deploy:** Netlify

---

## Funcionalidades

- 🎙️ **Lembretes por voz** - segure o botão, fale naturalmente, lembrete criado
- 🧠 **IA inteligente** - entende datas relativas ("amanhã", "sexta", "daqui 2 dias")
- 🔇 **Detecção de silêncio** - filtra ruído ambiente e rejeita áudios sem voz
- 🌗 **Dark/Light mode** - detecta preferência do sistema automaticamente
- 📱 **PWA instalável** - funciona como app nativo no iPhone, Android e desktop
- 🔐 **Autenticação completa** - registro, login, recuperação de senha por email
- 💳 **Assinatura SaaS** - plano free (10 áudios/mês) e Pro (ilimitado) via PIX
- 📊 **Dashboard de plano** - barra de progresso de uso e dias restantes da assinatura

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts     # Auth.js handler
│   │   │   ├── register/route.ts          # Cadastro de conta
│   │   │   ├── forgot-password/route.ts   # Solicitar reset
│   │   │   └── reset-password/route.ts    # Redefinir senha
│   │   ├── reminder-from-audio/route.ts   # Voice -> Reminder pipeline
│   │   ├── reminders/route.ts             # CRUD lembretes
│   │   ├── push/subscribe/route.ts        # Registro de push
│   │   ├── cron/notifications/route.ts    # Cron de notificações
│   │   └── subscription/
│   │       ├── checkout/route.ts          # Criar checkout AbacatePay
│   │       ├── success/route.ts           # Callback de pagamento
│   │       ├── webhook/route.ts           # Webhook AbacatePay
│   │       └── plan/route.ts              # Status do plano do usuário
│   ├── login/page.tsx                     # Tela de login
│   ├── register/page.tsx                  # Cadastro
│   ├── forgot-password/page.tsx           # Esqueci a senha
│   ├── reset-password/page.tsx            # Redefinir senha
│   ├── reminders/page.tsx                 # Lista de lembretes
│   ├── settings/page.tsx                  # Plano e configurações
│   ├── layout.tsx                         # Root layout
│   ├── page.tsx                           # Tela principal
│   └── globals.css
├── components/
│   ├── VoiceReminderButton.tsx            # Botão principal de voz
│   ├── ReminderCard.tsx                   # Card de lembrete
│   ├── BottomNavBar.tsx                   # Navegação inferior
│   ├── CheckoutModal.tsx                  # Modal de dados de pagamento
│   ├── NotificationBanner.tsx             # Banner de ativação de push
│   ├── PWAInstall.tsx                     # Banner de instalação PWA
│   ├── ServiceWorkerRegister.tsx          # Registro do SW
│   ├── ThemeProvider.tsx                  # Dark/Light mode
│   └── SessionProvider.tsx                # Auth session
├── hooks/
│   ├── useVoiceRecorder.ts                # Hook de gravação + filtro de voz
│   └── usePushNotifications.ts            # Hook de push notifications
├── services/
│   ├── ai.ts                              # Groq Whisper + Llama
│   ├── reminders.ts                       # CRUD lembretes (SQL puro)
│   ├── users.ts                           # Users + bcrypt + reset tokens
│   ├── email.ts                           # Envio de emails (Nodemailer)
│   ├── subscription.ts                    # Gestão de planos
│   ├── notifications.ts                   # Push notifications (web-push)
│   └── pushSubscriptions.ts               # CRUD de subscriptions
├── lib/
│   └── db.ts                              # Pool Neon PostgreSQL
├── auth.ts                                # Config Auth.js
└── middleware.ts                          # Proteção de rotas
database/
├── migrations/
│   ├── 001_create_reminders.sql
│   ├── 002_create_users.sql
│   ├── 003_create_push_subscriptions.sql
│   └── 004_add_subscriptions.sql
└── migrate.js
public/
├── manifest.json                          # PWA manifest
├── sw.js                                  # Service Worker (cache + push)
└── icons/                                 # Ícones PWA
```

---

## Fluxo de Voz -> Lembrete

- Usuário segura o botão 🎙️
- Filtro de áudio detecta voz humana (85Hz–3000Hz, RMS mínimo)
- MediaRecorder captura áudio (webm/opus)
- Ao soltar, valida se houve voz suficiente
- Envia para /api/reminder-from-audio
- Groq Whisper transcreve o áudio -> texto
- Validação anti-alucinação (junk phrases + sinais de lembrete)
- Llama 3.3 70B extrai título, data, hora -> JSON
- Validação e fallback de campos (timezone América/São Paulo)
- Salva no Neon PostgreSQL
- Incrementa contador mensal do plano free
- Retorna confirmação -> "✔ Lembrete criado"

Tempo total esperado: **< 2 segundos**

---

## Fluxo de Notificações Push

- Usuário ativa notificações no banner
- Service Worker registra subscription no navegador
- Subscription salva no banco vinculada ao user_id
- Cron externo chama /api/cron/notifications a cada minuto
- Query busca lembretes dos próximos 5 minutos não notificados
- web-push envia notificação via VAPID para cada subscription
- Service Worker exibe notificação com ações (Ver / Dispensar)
- Marca lembrete como notificado no banco

---

## Fluxo de Assinatura

Usuário clica em "Assinar Pro" na tela de configurações
Modal coleta nome, CPF e telefone
POST /api/subscription/checkout cria billing no AbacatePay
Redireciona para checkout PIX
Após pagamento, AbacatePay chama webhook (BILLING_PAID)
Webhook ativa plano Pro do usuário no banco
Usuário volta ao app com plano Pro ativo (30 dias)

---

## Planos

| Recurso | Free | Pro (R$9,90/mês) |
|---|---|---|
| Áudios por mês | 10 | Ilimitado |

---

## Licença

MIT