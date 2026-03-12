import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getSessionAdmin } from "../../../../../lib/auth";
import { initDb, sql } from "../../../../../lib/db";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (admin.role !== "owner") return NextResponse.redirect(new URL("/admin/admins?error=role", request.url));

  const targetId = Number(params.id);
  const tempPassword = `Temp-${nanoid(8)}`;
  const hash = bcrypt.hashSync(tempPassword, 10);

  await initDb();
  await sql`
    UPDATE admins
    SET password_hash = ${hash}, must_change_password = TRUE
    WHERE id = ${targetId}
  `;

  return NextResponse.redirect(new URL(`/admin/admins?temp=${encodeURIComponent(tempPassword)}`, request.url));
}
