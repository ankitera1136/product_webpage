import { notFound } from "next/navigation";
import { getProductBySlug } from "../../../lib/products";
import { AdSlot } from "../../../components/AdSlot";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) return notFound();

  return (
    <div>
      <a className="badge" href="/">Back to search</a>
      <h1 style={{ marginTop: 16 }}>{product.title}</h1>
      <p style={{ color: "var(--muted)" }}>{product.short_description}</p>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {product.images.length === 0 ? (
          <img src="/placeholder.svg" alt="placeholder" />
        ) : (
          product.images.map((img) => (
            <img key={img.id} src={img.url} alt={product.title} />
          ))
        )}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="badge">{product.category_name || "Uncategorized"}</div>
        <h3>Price</h3>
        <p style={{ color: "var(--accent)" }}>{product.price_text}</p>
        <a className="button" href={product.link_url} target="_blank" rel="noreferrer">
          Visit store
        </a>
      </div>

      <div style={{ marginTop: 24 }}>
        <AdSlot label="Product page" />
      </div>
    </div>
  );
}
