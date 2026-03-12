import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { initDb, sql } from "./db";
import { config } from "./config";

const SESSION_COOKIE = "session_token";
const SESSION_DAYS = 7;

function hashToken(token: string) {
  return crypto
    .createHmac("sha256", config.sessionSecret)
    .update(token)
    .digest("hex");
}

export async function createSession(adminId: number) {
  await initDb();
  const token = nanoid(40);
  const tokenHash = hashToken(token);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO sessions (admin_id, token_hash, expires_at, created_at)
    VALUES (${adminId}, ${tokenHash}, ${expires.toISOString()}, ${now.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearSession() {
  await initDb();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0
  });
}

export async function getSessionAdmin() {
  await initDb();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const { rows } = await sql`
    SELECT sessions.expires_at, admins.id, admins.name, admins.email, admins.role, admins.must_change_password
    FROM sessions
    JOIN admins ON admins.id = sessions.admin_id
    WHERE sessions.token_hash = ${tokenHash}
  `;
  const row = rows[0] as
    | {
        expires_at: string;
        id: number;
        name: string;
        email: string;
        role: string;
        must_change_password: boolean;
      }
    | undefined;

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    mustChangePassword: row.must_change_password === true
  };
}

export async function requireAdmin() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
