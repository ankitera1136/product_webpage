import { redirect, notFound } from "next/navigation";
import { requireAdmin } from "../../../../../lib/auth";
import { getProductById } from "../../../../../lib/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin.mustChangePassword) redirect("/admin/change-password");

  const product = await getProductById(Number(params.id));
  if (!product) return notFound();

  return (
    <div className="card">
      <h1>Edit Product</h1>
      <form method="post" action={`/api/admin/products/${product.id}?_method=put`} encType="multipart/form-data">
        <label>Title</label>
        <input name="title" defaultValue={product.title} required />

        <label>Short description</label>
        <textarea name="short_description" rows={3} defaultValue={product.short_description} required />

        <label>Price text</label>
        <input name="price_text" defaultValue={product.price_text} required />

        <label>Product link</label>
        <input name="link_url" type="url" defaultValue={product.link_url} required />

        <label>Category</label>
        <input name="category" defaultValue={product.category_name || ""} />

        <label>Tags (comma separated)</label>
        <input
          name="tags"
          defaultValue={"tags" in product ? product.tags.map((t) => t.name).join(", ") : ""}
        />

        <label>Upload new images (optional)</label>
        <input name="images" type="file" accept="image/*" multiple />

        <button className="button" type="submit">Save changes</button>
      </form>

      <div style={{ marginTop: 20 }}>
        <p style={{ color: "var(--muted)" }}>Existing images</p>
        <div className="grid">
          {product.images.length === 0 ? (
            <div className="notice">No images yet.</div>
          ) : (
            product.images.map((img) => (
              <img key={img.id} src={img.url} alt={product.title} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
