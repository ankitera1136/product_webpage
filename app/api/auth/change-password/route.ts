import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initDb, sql } from "../../../../lib/db";
import { getSessionAdmin } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const formData = await request.formData();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");

  await initDb();
  const { rows } = await sql`SELECT password_hash FROM admins WHERE id = ${admin.id}`;
  const row = rows[0] as { password_hash: string } | undefined;

  if (!row || !bcrypt.compareSync(currentPassword, row.password_hash)) {
    return NextResponse.redirect(new URL("/admin/change-password?error=1", request.url));
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  await sql`
    UPDATE admins
    SET password_hash = ${newHash}, must_change_password = FALSE
    WHERE id = ${admin.id}
  `;

  return NextResponse.redirect(new URL("/admin", request.url));
}
