import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ReminderExtraction {
  title: string;
  date: string;
  time: string;
  notes: string;
}

function getNowBR(): Date {
  const now = new Date();
  const brString = now.toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });
  return new Date(brString);
}

function formatISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTodayBR(): string {
  return formatISO(getNowBR());
}

function getTomorrowBR(): string {
  const d = getNowBR();
  d.setDate(d.getDate() + 1);
  return formatISO(d);
}

function getDayAfterBR(): string {
  const d = getNowBR();
  d.setDate(d.getDate() + 2);
  return formatISO(d);
}

function getNextWeekMondayBR(): string {
  const d = getNowBR();
  const day = d.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  return formatISO(d);
}

function fixTranscription(text: string): string {
  let fixed = text.trim();

  fixed = fixed.replace(
    /\b(?<!(da |de |pela |a ))manhã\b(?!\s+(de|da|pela))/gi,
    "amanhã"
  );

  fixed = fixed.replace(/depois de manhã/gi, "depois de amanhã");

  return fixed;
}

export async function transcribeAudio(audioFile: File): Promise<string> {
  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-large-v3",
    language: "pt",
    response_format: "json",
  });

  return transcription.text;
}

export async function extractReminderFromText(
  transcript: string
): Promise<ReminderExtraction> {
  const lowerTranscript = transcript.toLowerCase().trim();

  const junkPhrases = [
    "e aí",
    "e ai",
    "obrigado",
    "tchau",
    "legendas pela comunidade",
    "inscreva-se",
    "subtítulos",
    "thank you",
    "you",
    "bye",
    "...",
    "",
    "música",
    "musica",
    "♪",
    "la la la",
    "hum",
    "hmm",
    "ah",
    "oh",
    "uh",
    "aham",
  ];

  const isExactJunk = junkPhrases.some((j) => lowerTranscript === j);
  const isTooShort = lowerTranscript.replace(/[^a-záàâãéèêíïóôõúç]/gi, "").length < 5;

  const reminderSignals = [
    "lembrar", "lembrete", "ligar", "pagar", "comprar", "enviar", "mandar",
    "fazer", "ir", "buscar", "levar", "pegar", "marcar", "agendar",
    "reunião", "consulta", "dentista", "médico", "academia", "treino",
    "amanhã", "hoje", "segunda", "terça", "quarta", "quinta", "sexta",
    "sábado", "domingo", "semana", "manhã", "tarde", "noite",
    "hora", "horas", "meio-dia", "meia",
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    "dia", "às", "as", "no", "na", "pro", "pra", "para",
  ];

  const hasReminderSignal = reminderSignals.some((s) =>
    lowerTranscript.includes(s)
  );

  if (isExactJunk || isTooShort) {
    console.warn("[meLembrAI] Transcrição rejeitada (junk/curta):", transcript);
    throw new Error("Não consegui entender o que você disse. Tente novamente.");
  }

  if (!hasReminderSignal) {
    console.warn("[meLembrAI] Transcrição sem sinal de lembrete:", transcript);
    throw new Error(
      "Não parece ser um lembrete. Tente algo como: \"dentista amanhã às 14h\""
    );
  }

  const isJunk =
    junkPhrases.some((j) => lowerTranscript === j) ||
    lowerTranscript.length < 4;

  if (isJunk) {
    console.warn("[meLembrAI] Transcrição parece alucinação:", transcript);
    throw new Error("Não consegui entender o que você disse. Tente novamente.");
  }

  const nowBR = getNowBR();
  const isoDate = getTodayBR();

  const weekday = nowBR.toLocaleDateString("pt-BR", { weekday: "long" });
  const fullDate = nowBR.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fixedTranscript = fixTranscription(transcript);

  const prompt = `Você é um assistente que extrai lembretes de frases em português brasileiro.

HOJE é ${weekday}, ${fullDate} (${isoDate}).

REGRAS OBRIGATÓRIAS:
- "hoje" = ${isoDate}
- "amanhã" = ${getTomorrowBR()}
- "depois de amanhã" = ${getDayAfterBR()}
- "segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo" = calcule a próxima ocorrência a partir de hoje ${isoDate}
- "próxima semana" = ${getNextWeekMondayBR()}
- "daqui X dias" = some X dias a partir de ${isoDate}
- Se o usuário falar uma data como "dia 23 de abril" ou "23/04", use o ano ${nowBR.getFullYear()}
- Se o usuário falar "2 da tarde" = 14:00, "3 da tarde" = 15:00, "8 da manhã" = 08:00, "10 da noite" = 22:00
- Se não houver horário, use "09:00" como padrão
- Se não houver data clara, use a data de hoje: ${isoDate}
- O campo "date" DEVE SEMPRE estar no formato YYYY-MM-DD
- O campo "time" DEVE SEMPRE estar no formato HH:mm (24h)

Responda APENAS com JSON válido. Sem markdown. Sem explicação. Sem texto antes ou depois.

Formato exato:
{"title":"","date":"YYYY-MM-DD","time":"HH:mm","notes":""}

Frase do usuário: "${fixedTranscript}"`;

  console.log("[meLembrAI] Hoje BR:", isoDate, "| Amanhã:", getTomorrowBR());
  console.log("[meLembrAI] Transcript original:", transcript);
  console.log("[meLembrAI] Transcript corrigido:", fixedTranscript);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "Responda SOMENTE com JSON válido. Nenhum texto extra. Nenhum markdown. Nenhum ```.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0,
    max_tokens: 200,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  console.log("[meLembrAI] Resposta bruta do Groq:", content);

  if (!content) {
    throw new Error("Resposta vazia da IA");
  }

  const cleaned = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/^[^{]*/, "")
    .replace(/[^}]*$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as ReminderExtraction;

    if (!parsed.date || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
      console.warn("[meLembrAI] Data inválida, usando hoje:", parsed.date);
      parsed.date = isoDate;
    }

    if (!parsed.time || !/^\d{2}:\d{2}$/.test(parsed.time)) {
      console.warn("[meLembrAI] Horário inválido, usando 09:00:", parsed.time);
      parsed.time = "09:00";
    }

    if (!parsed.title) {
      parsed.title = transcript;
    }

    if (!parsed.notes) {
      parsed.notes = "";
    }

    console.log("[meLembrAI] Lembrete extraído:", parsed);
    return parsed;
  } catch (e) {
    console.error("[meLembrAI] Falha no parse:", cleaned);
    throw new Error(`Falha ao parsear resposta da IA: ${cleaned}`);
  }
}