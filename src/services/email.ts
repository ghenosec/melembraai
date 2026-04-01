import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetUrl: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: "meLembrAI <onboarding@resend.dev>",
      to,
      subject: "Redefinir sua senha — meLembrAI",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #FF7A00; border-radius: 16px; padding: 12px 16px;">
              <span style="color: white; font-size: 20px; font-weight: bold;">🎙️ meLembrAI</span>
            </div>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px;">
            Olá, ${userName}!
          </h1>

          <p style="font-size: 15px; color: #666666; line-height: 1.6; margin-bottom: 24px;">
            Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #FF7A00; color: white; font-size: 16px; font-weight: 600;
                      text-decoration: none; padding: 14px 40px; border-radius: 50px;">
              Redefinir minha senha
            </a>
          </div>

          <p style="font-size: 13px; color: #999999; line-height: 1.5; margin-top: 32px;">
            Este link expira em <strong>1 hora</strong>. Se você não solicitou essa alteração, ignore este email.
          </p>

          <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 32px 0;" />

          <p style="font-size: 12px; color: #BBBBBB; text-align: center;">
            meLembrAI — Nunca esqueça o que acabou de lembrar
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[meLembrAI] Erro ao enviar email:", error);
      return false;
    }

    console.log("[meLembrAI] Email de reset enviado para:", to);
    return true;
  } catch (error) {
    console.error("[meLembrAI] Erro ao enviar email:", error);
    return false;
  }
}