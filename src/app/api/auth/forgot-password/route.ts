import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/services/users";
import { sendPasswordResetEmail } from "@/services/email";

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
      const baseUrl =
        process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
      const resetUrl = `${baseUrl}/reset-password?token=${result.token}`;

      await sendPasswordResetEmail(email.trim(), result.userName, resetUrl);
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