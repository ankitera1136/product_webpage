import path from "path";
import { nanoid } from "nanoid";
import { put, del } from "@vercel/blob";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function getExtFromName(name: string) {
  const ext = path.extname(name || "").toLowerCase();
  return ext;
}

export async function saveImage(file: File) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image too large. Max 5MB.");
  }

  const ext = getExtFromName(file.name);
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error("Unsupported image type. Use jpg, png, or webp.");
  }

  const filename = `${nanoid(12)}${ext}`;
  const blob = await put(`products/${filename}`, file, {
    access: "public"
  });

  return blob.url;
}

export async function deleteImage(url: string) {
  if (!url) return;
  await del(url);
}
