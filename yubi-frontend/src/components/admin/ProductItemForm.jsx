import { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

/** Multipart `category` — distinct values for Food vs Spices */
const categoryFormValue = (type) => (type === "food" ? "food" : "spices");

function inferInStock(initial) {
  if (initial == null) return true;
  const v = initial.is_available ?? initial.in_stock ?? initial.inStock;
  if (v === 0 || v === false || v === "0") return false;
  if (v === 1 || v === true || v === "1") return true;
  return true;
}

const emptyForm = (type, initial = null) => {
  const priceVal = initial?.price != null ? String(initial.price) : "";
  const stockVal = initial?.stock != null && initial.stock !== "" ? String(initial.stock) : "";
  const inStock = inferInStock(initial);
  return {
    name: String(initial?.name ?? initial?.product_name ?? "").trim(),
    price: priceVal,
    description: String(initial?.description ?? "").trim(),
    inStock: Boolean(inStock),
    stock: type === "spices" ? stockVal : "",
    imageFile: null,
  };
};

/**
 * @param {object} props
 * @param {"food"|"spices"} props.type
 * @param {object} [props.initialItem] — existing product for edit
 * @param {string} [props.initialImageUrl] — resolved URL for image preview on edit
 * @param {string} props.submitLabel
 * @param {(formData: FormData) => Promise<void>} props.onSubmit
 * @param {() => void} props.onCancel
 */
export default function ProductItemForm({
  type = "food",
  initialItem = null,
  initialImageUrl = "",
  submitLabel = "Save Item",
  onSubmit,
  onCancel,
}) {
  const fileRef = useRef(null);
  const [form, setForm] = useState(() => emptyForm(type, initialItem));
  const [imagePreview, setImagePreview] = useState(() => (!initialItem ? "" : initialImageUrl || ""));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    setForm(emptyForm(type, initialItem));
    setImagePreview(!initialItem ? "" : initialImageUrl || "");
    setErrors({});
    setApiError("");
  }, [type, initialItem, initialImageUrl]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const onPickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
    update("imageFile", file);
  };

  const clearPickedFile = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(initialItem ? initialImageUrl || "" : "");
    update("imageFile", null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const validate = () => {
    const next = {};
    if (!String(form.name || "").trim()) next.name = "Name is required";
    if (!String(form.description || "").trim()) next.description = "Description is required";
    const p = Number(form.price);
    if (!form.price && form.price !== 0) next.price = "Price is required";
    else if (!Number.isFinite(p) || p < 0) next.price = "Enter a valid price";
    if (!initialItem && !form.imageFile) next.image = "Product image is required";
    if (type === "spices") {
      const s = Number(form.stock);
      if (form.stock === "" && form.stock !== 0) next.stock = "Stock quantity is required";
      else if (!Number.isFinite(s) || s < 0) next.stock = "Enter a valid stock amount";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("product_name", form.name.trim());
    fd.append("description", form.description.trim());
    fd.append("category", categoryFormValue(type));
    fd.append("price", String(form.price).trim());
    fd.append("is_available", form.inStock ? "1" : "0");
    if (type === "spices") {
      fd.append("stock", String(Math.max(0, Math.floor(Number(form.stock)))));
    }
    if (form.imageFile) {
      fd.append("image", form.imageFile);
    }
    return fd;
  };

  const submit = async (event) => {
    event.preventDefault();
    setApiError("");
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(buildFormData());
    } catch (error) {
      setApiError(
        error?.message ||
          error?.error ||
          (typeof error === "string" ? error : "Unable to save. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="admin-product-form">
      {apiError && <div className="admin-form-error">{apiError}</div>}
      <p className="admin-form-hint" style={{ marginTop: 0, color: "#4B5563", fontSize: 13 }}>
        Category (sent as <code>{categoryFormValue(type)}</code>):{" "}
        <strong>{type === "food" ? "Food" : "Spices"}</strong>
      </p>
      <FormField label="Name" error={errors.name}>
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Product name"
          autoComplete="off"
        />
      </FormField>
      <FormField label="Description" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Description"
        />
      </FormField>
      <div className="admin-form-grid">
        <FormField label="Price" error={errors.price}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="0"
          />
        </FormField>
        {type === "spices" && (
          <FormField label="Stock (quantity)" error={errors.stock}>
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              placeholder="0"
            />
          </FormField>
        )}
      </div>
      <FormField label="In stock">
        <label className="admin-toggle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Stock available</span>
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => update("inStock", e.target.checked)}
          />
        </label>
      </FormField>
      <FormField label="Image" error={errors.image}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button type="button" className="image-picker" onClick={() => fileRef.current?.click()}>
            {imagePreview ? (
              <img src={imagePreview} alt="Product preview" />
            ) : (
              <>
                <ImagePlus size={28} /> Upload product image
              </>
            )}
          </button>
          {initialItem && form.imageFile && initialImageUrl && (
            <button type="button" className="admin-secondary-btn" onClick={clearPickedFile}>
              Revert to current image
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} hidden />
          {initialItem && !form.imageFile && initialImageUrl && (
            <small style={{ color: "#6B7280" }}>Leave image unchanged, or pick a new file to replace.</small>
          )}
        </div>
      </FormField>
      <div className="admin-form-actions">
        <button type="button" className="admin-secondary-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="admin-add-btn" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function FormField({ label, error, children }) {
  return (
    <label className="admin-form-field">
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
