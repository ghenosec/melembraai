import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  provider: string;
  created_at: string;
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const existing = await db.query(`SELECT id FROM users WHERE email = $1`, [
    email.toLowerCase(),
  ]);

  if (existing.rows.length > 0) {
    throw new Error("Este email já está cadastrado");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, provider)
     VALUES ($1, $2, $3, 'credentials')
     RETURNING *`,
    [name, email.toLowerCase(), passwordHash]
  );

  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
    email.toLowerCase(),
  ]);

  return result.rows[0] || null;
}

export async function findOrCreateGoogleUser(
  email: string,
  name: string
): Promise<User> {
  const existing = await db.query(`SELECT * FROM users WHERE email = $1`, [
    email.toLowerCase(),
  ]);

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const result = await db.query(
    `INSERT INTO users (name, email, provider)
     VALUES ($1, $2, 'google')
     RETURNING *`,
    [name, email.toLowerCase()]
  );

  return result.rows[0];
}

export async function verifyPassword(
  user: User,
  password: string
): Promise<boolean> {
  if (!user.password_hash) return false;
  return bcrypt.compare(password, user.password_hash);
}

export async function createPasswordResetToken(
  email: string
): Promise<{ token: string; userName: string } | null> {
  const user = await findUserByEmail(email);

  if (!user) return null;

  if (user.provider === "google" && !user.password_hash) {
    throw new Error(
      "Esta conta usa login com Google. Use o botão 'Entrar com Google'."
    );
  }

  await db.query(
    `UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE`,
    [user.id]
  );

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.query(
    `INSERT INTO password_resets (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, token, expiresAt]
  );

  return { token, userName: user.name };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<boolean> {
  const result = await db.query(
    `SELECT pr.*, u.id as uid
     FROM password_resets pr
     JOIN users u ON u.id = pr.user_id
     WHERE pr.token = $1 AND pr.used = FALSE AND pr.expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) return false;

  const reset = result.rows[0];
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
    passwordHash,
    reset.uid,
  ]);

  await db.query(`UPDATE password_resets SET used = TRUE WHERE id = $1`, [
    reset.id,
  ]);

  return true;
}