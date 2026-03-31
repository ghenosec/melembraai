export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { transcribeAudio, extractReminderFromText } from "@/services/ai";
import { createReminder } from "@/services/reminders";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo de áudio enviado" },
        { status: 400 }
      );
    }

    const transcript = await transcribeAudio(audioFile);

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Não foi possível entender o áudio. Tente novamente.",
        },
        { status: 422 }
      );
    }

    const reminderData = await extractReminderFromText(transcript);

    const reminder = await createReminder({
      userId: session.user.id,
      title: reminderData.title,
      notes: reminderData.notes || undefined,
      date: reminderData.date,
      time: reminderData.time || undefined,
    });

    return NextResponse.json({
      success: true,
      transcript,
      reminder: {
        id: reminder.id,
        title: reminder.title,
        date: reminder.date,
        time: reminder.time,
        notes: reminder.notes,
      },
    });
  } catch (error) {
    console.error("Error processing audio reminder:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Erro ao processar o lembrete";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
