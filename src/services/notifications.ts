import webpush from "web-push";
import { db } from "@/lib/db";
import {
  getSubscriptionsByUser,
  removeSubscription,
} from "./pushSubscriptions";

webpush.setVapidDetails(
  "mailto:melembraaisuporte@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function checkAndSendNotifications(): Promise<number> {
  const result = await db.query(
    `SELECT id, user_id, title, date, time
     FROM reminders
     WHERE completed = FALSE
       AND notified = FALSE
       AND time IS NOT NULL
       AND (date + time) <= (NOW() AT TIME ZONE 'America/Sao_Paulo' + INTERVAL '5 minutes')
       AND (date + time) >= (NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '10 minutes')`,
    []
  );

  const reminders = result.rows;
  let sent = 0;

  for (const reminder of reminders) {
    const subscriptions = await getSubscriptionsByUser(reminder.user_id);

    const payload = JSON.stringify({
      title: "🔔 meLembraAI",
      body: reminder.title,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      tag: reminder.id,
      data: {
        url: "/reminders",
        reminderId: reminder.id,
      },
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload
        );
        sent++;
      } catch (error: any) {
        console.error("[meLembraAI] Push error:", error.statusCode);
        if (error.statusCode === 410 || error.statusCode === 404) {
          await removeSubscription(sub.endpoint);
        }
      }
    }

    await db.query(`UPDATE reminders SET notified = TRUE WHERE id = $1`, [
      reminder.id,
    ]);
  }

  return sent;
}