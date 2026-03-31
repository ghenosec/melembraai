import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/services/users";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const success = await resetPasswordWithToken(token, password);

    if (!success) {
      return NextResponse.json(
        { error: "Link expirado ou inválido. Solicite um novo." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao redefinir senha" },
      { status: 500 }
    );
  }
}