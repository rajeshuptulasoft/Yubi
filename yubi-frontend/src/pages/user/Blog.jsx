import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { theme } from "@/utils/theme";
import BackButton from "@/components/BackButton";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { foodAPI, getApiErrorMessage } from "../../lib/api";
import { extractBlogList, mapBlogFromApi } from "../../lib/blogUtils";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cat, setCat] = useState("All");

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

  const categories = useMemo(() => {
    const unique = [...new Set(blogs.map((b) => b.category).filter(Boolean))].sort();
    return ["All", ...unique];
  }, [blogs]);

  const filtered = cat === "All" ? blogs : blogs.filter((b) => b.category === cat);

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <BackButton />
          <div>
            <div style={{ fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.primary, letterSpacing: 2 }}>YUBI / BLOG</div>
            <h1 style={{ fontFamily: theme.fonts.heading, fontSize: "clamp(36px,5vw,56px)", color: theme.colors.text, margin: "4px 0 0" }}>YUBI Blog</h1>
          </div>
        </div>
        <p style={{ color: theme.colors.textDim, fontSize: 17, maxWidth: 640, marginBottom: 32 }}>
          Stories, tips & recipes from our farm — written by chefs, farmers, and the YUBI team.
        </p>

        {loading ? (
          <p style={{ color: theme.colors.textDim }}>Loading articles…</p>
        ) : error ? (
          <p style={{ color: "#C62828" }}>{error}</p>
        ) : (
          <>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
              {categories.map((c) => {
                const active = cat === c;
                return (
                  <button key={c} type="button" onClick={() => setCat(c)} style={{
                    padding: "10px 18px", borderRadius: 999, fontWeight: 600, fontSize: 14,
                    border: `2px solid ${active ? theme.colors.primary : theme.colors.border}`,
                    background: active ? theme.gradient : "#fff",
                    color: active ? "#fff" : theme.colors.text,
                    cursor: "pointer", transition: theme.transition,
                    fontFamily: theme.fonts.body,
                  }}>{c}</button>
                );
              })}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <p style={{ color: theme.colors.textDim }}>No blog posts match this filter.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 28 }}>
                {filtered.map((b) => (
                  <BlogCard key={b.id} blog={b} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BlogCard({ blog }) {
  return (
    <Link to={`/blog/${blog.id}`} className="ss-hover-lift" style={{
      display: "block", textDecoration: "none", color: "inherit",
      background: "#fff", borderRadius: 20, overflow: "hidden",
      border: `1px solid ${theme.colors.border}`,
      boxShadow: "0 4px 18px rgba(76,175,80,0.08)",
    }}>
      <div style={{ position: "relative", height: 200, overflow: "hidden", background: theme.colors.surfaceAlt }}>
        <img src={blog.cover || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&auto=format&fit=crop"} alt={blog.title} loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <span style={{
          position: "absolute", top: 14, left: 14,
          background: theme.gradient, color: "#fff", padding: "6px 12px",
          borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: theme.fonts.mono,
          letterSpacing: 1, textTransform: "uppercase",
        }}>{blog.category}</span>
      </div>
      <div style={{ padding: 20 }}>
        <h3 style={{ fontFamily: theme.fonts.heading, fontSize: 22, fontWeight: 700, color: theme.colors.text, margin: 0, lineHeight: 1.25 }}>
          {blog.title}
        </h3>
        <div style={{ display: "flex", gap: 14, color: theme.colors.textDim, fontSize: 12, margin: "10px 0 12px", flexWrap: "wrap", fontFamily: theme.fonts.mono }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={12} /> {blog.author}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {new Date(blog.date).toLocaleDateString()}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {blog.read} min read</span>
        </div>
        <p style={{ color: theme.colors.textDim, fontSize: 14, lineHeight: 1.6, margin: "0 0 14px",
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {blog.excerpt}
        </p>
        <div className="story-link" style={{ color: theme.colors.primaryDark, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
          Read More <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}
