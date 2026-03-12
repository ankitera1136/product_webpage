import { redirect } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function NewAdminPage() {
  const admin = await requireAdmin();
  if (admin.mustChangePassword) redirect("/admin/change-password");
  if (admin.role !== "owner") redirect("/admin/admins");

  return (
    <div className="card">
      <h1>New Admin</h1>
      <form method="post" action="/api/admin/admins">
        <label>Name</label>
        <input name="name" required />
        <label>Email</label>
        <input name="email" type="email" required />
        <label>Temporary password</label>
        <input name="password" type="password" required />
        <label>Role</label>
        <select name="role" defaultValue="admin">
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select>
        <button className="button" type="submit">Create admin</button>
      </form>
    </div>
  );
}
