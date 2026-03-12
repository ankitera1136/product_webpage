import { listPublicProducts, getCategories, getTags } from "../lib/products";
import { SearchBar } from "../components/SearchBar";
import { ProductCard } from "../components/ProductCard";
import { AdSlot } from "../components/AdSlot";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams
}: {
  searchParams: { q?: string; category?: string; tag?: string };
}) {
  const query = searchParams.q || "";
  const category = searchParams.category || "";
  const tag = searchParams.tag || "";

  const products = await listPublicProducts({ q: query, category, tag });
  const categories = await getCategories();
  const tags = await getTags();

  return (
    <div>
      <section className="hero">
        <h1>Find the right product faster</h1>
        <p>Curated suggestions, clear pricing notes, and direct links to buy.</p>
      </section>

      <div className="card" style={{ marginBottom: 16 }}>
        <strong>Search helper</strong>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          Start with a keyword, then narrow by category and tags for the best match.
        </p>
      </div>

      <SearchBar
        query={query}
        categories={categories}
        tags={tags}
        selectedCategory={category}
        selectedTag={tag}
      />

      <div style={{ margin: "24px 0" }}>
        <AdSlot label="Top banner" />
      </div>

      <section className="grid">
        {products.length === 0 ? (
          <div className="card">No products match your search.</div>
        ) : (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        )}
      </section>

      <div style={{ marginTop: 32 }}>
        <AdSlot label="Footer banner" />
      </div>
    </div>
  );
}
