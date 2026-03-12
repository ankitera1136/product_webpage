export type Category = { id: number; name: string; slug: string };
export type Tag = { id: number; name: string; slug: string };

export type ProductRow = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  price_text: string;
  link_url: string;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
};

export type ProductImage = { id: number; product_id: number; url: string; sort_order: number };

export type ProductWithImages = ProductRow & { images: ProductImage[] };
