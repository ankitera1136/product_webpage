import { NextResponse } from "next/server";
import { getSessionAdmin } from "../../../../lib/auth";
import { initDb, sql } from "../../../../lib/db";
import { saveImage, deleteImage } from "../../../../lib/images";
import { slugify } from "../../../../lib/slug";
import { ensureCategory, ensureTags } from "../../../../lib/products";
import { isValidUrl, clampText } from "../../../../lib/validation";

export const runtime = "nodejs";

async function buildUniqueSlug(base: string) {
  let slug = base;
  let counter = 2;
  await initDb();
  while (true) {
    const { rows } = await sql`SELECT id FROM products WHERE slug = ${slug}`;
    if (rows.length === 0) break;
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (admin.mustChangePassword) return NextResponse.redirect(new URL("/admin/change-password", request.url));

  const formData = await request.formData();
  const title = clampText(String(formData.get("title") || ""), 120);
  const shortDescription = clampText(String(formData.get("short_description") || ""), 300);
  const priceText = clampText(String(formData.get("price_text") || ""), 60);
  const linkUrl = String(formData.get("link_url") || "");
  const categoryName = String(formData.get("category") || "");
  const tagsValue = String(formData.get("tags") || "");

  if (!title || !shortDescription || !priceText || !isValidUrl(linkUrl)) {
    return NextResponse.redirect(new URL("/admin/products/new?error=1", request.url));
  }

  const files = formData
    .getAll("images")
    .filter((file) => file instanceof File && file.size > 0) as File[];
  if (files.length > 5) {
    return NextResponse.redirect(new URL("/admin/products/new?error=images", request.url));
  }

  const categoryId = await ensureCategory(categoryName || null);
  const tagIds = await ensureTags(tagsValue.split(","));

  const slugBase = slugify(title) || `product-${Date.now()}`;
  const slug = await buildUniqueSlug(slugBase);
  const now = new Date().toISOString();

  const urls: string[] = [];
  let productId: number | null = null;
  try {
    for (const file of files) {
      urls.push(await saveImage(file));
    }

    await initDb();
    const insertResult = await sql`
      INSERT INTO products (title, slug, short_description, price_text, link_url, category_id, created_at, updated_at)
      VALUES (${title}, ${slug}, ${shortDescription}, ${priceText}, ${linkUrl}, ${categoryId}, ${now}, ${now})
      RETURNING id
    `;
    productId = Number(insertResult.rows[0].id);

    for (const tagId of tagIds) {
      await sql`INSERT INTO product_tags (product_id, tag_id) VALUES (${productId}, ${tagId})`;
    }

    for (const [index, url] of urls.entries()) {
      await sql`
        INSERT INTO product_images (product_id, url, sort_order)
        VALUES (${productId}, ${url}, ${index})
      `;
    }
  } catch (error) {
    if (productId) {
      await sql`DELETE FROM products WHERE id = ${productId}`;
    }
    for (const url of urls) {
      await deleteImage(url);
    }
    throw error;
  }

  return NextResponse.redirect(new URL("/admin/products", request.url));
}
