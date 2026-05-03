/** Same production API base as axios (for building absolute /uploads URLs in prod). */
import { API_BASE_URL } from "./axios";

/**
 * Turn API image paths into a browser-loadable URL.
 * Relative paths like `/uploads/default-product.png` — in dev, Vite proxies `/uploads` to the backend.
 */
export function resolveUploadUrl(pathOrUrl) {
  if (pathOrUrl == null || pathOrUrl === "") return "";
  const s = String(pathOrUrl).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const path = s.startsWith("/") ? s : `/${s}`;
  if (import.meta.env.DEV) return path;
  try {
    const origin = new URL(API_BASE_URL, window.location.origin).origin;
    return `${origin}${path}`;
  } catch {
    return path;
  }
}

/** Normalize API category strings to the app's lowercase slugs. */
export function normalizeProductCategory(cat) {
  const c = String(cat || "").toLowerCase();
  if (c.includes("spice")) return "spices";
  if (c.includes("food")) return "food";
  if (c.includes("grocery")) return "grocery";
  if (c.includes("agro")) return "agro";
  return c || "food";
}

export function extractProductList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.products)) return payload.products;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
}

/**
 * Map GET /food/products row → shape used by ProductCard / home sections.
 */
export function mapFoodProductFromApi(raw, index) {
  const id = String(raw.id ?? raw.product_id ?? raw.uuid ?? `food-${index}`);
  const priceRaw = raw.price ?? raw.selling_price ?? 0;
  const priceNum = typeof priceRaw === "string" ? parseFloat(priceRaw) : Number(priceRaw);
  const price = Number.isFinite(priceNum) ? priceNum : 0;

  return {
    id,
    name: raw.product_name ?? raw.name ?? "Product",
    description: raw.description ?? "",
    category: normalizeProductCategory(raw.category),
    price,
    image: resolveUploadUrl(raw.image_url ?? raw.image ?? raw.thumbnail_url ?? ""),
    unit: raw.unit ?? raw.pack_size ?? undefined,
    rating: raw.rating != null ? Number(raw.rating) : undefined,
    reviews: raw.reviews != null ? Number(raw.reviews) : undefined,
    inStock: raw.in_stock !== false && raw.inStock !== false,
  };
}
