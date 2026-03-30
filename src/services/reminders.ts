import { db } from "@/lib/db";

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  date: string;
  time: string | null;
  completed: boolean;
  created_at: string;
}

export interface CreateReminderInput {
  userId: string;
  title: string;
  notes?: string;
  date: string;
  time?: string;
}

export async function createReminder(
  input: CreateReminderInput
): Promise<Reminder> {
  const { userId, title, notes, date, time } = input;

  const result = await db.query(
    `INSERT INTO reminders (user_id, title, notes, date, time)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, title, notes || null, date, time || null]
  );

  return result.rows[0];
}

export async function getRemindersByUser(userId: string): Promise<Reminder[]> {
  const result = await db.query(
    `SELECT * FROM reminders
     WHERE user_id = $1
     ORDER BY date ASC, time ASC NULLS LAST`,
    [userId]
  );

  return result.rows;
}

export async function getTodayReminders(userId: string): Promise<Reminder[]> {
  const result = await db.query(
    `SELECT * FROM reminders
     WHERE user_id = $1 AND date = CURRENT_DATE AND completed = FALSE
     ORDER BY time ASC NULLS LAST`,
    [userId]
  );

  return result.rows;
}

export async function getRecentReminders(
  userId: string,
  limit: number = 5
): Promise<Reminder[]> {
  const result = await db.query(
    `SELECT * FROM reminders
     WHERE user_id = $1 AND completed = FALSE
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows;
}

export async function completeReminder(id: string): Promise<Reminder> {
  const result = await db.query(
    `UPDATE reminders SET completed = TRUE WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Lembrete não encontrado");
  }

  return result.rows[0];
}

export async function deleteReminder(id: string): Promise<void> {
  const result = await db.query(`DELETE FROM reminders WHERE id = $1`, [id]);

  if (result.rowCount === 0) {
    throw new Error("Lembrete não encontrado");
  }
}
