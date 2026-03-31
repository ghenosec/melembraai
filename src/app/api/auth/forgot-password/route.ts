import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/services/users";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Informe seu email" },
        { status: 400 }
      );
    }

    const result = await createPasswordResetToken(email.trim());

    if (result) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${result.token}`;

      console.log("========================================");
      console.log("[meLembrAI] LINK DE RESET DE SENHA:");
      console.log(resetUrl);
      console.log("========================================");
    }

    return NextResponse.json({
      success: true,
      message: "Se o email existir, enviaremos um link de recuperação.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao processar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}