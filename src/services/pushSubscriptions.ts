import { db } from "@/lib/db";

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function saveSubscription(
  userId: string,
  subscription: PushSubscriptionData
): Promise<void> {
  await db.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET
       user_id = $1, p256dh = $3, auth = $4`,
    [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
  );
}

export async function getSubscriptionsByUser(
  userId: string
): Promise<PushSubscriptionData[]> {
  const result = await db.query(
    `SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1`,
    [userId]
  );

  return result.rows.map((row) => ({
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  }));
}

export async function removeSubscription(endpoint: string): Promise<void> {
  await db.query(`DELETE FROM push_subscriptions WHERE endpoint = $1`, [
    endpoint,
  ]);
}