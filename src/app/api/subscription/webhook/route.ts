import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activateProPlan, deactivateProPlan } from "@/services/subscription";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[melembraai] Webhook recebido:", JSON.stringify(body));

    const event = body.event;
    const billing = body.data;

    if (!billing) {
      return NextResponse.json({ received: true });
    }

    const customerEmail = billing.customer?.email;
    if (!customerEmail) {
      console.log("[melembraai] Webhook sem email de customer");
      return NextResponse.json({ received: true });
    }

    const userResult = await db.query(
      `SELECT id FROM users WHERE email = $1`,
      [customerEmail.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      console.log("[melembraai] User não encontrado para:", customerEmail);
      return NextResponse.json({ received: true });
    }

    const userId = userResult.rows[0].id;

    if (event === "billing.paid" || event === "BILLING_PAID") {
      await activateProPlan(userId, billing.id || `wh-${Date.now()}`);
    }

    if (
      event === "billing.cancelled" ||
      event === "billing.refunded" ||
      event === "BILLING_CANCELLED" ||
      event === "BILLING_REFUNDED"
    ) {
      await deactivateProPlan(userId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[melembraai] Erro no webhook:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}