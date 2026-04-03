import { NextRequest, NextResponse } from "next/server";
import { checkAndSendNotifications } from "@/services/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

   const isDev = process.env.NODE_ENV === "development";
  if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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