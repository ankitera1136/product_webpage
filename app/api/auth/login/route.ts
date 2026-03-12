import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initDb, sql } from "../../../../lib/db";
import { createSession } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  await initDb();
  const { rows } = await sql`
    SELECT id, password_hash, must_change_password
    FROM admins
    WHERE email = ${email}
  `;
  const admin = rows[0] as { id: number; password_hash: string; must_change_password: boolean } | undefined;

  if (!admin) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const ok = bcrypt.compareSync(password, admin.password_hash);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  await createSession(admin.id);

  if (admin.must_change_password === true) {
    return NextResponse.redirect(new URL("/admin/change-password", request.url));
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
