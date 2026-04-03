import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const { checkAndSendNotifications } = await import("@/services/notifications");
    const sent = await checkAndSendNotifications();
    return NextResponse.json({
      success: true,
      notificationsSent: sent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[meLembraAI] Erro no cron:", error);
    return NextResponse.json(
      { error: "Erro ao processar notificações" },
      { status: 500 }
    );
  }
}