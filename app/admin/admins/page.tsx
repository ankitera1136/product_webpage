import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/auth";
import { initDb, sql } from "../../../lib/db";

export const dynamic = "force-dynamic";

export default async function AdminsPage({
  searchParams
}: {
  searchParams: Promise<{ temp?: string; error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const admin = await requireAdmin();
  if (admin.mustChangePassword) redirect("/admin/change-password");

  await initDb();
  const { rows } = await sql`
    SELECT id, name, email, role, created_at
    FROM admins
    ORDER BY created_at DESC
  `;
  const admins = rows as { id: number; name: string; email: string; role: string; created_at: string }[];

  const canManage = admin.role === "owner";

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admins</h1>
        {canManage ? (
          <Link className="button" href="/admin/admins/new">Add admin</Link>
        ) : (
          <span className="notice">Owner only</span>
        )}
      </div>
      {resolvedSearchParams?.temp ? (
        <div className="notice" style={{ marginTop: 12 }}>
          Temporary password: <strong>{resolvedSearchParams.temp}</strong>
        </div>
      ) : null}
      {!canManage ? (
        <div className="notice" style={{ marginTop: 12 }}>
          Only the owner can add or reset admin accounts.
        </div>
      ) : null}
      <table className="table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>{a.role}</td>
              <td>{new Date(a.created_at).toLocaleDateString()}</td>
              <td>
                {canManage ? (
                  <form method="post" action={`/api/admin/admins/${a.id}?_method=reset`}>
                    <button className="button secondary" type="submit">Reset password</button>
                  </form>
                ) : (
                  <span style={{ color: "var(--muted)" }}>No access</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
