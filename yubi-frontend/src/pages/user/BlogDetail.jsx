import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { theme } from "@/utils/theme";
import BackButton from "@/components/BackButton";
import { Calendar, Clock, Share2, Copy, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner";
import { foodAPI, getApiErrorMessage } from "../../lib/api";
import { extractBlogList, mapBlogFromApi } from "../../lib/blogUtils";

export default function BlogDetail() {
  const { blogId } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await foodAPI.getBlogs();
        const list = extractBlogList(res).map(mapBlogFromApi);
        if (!cancelled) setBlogs(list);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const blog = useMemo(() => blogs.find((b) => String(b.id) === String(blogId)), [blogs, blogId]);
  const related = useMemo(
    () =>
      blog
        ? blogs.filter((b) => String(b.id) !== String(blog.id)).slice(0, 3)
        : [],
    [blogs, blog],
  );

  const share = (kind) => {
    if (!blog) return;
    const url = window.location.href;
    if (kind === "copy") { navigator.clipboard.writeText(url); toast.success("Link copied!"); return; }
    const text = encodeURIComponent(blog.title);
    const u = encodeURIComponent(url);
    const map = {
      whatsapp: `https://wa.me/?text=${text}%20${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${u}`,
    };
    window.open(map[kind], "_blank");
  };

  const authorInitial = blog?.author?.trim()?.[0] ?? "Y";

  if (loading) {
    return (
      <div style={{ background: "#FFFFFF", minHeight: "100vh", padding: "48px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <BackButton />
          <p style={{ color: theme.colors.textDim, marginTop: 24 }}>Loading article…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#FFFFFF", minHeight: "100vh", padding: "48px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <BackButton />
          <p style={{ color: "#C62828", marginTop: 24 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ background: "#FFFFFF", minHeight: "100vh", padding: "48px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <BackButton />
          <p style={{ color: theme.colors.textDim, marginTop: 24 }}>This article could not be found.</p>
          <Link to="/blog" style={{ color: theme.colors.primaryDark, fontWeight: 700, marginTop: 16, display: "inline-block" }}>← Back to blog</Link>
        </div>
      </div>
    );
  }

  const bodyText = (blog.content || "").trim();
  const coverSrc = blog.cover || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&auto=format&fit=crop";
  const renderHtml = Boolean(blog.contentIsHtml ?? /<[a-z][\s\S]*>/i.test(bodyText));

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px 80px" }}>
        <BackButton />
        <img src={coverSrc} alt={blog.title} style={{
          width: "100%", maxHeight: 500, objectFit: "cover",
          borderRadius: 20, marginTop: 24, border: `1px solid ${theme.colors.border}`,
        }} />
        <h1 style={{ fontFamily: theme.fonts.heading, fontSize: "clamp(34px,5vw,52px)", color: theme.colors.text, margin: "28px 0 16px", lineHeight: 1.15 }}>
          {blog.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", color: theme.colors.textDim, marginBottom: 18, fontFamily: theme.fonts.mono, fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
              {authorInitial}
            </div>
            <span>{blog.author}</span>
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={13} /> {new Date(blog.date).toLocaleDateString()}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={13} /> {blog.read} min read</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {[blog.category, "YUBI", "Farm Fresh"].map((t, i) => (
            <span key={`${t}-${i}`} style={{
              padding: "6px 12px", borderRadius: 999, background: "rgba(76,175,80,0.10)",
              color: theme.colors.primaryDark, fontSize: 12, fontWeight: 600, fontFamily: theme.fonts.mono,
            }}>#{t}</span>
          ))}
        </div>

        <div style={{ color: theme.colors.text, fontSize: 17, lineHeight: 1.8 }}>
          {bodyText ? (
            renderHtml ? (
              <div
                className="blog-article-body"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            ) : (
              <div style={{ whiteSpace: "pre-wrap" }}>{blog.content}</div>
            )
          ) : (
            <>
              <p>{blog.excerpt}</p>
              <p style={{ color: theme.colors.textDim, marginTop: 16 }}>Full article content is not available for this post.</p>
            </>
          )}
        </div>

        {/* Share */}
        <div style={{ marginTop: 36, padding: 20, borderRadius: 16, background: theme.colors.surfaceAlt, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <Share2 size={20} color={theme.colors.primaryDark} />
          <strong style={{ color: theme.colors.text }}>Share this post:</strong>
          <ShareBtn onClick={() => share("whatsapp")} label="WhatsApp" />
          <ShareBtn onClick={() => share("facebook")} icon={<Facebook size={16} />} />
          <ShareBtn onClick={() => share("twitter")} icon={<Twitter size={16} />} />
          <ShareBtn onClick={() => share("copy")} icon={<Copy size={16} />} label="Copy" />
        </div>

        {/* Related */}
        {related.length > 0 ? (
          <>
            <h2 style={{ fontFamily: theme.fonts.heading, fontSize: 32, color: theme.colors.text, marginTop: 56, marginBottom: 18 }}>Related Blogs</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
              {related.map((r) => (
                <Link key={r.id} to={`/blog/${r.id}`} style={{ textDecoration: "none", color: "inherit" }} className="ss-hover-lift">
                  <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: `1px solid ${theme.colors.border}` }}>
                    <img src={r.cover || coverSrc} alt={r.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                    <div style={{ padding: 14 }}>
                      <div style={{ fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.primary, letterSpacing: 1 }}>{r.category.toUpperCase()}</div>
                      <div style={{ fontFamily: theme.fonts.heading, fontSize: 18, color: theme.colors.text, marginTop: 6, lineHeight: 1.25 }}>{r.title}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ShareBtn({ onClick, icon, label }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "8px 14px", borderRadius: 10,
      background: "#fff", border: `1px solid ${theme.colors.border}`,
      color: theme.colors.primaryDark, cursor: "pointer", display: "inline-flex",
      alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13,
    }}>{icon}{label ? ` ${label}` : null}</button>
  );
}
