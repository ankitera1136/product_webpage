import { requireAdmin } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const admin = await requireAdmin();

  return (
    <div className="card">
      <h1>Change Password</h1>
      <p style={{ color: "var(--muted)" }}>
        You must change your password before continuing.
      </p>
      <form method="post" action="/api/auth/change-password">
        <label>Current password</label>
        <input type="password" name="currentPassword" required />
        <label>New password</label>
        <input type="password" name="newPassword" required />
        <button className="button" type="submit">Update password</button>
      </form>
    </div>
  );
}
