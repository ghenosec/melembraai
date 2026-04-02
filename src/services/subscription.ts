import { db } from "@/lib/db";

const FREE_AUDIO_LIMIT = 10;

export type Plan = "free" | "pro";

export interface UserPlan {
  plan: Plan;
  audioCount: number;
  audioLimit: number;
  canRecord: boolean;
  subscriptionStatus: string;
  expiresAt: string | null;
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const result = await db.query(
    `SELECT plan, audio_count_month, audio_count_reset_at,
            subscription_status, plan_expires_at
     FROM users WHERE id = $1`,
    [userId]
  );

  const user = result.rows[0];
  if (!user) {
    return {
      plan: "free",
      audioCount: 0,
      audioLimit: FREE_AUDIO_LIMIT,
      canRecord: true,
      subscriptionStatus: "inactive",
      expiresAt: null,
    };
  }

  const resetAt = new Date(user.audio_count_reset_at);
  const now = new Date();
  let audioCount = user.audio_count_month || 0;

  if (
    now.getMonth() !== resetAt.getMonth() ||
    now.getFullYear() !== resetAt.getFullYear()
  ) {
    await db.query(
      `UPDATE users SET audio_count_month = 0, audio_count_reset_at = NOW() WHERE id = $1`,
      [userId]
    );
    audioCount = 0;
  }

  const plan: Plan = user.plan || "free";
  const isPro = plan === "pro" && user.subscription_status === "active";

  return {
    plan: isPro ? "pro" : "free",
    audioCount,
    audioLimit: isPro ? Infinity : FREE_AUDIO_LIMIT,
    canRecord: isPro || audioCount < FREE_AUDIO_LIMIT,
    subscriptionStatus: user.subscription_status || "inactive",
    expiresAt: user.plan_expires_at,
  };
}

export async function incrementAudioCount(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);

  if (!plan.canRecord) {
    return false;
  }

  await db.query(
    `UPDATE users SET audio_count_month = audio_count_month + 1 WHERE id = $1`,
    [userId]
  );

  return true;
}

export async function activateProPlan(
  userId: string,
  subscriptionId: string
): Promise<void> {
  await db.query(
    `UPDATE users SET
       plan = 'pro',
       subscription_id = $2,
       subscription_status = 'active',
       plan_expires_at = NOW() + INTERVAL '30 days'
     WHERE id = $1`,
    [userId, subscriptionId]
  );
  console.log("[melembraai] Plano Pro ativado para:", userId);
}

export async function deactivateProPlan(userId: string): Promise<void> {
  await db.query(
    `UPDATE users SET
       plan = 'free',
       subscription_status = 'inactive',
       subscription_id = NULL,
       plan_expires_at = NULL
     WHERE id = $1`,
    [userId]
  );
  console.log("[melembraai] Plano Pro desativado para:", userId);
}