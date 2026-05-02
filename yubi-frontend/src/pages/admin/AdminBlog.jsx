import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { blogs } from "../../data";
import { title } from "./AdminDashboard";
import { Table } from "./AdminUsers";
export default function AdminBlog(){
  const [rows, setRows] = useState(blogs);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "General", imageFile: null, imagePreview: "" });
  const tableRows = useMemo(() => rows.map((blog) => [blog.id, blog.title, blog.category, blog.publishedAt, blog.status]), [rows]);

  const onImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imagePreview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageFile: file, imagePreview }));
  };

  const postBlog = () => {
    if (!form.title.trim() || !form.description.trim() || !form.imageFile) return;
    const next = {
      id: `BLG-${String(rows.length + 1).padStart(3, "0")}`,
      title: form.title.trim(),
      category: form.category,
      author: "YUBI Team",
      publishedAt: new Date().toISOString().slice(0, 10),
      readTime: "3 min read",
      coverImage: form.imagePreview,
      excerpt: form.description.slice(0, 90),
      content: form.description,
      status: "Published"
    };
    setRows((prev) => [next, ...prev]);
    setOpen(false);
    setForm({ title: "", description: "", category: "General", imageFile: null, imagePreview: "" });
  };

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <h1 style={{...title, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif"}}>Blog Management</h1>
      <button onClick={() => setOpen(true)} style={{ width: 44, height: 44, borderRadius: 12, background: "#4CAF50", color: "#FFFFFF", display: "grid", placeItems: "center", fontWeight: 900 }}>
        <Plus size={22} />
      </button>
    </div>
    <Table headers={["ID","Title","Category","Date","Status"]} rows={tableRows}/>

    {open && <div className="admin-modal-backdrop" onClick={() => setOpen(false)}>
      <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
        <div className="admin-modal__head"><h3 className="admin-modal__title">Post New Blog</h3></div>
        <div className="admin-modal__body">
          <div className="admin-modal__row" style={{ display: "block", borderBottom: "none", paddingTop: 0 }}>
            <label style={label}>Title</label>
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Enter blog title" style={input} />
          </div>
          <div className="admin-modal__row" style={{ display: "block", borderBottom: "none", paddingTop: 0 }}>
            <label style={label}>Description</label>
            <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Enter blog description" style={{ ...input, minHeight: 120, resize: "vertical" }} />
          </div>
          <div className="admin-modal__row" style={{ display: "block", borderBottom: "none", paddingTop: 0 }}>
            <label style={label}>Upload Image</label>
            <input type="file" accept="image/*" onChange={onImageChange} style={input} />
            {form.imagePreview && <img src={form.imagePreview} alt="Preview" style={{ marginTop: 10, width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, border: "1px solid #D6E8D6" }} />}
          </div>
        </div>
        <div className="admin-modal__foot" style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setOpen(false)} className="admin-view-btn" style={{ flex: 1 }}>Cancel</button>
          <button onClick={postBlog} className="admin-modal__close" style={{ flex: 1 }}>Post Blog</button>
        </div>
      </div>
    </div>}
  </div>
}

const label = { display: "block", fontWeight: 700, marginBottom: 8, color: "#1A2E1A" };
const input = { width: "100%", border: "1px solid #D6E8D6", borderRadius: 10, padding: "11px 12px", color: "#1A1A1A", background: "#FFFFFF" };
