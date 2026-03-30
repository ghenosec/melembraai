import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getRemindersByUser,
  completeReminder,
  deleteReminder,
} from "@/services/reminders";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const reminders = await getRemindersByUser(session.user.id);
    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lembretes" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await request.json();
    const reminder = await completeReminder(id);
    return NextResponse.json({ reminder });
  } catch (error) {
    console.error("Error completing reminder:", error);
    return NextResponse.json(
      { error: "Erro ao concluir lembrete" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await request.json();
    await deleteReminder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json(
      { error: "Erro ao excluir lembrete" },
      { status: 500 }
    );
  }
}
