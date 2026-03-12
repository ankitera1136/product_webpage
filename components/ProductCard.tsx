import { ProductWithImages } from "../lib/types";

export function ProductCard({ product }: { product: ProductWithImages }) {
  const firstImage = product.images[0];
  return (
    <div className="card product">
      <a href={`/product/${product.slug}`}>
        {firstImage ? (
          <img src={firstImage.url} alt={product.title} />
        ) : (
          <img src="/placeholder.svg" alt="placeholder" />
        )}
      </a>
      <div style={{ marginTop: 12 }}>
        <div className="badge">{product.category_name || "Uncategorized"}</div>
        <h3 style={{ margin: "10px 0 4px" }}>{product.title}</h3>
        <p style={{ color: "var(--muted)", margin: 0 }}>{product.short_description}</p>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--accent)" }}>{product.price_text}</span>
          <a className="button secondary" href={`/product/${product.slug}`}>View</a>
        </div>
      </div>
    </div>
  );
}
