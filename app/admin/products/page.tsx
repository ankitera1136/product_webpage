import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/auth";
import { initDb, sql } from "../../../lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const admin = await requireAdmin();
  if (admin.mustChangePassword) redirect("/admin/change-password");

  await initDb();
  const { rows } = await sql`
    SELECT id, title, slug, price_text, created_at
    FROM products
    ORDER BY created_at DESC
  `;
  const products = rows as { id: number; title: string; slug: string; price_text: string; created_at: string }[];

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Products</h1>
        <Link className="button" href="/admin/products/new">Add product</Link>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={4}>No products yet.</td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.price_text}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <Link className="button secondary" href={`/admin/products/${p.id}/edit`}>Edit</Link>
                  <form method="post" action={`/api/admin/products/${p.id}?_method=delete`}>
                    <button className="button danger" type="submit">Delete</button>
                  </form>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
