import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { abacate } from "@/services/abacatepay";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

    const user = await db.query(`SELECT name, email FROM users WHERE id = $1`, [
      session.user.id,
    ]);

    const { name, email } = user.rows[0];

    const checkout = await abacate.billing.create({
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [
        {
          externalId: "pro-plan-monthly",
          name: "meLembraAI Pro — Mensal",
          quantity: 1,
          price: 990,
        },
      ],
      returnUrl: `${baseUrl}/settings`,
      completionUrl: `${baseUrl}/api/subscription/success?userId=${session.user.id}`,
      customer: {
        email,
      },
    });

    return NextResponse.json({
      success: true,
      url: checkout.data.url,
    });
  } catch (error) {
    console.error("[melembraai] Erro ao criar checkout:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar pagamento" },
      { status: 500 }
    );
  }
}