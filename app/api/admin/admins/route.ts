import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionAdmin } from "../../../../lib/auth";
import { initDb, sql } from "../../../../lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (admin.role !== "owner") return NextResponse.redirect(new URL("/admin/admins?error=role", request.url));

  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "admin");

  if (!name || !email || !password) {
    return NextResponse.redirect(new URL("/admin/admins/new?error=1", request.url));
  }

  await initDb();
  const existing = await sql`SELECT id FROM admins WHERE email = ${email}`;
  if (existing.rows.length > 0) {
    return NextResponse.redirect(new URL("/admin/admins/new?error=exists", request.url));
  }

  const hash = bcrypt.hashSync(password, 10);
  await sql`
    INSERT INTO admins (name, email, password_hash, role, must_change_password, created_at)
    VALUES (${name}, ${email}, ${hash}, ${role === "editor" ? "editor" : "admin"}, TRUE, ${new Date().toISOString()})
  `;

  return NextResponse.redirect(new URL("/admin/admins", request.url));
}
