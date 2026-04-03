import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveSubscription } from "@/services/pushSubscriptions";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const subscription = await request.json();
    await saveSubscription(session.user.id, subscription);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[meLembraAI] Erro ao salvar subscription:", error);
    return NextResponse.json(
      { error: "Erro ao registrar notificações" },
      { status: 500 }
    );
  }
}