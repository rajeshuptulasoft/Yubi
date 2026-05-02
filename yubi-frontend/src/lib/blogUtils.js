import { resolveUploadUrl } from "./foodProductUtils";

export function extractBlogList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.blogs && Array.isArray(payload.blogs)) return payload.blogs;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  return [];
}

/** Plain text for excerpts (strip HTML tags). */
export function htmlToPlainText(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cover image: API often returns `advimg` as a filename only → served under `/uploads/`.
 */
function resolveBlogCoverUrl(raw) {
  const src =
    raw.advimg ??
    raw.cover_image ??
    raw.image_url ??
    raw.cover ??
    raw.thumbnail_url ??
    "";
  if (!src) return "";
  const s = String(src).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const path = s.startsWith("/") ? s : `/uploads/${s}`;
  return resolveUploadUrl(path);
}

/**
 * Normalize GET /food/blogs rows — supports Postman shape:
 * `{ success, blogs: [{ id, header, paragraph, advimg }] }`
 */
export function mapBlogFromApi(raw, index) {
  const id = String(raw.id ?? raw.blog_id ?? raw.slug ?? `blog-${index}`);
  const paragraph = raw.paragraph ?? raw.content ?? raw.body ?? raw.blog_content ?? "";
  const header =
    raw.header ??
    raw.title ??
    raw.blog_title ??
    raw.heading ??
    "Untitled";

  const dateRaw =
    raw.published_at ??
    raw.publishedAt ??
    raw.date ??
    raw.created_at ??
    raw.updated_at;
  let date = "2026-01-01";
  if (dateRaw) {
    try {
      date = new Date(dateRaw).toISOString().slice(0, 10);
    } catch {
      /* noop */
    }
  }

  const plain = htmlToPlainText(paragraph);
  const excerpt =
    raw.excerpt ??
    raw.summary ??
    raw.short_description ??
    (plain.length > 280 ? `${plain.slice(0, 277)}…` : plain);

  const readRaw = raw.read_time ?? raw.readTime ?? raw.min_read ?? raw.read_minutes;
  let read = Number(readRaw);
  if (!Number.isFinite(read) || read <= 0) {
    const words = plain.split(/\s+/).filter(Boolean).length;
    read = Math.max(1, Math.ceil(words / 200));
  }

  const contentIsHtml = /<[a-z][\s\S]*>/i.test(paragraph);

  return {
    id,
    title: header,
    excerpt,
    content: paragraph,
    contentIsHtml,
    category: raw.category ?? raw.category_name ?? "Blog",
    author: raw.author ?? raw.author_name ?? "YUBI",
    cover: resolveBlogCoverUrl(raw),
    date,
    read,
  };
}
