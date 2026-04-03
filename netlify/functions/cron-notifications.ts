import type { Handler, HandlerEvent } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent) => {
  const baseUrl = process.env.NEXTAUTH_URL || "https://melembraai.netlify.app";
  const cronSecret = process.env.CRON_SECRET || "";

  try {
    const response = await fetch(`${baseUrl}/api/cron/notifications`, {
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    return { statusCode: 500, body: "Erro no cron" };
  }
};

export { handler };