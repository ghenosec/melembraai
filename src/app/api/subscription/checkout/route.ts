import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

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

    const { email } = user.rows[0];

    let customerName = email.split("@")[0];
    let customerCpf = "09240529020";
    let customerPhone = "11999999999";

    try {
      const body = await request.json();
      if (body.customerName) customerName = body.customerName;
      if (body.customerCpf) customerCpf = body.customerCpf;
      if (body.customerPhone) customerPhone = body.customerPhone;
    } catch {
    }

    const response = await fetch("https://api.abacatepay.com/v1/billing/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.ABACATEPAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
          name: customerName,
          email: email,
          cellphone: customerPhone,
          taxId: customerCpf,
        },
      }),
    });

    const data = await response.json();
    console.log("[meLembraAI] AbacatePay response:", JSON.stringify(data));

    if (!response.ok || !data.data?.url) {
      console.error("[meLembraAI] AbacatePay error:", data);
      throw new Error(data.error || "Erro ao criar checkout");
    }

    return NextResponse.json({
      success: true,
      url: data.data.url,
    });
  } catch (error) {
    console.error("[meLembraAI] Erro ao criar checkout:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar pagamento" },
      { status: 500 }
    );
  }
}