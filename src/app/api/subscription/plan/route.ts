import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserPlan } from "@/services/subscription";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const plan = await getUserPlan(session.user.id);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("[meLembraAI] Erro ao buscar plano:", error);
    return NextResponse.json(
      { error: "Erro ao buscar plano" },
      { status: 500 }
    );
  }
}