import { redirect } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const admin = await requireAdmin();
  if (admin.mustChangePassword) redirect("/admin/change-password");

  return (
    <div className="card">
      <h1>New Product</h1>
      <form method="post" action="/api/admin/products" encType="multipart/form-data">
        <label>Title</label>
        <input name="title" required />

        <label>Short description</label>
        <textarea name="short_description" rows={3} required />

        <label>Price text</label>
        <input name="price_text" placeholder="$199 or From $20/mo" required />

        <label>Product link</label>
        <input name="link_url" type="url" required />

        <label>Category</label>
        <input name="category" placeholder="e.g. Headphones" />

        <label>Tags (comma separated)</label>
        <input name="tags" placeholder="wireless, travel, budget" />

        <label>Images (1-5)</label>
        <input name="images" type="file" accept="image/*" multiple />

        <button className="button" type="submit">Create product</button>
      </form>
    </div>
  );
}
