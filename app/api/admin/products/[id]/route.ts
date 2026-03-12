import { NextResponse } from "next/server";
import { getSessionAdmin } from "../../../../../lib/auth";
import { initDb, sql } from "../../../../../lib/db";
import { saveImage, deleteImage } from "../../../../../lib/images";
import { ensureCategory, ensureTags } from "../../../../../lib/products";
import { isValidUrl, clampText } from "../../../../../lib/validation";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (admin.mustChangePassword) return NextResponse.redirect(new URL("/admin/change-password", request.url));

  const resolvedParams = await params;
  const method = new URL(request.url).searchParams.get("_method");
  const productId = Number(resolvedParams.id);

  if (method === "delete") {
    await initDb();
    const imagesResult = await sql`
      SELECT url FROM product_images WHERE product_id = ${productId}
    `;
    await sql`DELETE FROM products WHERE id = ${productId}`;
    for (const img of imagesResult.rows as { url: string }[]) {
      await deleteImage(img.url);
    }

    return NextResponse.redirect(new URL("/admin/products", request.url));
  }

  if (method === "put") {
    const formData = await request.formData();
    const title = clampText(String(formData.get("title") || ""), 120);
    const shortDescription = clampText(String(formData.get("short_description") || ""), 300);
    const priceText = clampText(String(formData.get("price_text") || ""), 60);
    const linkUrl = String(formData.get("link_url") || "");
    const categoryName = String(formData.get("category") || "");
    const tagsValue = String(formData.get("tags") || "");

    if (!title || !shortDescription || !priceText || !isValidUrl(linkUrl)) {
      return NextResponse.redirect(new URL(`/admin/products/${productId}/edit?error=1`, request.url));
    }

    const categoryId = await ensureCategory(categoryName || null);
    const tagIds = await ensureTags(tagsValue.split(","));

    const files = formData
      .getAll("images")
      .filter((file) => file instanceof File && file.size > 0) as File[];
    if (files.length > 5) {
      return NextResponse.redirect(new URL(`/admin/products/${productId}/edit?error=images`, request.url));
    }

    const urls: string[] = [];
    if (files.length > 0) {
      for (const file of files) {
        urls.push(await saveImage(file));
      }
    }

    try {
      await initDb();
      await sql`
        UPDATE products
        SET title = ${title},
            short_description = ${shortDescription},
            price_text = ${priceText},
            link_url = ${linkUrl},
            category_id = ${categoryId},
            updated_at = ${new Date().toISOString()}
        WHERE id = ${productId}
      `;

      await sql`DELETE FROM product_tags WHERE product_id = ${productId}`;
      for (const tagId of tagIds) {
        await sql`INSERT INTO product_tags (product_id, tag_id) VALUES (${productId}, ${tagId})`;
      }

      if (urls.length > 0) {
        const existing = await sql`SELECT url FROM product_images WHERE product_id = ${productId}`;
        await sql`DELETE FROM product_images WHERE product_id = ${productId}`;
        for (const [index, url] of urls.entries()) {
          await sql`
            INSERT INTO product_images (product_id, url, sort_order)
            VALUES (${productId}, ${url}, ${index})
          `;
        }
        for (const img of existing.rows as { url: string }[]) {
          await deleteImage(img.url);
        }
      }
    } catch (dbError) {
      for (const url of urls) {
        await deleteImage(url);
      }
      throw dbError;
    }

    return NextResponse.redirect(new URL("/admin/products", request.url));
  }

  return NextResponse.redirect(new URL("/admin/products", request.url));
}
