import { ReactNode } from "react";
import { getSessionAdmin } from "../../lib/auth";
import { AdminNav } from "../../components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getSessionAdmin();

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <h2>Admin</h2>
        {admin ? (
          <AdminNav />
        ) : (
          <div className="notice">Please log in to manage products.</div>
        )}
      </div>
      {children}
    </div>
  );
}
