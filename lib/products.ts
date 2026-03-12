import { initDb, sql } from "./db";
import { slugify } from "./slug";
import { ProductRow, ProductWithImages, Category, Tag, ProductImage } from "./types";

export async function getCategories(): Promise<Category[]> {
  await initDb();
  const { rows } = await sql`SELECT id, name, slug FROM categories ORDER BY name`;
  return rows as Category[];
}

export async function getTags(): Promise<Tag[]> {
  await initDb();
  const { rows } = await sql`SELECT id, name, slug FROM tags ORDER BY name`;
  return rows as Tag[];
}

export async function ensureCategory(name: string | null) {
  if (!name) return null;
  const clean = name.trim();
  if (!clean) return null;
  const slug = slugify(clean);
  await initDb();
  const { rows } = await sql`
    INSERT INTO categories (name, slug)
    VALUES (${clean}, ${slug})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  return Number(rows[0].id);
}

export async function ensureTags(names: string[]) {
  const tagIds: number[] = [];
  const unique = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
  await initDb();
  for (const name of unique) {
    const slug = slugify(name);
    const { rows } = await sql`
      INSERT INTO tags (name, slug)
      VALUES (${name}, ${slug})
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    tagIds.push(Number(rows[0].id));
  }
  return tagIds;
}

export async function getProductImages(productId: number) {
  await initDb();
  const { rows } = await sql`
    SELECT id, product_id, url, sort_order
    FROM product_images
    WHERE product_id = ${productId}
    ORDER BY sort_order
  `;
  return rows as ProductImage[];
}

export async function getProductBySlug(slug: string) {
  await initDb();
  const { rows } = await sql`
    SELECT products.id, products.title, products.slug, products.short_description, products.price_text,
      products.link_url, products.category_id, categories.name as category_name, categories.slug as category_slug
    FROM products
    LEFT JOIN categories ON categories.id = products.category_id
    WHERE products.slug = ${slug} AND products.is_active = TRUE
  `;

  const row = rows[0] as ProductRow | undefined;
  if (!row) return null;
  const images = await getProductImages(row.id);
  return { ...row, images } as ProductWithImages;
}

export async function getProductById(id: number) {
  await initDb();
  const { rows } = await sql`
    SELECT products.id, products.title, products.slug, products.short_description, products.price_text,
      products.link_url, products.category_id, categories.name as category_name, categories.slug as category_slug
    FROM products
    LEFT JOIN categories ON categories.id = products.category_id
    WHERE products.id = ${id}
  `;
  const row = rows[0] as ProductRow | undefined;
  if (!row) return null;
  const images = await getProductImages(row.id);
  const tagResult = await sql`
    SELECT tags.id, tags.name, tags.slug
    FROM product_tags
    JOIN tags ON tags.id = product_tags.tag_id
    WHERE product_tags.product_id = ${row.id}
    ORDER BY tags.name
  `;
  const tags = tagResult.rows as Tag[];
  return { ...row, images, tags } as ProductWithImages & { tags: Tag[] };
}

export async function listPublicProducts(options: {
  q?: string;
  category?: string;
  tag?: string;
}) {
  await initDb();
  const qParam = options.q?.trim() || null;
  const categoryParam = options.category?.trim() || null;
  const tagParam = options.tag?.trim() || null;

  const { rows } = await sql`
    SELECT products.id, products.title, products.slug, products.short_description, products.price_text,
      products.link_url, products.category_id, categories.name as category_name, categories.slug as category_slug
    FROM products
    LEFT JOIN categories ON categories.id = products.category_id
    WHERE products.is_active = TRUE
      AND (${qParam}::text IS NULL OR products.title ILIKE '%' || ${qParam} || '%' OR products.short_description ILIKE '%' || ${qParam} || '%')
      AND (${categoryParam}::text IS NULL OR categories.slug = ${categoryParam})
      AND (${tagParam}::text IS NULL OR EXISTS (
        SELECT 1
        FROM product_tags pt
        JOIN tags t ON t.id = pt.tag_id
        WHERE pt.product_id = products.id AND t.slug = ${tagParam}
      ))
    ORDER BY products.created_at DESC
  `;

  const items = rows as ProductRow[];
  const withImages = await Promise.all(
    items.map(async (row) => ({ ...row, images: await getProductImages(row.id) }))
  );
  return withImages as ProductWithImages[];
}
