import { NextRequest, NextResponse } from "next/server";
import { activateProPlan } from "@/services/subscription";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const baseUrl =
    process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";

  if (!userId) {
    return NextResponse.redirect(`${baseUrl}/settings`);
  }

  try {
    await activateProPlan(userId, `manual-${Date.now()}`);
    console.log("[meLembraAI] Plano Pro ativado para:", userId);
  } catch (error) {
    console.error("[meLembraAI] Erro ao ativar plano:", error);
  }

  return NextResponse.redirect(`${baseUrl}/settings?upgraded=true`);
}