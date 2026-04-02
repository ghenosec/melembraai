import { NextRequest, NextResponse } from "next/server";
import { activateProPlan } from "@/services/subscription";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.redirect(new URL("/settings", request.url));
  }

  try {
    await activateProPlan(userId, `manual-${Date.now()}`);
  } catch (error) {
    console.error("[meLembraAI] Erro ao ativar plano:", error);
  }

  const baseUrl =
    process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  return NextResponse.redirect(`${baseUrl}/settings?upgraded=true`);
}