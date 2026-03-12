import Link from "next/link";
import { requireAdmin } from "../../lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  if (admin.mustChangePassword) redirect("/admin/change-password");

  return (
    <div className="card">
      <h1>Welcome, {admin.name}</h1>
      <p style={{ color: "var(--muted)" }}>Manage products, categories, and admins.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link className="button" href="/admin/products">Manage products</Link>
        <Link className="button secondary" href="/admin/admins">Manage admins</Link>
      </div>
    </div>
  );
}
