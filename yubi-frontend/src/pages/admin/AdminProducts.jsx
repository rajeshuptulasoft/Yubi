import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { adminAPI, getApiErrorMessage } from "../../lib/api";
import ProductItemForm from "../../components/admin/ProductItemForm";
import { title } from "./AdminDashboard";

const API_ASSET_BASE = (import.meta.env.VITE_BASE_URL || "").replace(/\/?api\/?$/i, "").replace(/\/$/, "");

function resolveImageUrl(path) {
  if (!path || typeof path !== "string") return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("//")) return `https:${path}`;
  const base = API_ASSET_BASE;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function extractList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.products)) return res.products;
  if (Array.isArray(res.items)) return res.items;
  return [];
}

function normalizeProductKind(raw) {
  const parts = [raw.category, raw.product_category, raw.type, raw.product_type]
    .filter((x) => x != null && x !== "")
    .map((x) => String(x).trim().toLowerCase());
  const s = parts.join(" ");
  if (s.includes("spice") || s.includes("masala")) return "spices";
  if (s.includes("food") || s.includes("meal") || s.includes("snack") || s.includes("beverage")) return "food";
  if (parts[0] === "food" || parts[0] === "foods") return "food";
  if (parts[0] === "spices" || parts[0] === "spice") return "spices";
  return "food";
}

function normalizeAdminProduct(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id ?? raw.product_id ?? raw.productId;
  if (id === undefined || id === null || id === "") return null;
  const category = normalizeProductKind(raw);
  const imgRaw = raw.image ?? raw.image_url ?? raw.thumbnail ?? "";
  return {
    ...raw,
    id,
    name: String(raw.product_name ?? raw.name ?? ""),
    description: String(raw.description ?? ""),
    price: Number(raw.price ?? 0),
    category,
    image: typeof imgRaw === "string" ? imgRaw : "",
    stock: raw.stock != null ? Number(raw.stock) : 0,
    inStock: !(
      raw.is_available === 0 ||
      raw.is_available === false ||
      raw.is_available === "0"
    ),
  };
}

export default function AdminProducts() {
  const { productKind } = useParams();
  if (productKind !== "food" && productKind !== "spices") {
    return <Navigate to="/admin/products/food" replace />;
  }
  const kind = productKind;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.getAdminProducts();
      if (res?.success === false) {
        setError(getApiErrorMessage(res, "Could not load products."));
        setItems([]);
        return;
      }
      const list = extractList(res).map(normalizeAdminProduct).filter(Boolean);
      setItems(list);
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not load products."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => items.filter((product) => product.category === kind), [items, kind]);

  const pageTitle = kind === "food" ? "Food Products" : "Spice Products";

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    try {
      const res = await adminAPI.deleteProduct(product.id);
      if (res?.success === false) {
        window.alert(getApiErrorMessage(res, "Delete failed."));
        return;
      }
      await loadProducts();
      setViewItem((v) => (v?.id === product.id ? null : v));
    } catch (e) {
      window.alert(getApiErrorMessage(e, "Delete failed."));
    }
  };

  return (
    <div style={{ color: "#1A1A1A" }}>
      <div className="admin-page-head">
        <div>
          <h1
            style={{
              ...title,
              fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
              marginBottom: 12,
            }}
          >
            {pageTitle}
          </h1>
          <p style={{ margin: "0 0 8px", color: "#4B5563", fontWeight: 600, fontSize: 14 }}>
            {kind === "food"
              ? "Manage food catalog only. Spices are under Spice Products in the sidebar."
              : "Manage spices catalog only. Food is under Food Products in the sidebar."}
          </p>
        </div>
        <button className="admin-add-btn" type="button" onClick={() => setModal({ type: kind })}>
          <Plus size={18} /> Create Item
        </button>
      </div>

      {error && (
        <p style={{ color: "#B91C1C", fontWeight: 800, marginBottom: 12 }}>
          {error}{" "}
          <button type="button" className="admin-view-btn" onClick={() => loadProducts()}>
            Retry
          </button>
        </p>
      )}

      {loading ? (
        <p style={{ fontWeight: 700 }}>Loading products…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {(kind === "food"
                  ? ["Image", "Name", "Category", "Price", "Status", "Actions"]
                  : ["Image", "Name", "Category", "Stock", "Price", "Status", "Actions"]
                ).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) =>
                kind === "food" ? (
                  <tr key={product.id}>
                    <td data-label="Image">
                      <Thumb product={product} />
                    </td>
                    <td data-label="Name">{product.name}</td>
                    <td data-label="Category">Food</td>
                    <td data-label="Price">Rs {Number(product.price).toLocaleString("en-IN")}</td>
                    <td data-label="Status">
                      <Status inStock={product.inStock} />
                    </td>
                    <td data-label="Actions">
                      <Actions
                        product={product}
                        onView={setViewItem}
                        onEdit={(item) => setModal({ type: kind, item })}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={product.id}>
                    <td data-label="Image">
                      <Thumb product={product} />
                    </td>
                    <td data-label="Name">{product.name}</td>
                    <td data-label="Category">Spices</td>
                    <td data-label="Stock">{product.stock != null ? product.stock : "—"}</td>
                    <td data-label="Price">Rs {Number(product.price).toLocaleString("en-IN")}</td>
                    <td data-label="Status">
                      <Status inStock={product.inStock} />
                    </td>
                    <td data-label="Actions">
                      <Actions
                        product={product}
                        onView={setViewItem}
                        onEdit={(item) => setModal({ type: kind, item })}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          {!filtered.length && (
            <p style={{ padding: "16px 0", fontWeight: 700, color: "#6B7280" }}>
              No {kind === "food" ? "food" : "spice"} products yet.
            </p>
          )}
        </div>
      )}

      {modal && (
        <AdminModal
          title={
            modal.item
              ? `Edit ${modal.type === "food" ? "Food" : "Spice"} Item`
              : `Create ${modal.type === "food" ? "Food" : "Spice"} Item`
          }
          onClose={() => setModal(null)}
        >
          <ProductItemForm
            key={`${modal.type}-${modal.item?.id ?? "new"}`}
            type={modal.type}
            initialItem={modal.item || undefined}
            initialImageUrl={modal.item ? resolveImageUrl(modal.item.image) : ""}
            submitLabel={modal.item ? "Update Item" : "Save Item"}
            onSubmit={async (formData) => {
              const res = modal.item
                ? await adminAPI.updateProduct(modal.item.id, formData)
                : await adminAPI.addProduct(formData);
              if (res?.success === false) {
                throw new Error(getApiErrorMessage(res, "Request failed."));
              }
              await loadProducts();
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </AdminModal>
      )}

      {viewItem && (
        <AdminModal title="Product Details" onClose={() => setViewItem(null)} maxWidth={680}>
          <div className="admin-product-view">
            {viewItem.image ? (
              <img src={resolveImageUrl(viewItem.image)} alt={viewItem.name} />
            ) : (
              <div
                style={{
                  width: 200,
                  height: 200,
                  background: "#E8F5E9",
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  color: "#6B7280",
                  fontSize: 13,
                }}
              >
                No image
              </div>
            )}
            <div>
              <h2>{viewItem.name}</h2>
              <p>{viewItem.description}</p>
              <strong>Rs {Number(viewItem.price).toLocaleString("en-IN")}</strong>
              {viewItem.category === "spices" && (
                <p style={{ marginTop: 8 }}>
                  <strong>Stock:</strong> {viewItem.stock != null ? viewItem.stock : "—"}
                </p>
              )}
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}

export function AdminModal({ title, onClose, children, maxWidth = 620 }) {
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal admin-modal--wide"
        style={{ maxWidth }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal__head">
          <h3 className="admin-modal__title">{title}</h3>
          <button type="button" className="admin-modal__x" onClick={onClose}>
            x
          </button>
        </div>
        <div className="admin-modal__body">{children}</div>
      </div>
    </div>
  );
}

function Thumb({ product }) {
  const src = resolveImageUrl(product.image);
  if (!src) {
    return (
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 10,
          background: "#E8F5E9",
          border: "2px solid #E8F5E9",
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={product.name}
      style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", border: "2px solid #E8F5E9" }}
    />
  );
}

function Status({ inStock }) {
  return (
    <span className={inStock ? "status-pill status-pill--ok" : "status-pill status-pill--danger"}>
      {inStock ? "In Stock" : "Out of Stock"}
    </span>
  );
}

function Actions({ product, onView, onEdit, onDelete }) {
  return (
    <div className="admin-row-actions">
      <button type="button" onClick={() => onView(product)} aria-label={`View ${product.name}`}>
        <Eye size={16} />
      </button>
      <button type="button" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`}>
        <Pencil size={16} />
      </button>
      <button type="button" onClick={() => onDelete(product)} aria-label={`Delete ${product.name}`}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}
