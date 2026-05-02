import { useEffect, useRef, useState } from "react";
import { Check, Home, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { authAPI, getApiErrorMessage, getLoginFailureMessage } from "@/lib/api";

export function formatDeliveryAddress(address) {
  const house = address.houseName || address.address_line_1 || address.houseNo;
  const line2 = address.street || address.address_line_2;
  const lm = address.landmark || address.locality;
  return (
    [house, line2, lm, address.city, address.state].filter(Boolean).join(", ") +
    (address.pincode ? ` - ${address.pincode}` : "")
  );
}

const emptyAddress = {
  houseName: "",
  street: "",
  pincode: "",
  landmark: "",
  city: "",
  state: "",
  isDefault: false,
};

function addressToFormState(editingAddress, hasAddresses) {
  if (editingAddress) {
    return {
      houseName: String(editingAddress.houseName || editingAddress.address_line_1 || "").trim(),
      street: String(editingAddress.street || editingAddress.address_line_2 || "").trim(),
      pincode: String(editingAddress.pincode || "").replace(/\D/g, "").slice(0, 6),
      landmark: String(editingAddress.landmark || "").trim(),
      city: String(editingAddress.city || "").trim(),
      state: String(editingAddress.state || "").trim(),
      isDefault: Boolean(editingAddress.isDefault),
    };
  }
  return { ...emptyAddress, isDefault: !hasAddresses };
}

/** Same card as Profile — edit, delete, set default callbacks provided by parent */
export function DeliveryAddressCard({ address, onDefault, onEdit, onDelete }) {
  return (
    <article style={{ ...addressCardStyle, borderColor: address.isDefault ? "#4CAF50" : "#D6E8D6" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <strong style={{ color: "#1A2E1A", display: "inline-flex", gap: 8, alignItems: "center", flex: 1, minWidth: 0 }}>
          <Home size={18} /> {address.houseName || address.houseNo || "Address"}
        </strong>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {address.isDefault && <span style={defaultBadgeStyle}>Default</span>}
          <button type="button" onClick={onEdit} title="Edit address" aria-label="Edit address" style={addressIconButtonStyle}>
            <Pencil size={18} />
          </button>
          <button type="button" onClick={onDelete} title="Delete address" aria-label="Delete address" style={addressIconDangerButtonStyle}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <p style={{ color: "#334533", lineHeight: 1.55, margin: "12px 0 16px" }}>{formatDeliveryAddress(address)}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" disabled={address.isDefault} onClick={onDefault} style={address.isDefault ? disabledAddressButtonStyle : defaultAddressButtonStyle}>
          Set Default Address
        </button>
      </div>
    </article>
  );
}

/** POST /food/delivery-addresses, PUT /food/delivery-addresses/:id — same as Profile */
export function DeliveryAddressModal({ editingAddress, hasAddresses, onAddressSaved, onClose }) {
  const { user: authUser } = useAuth();
  const isEdit = Boolean(editingAddress?.id);
  const [form, setForm] = useState(() => addressToFormState(editingAddress, hasAddresses));
  const [errors, setErrors] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pincodeLookupSeq = useRef(0);

  useEffect(() => {
    setForm(addressToFormState(editingAddress, hasAddresses));
    setErrors({});
  }, [editingAddress, hasAddresses]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const fetchPincodeArea = async (pc) => {
    if (!/^\d{6}$/.test(pc)) return;
    const seq = ++pincodeLookupSeq.current;
    setPincodeLoading(true);
    const info = await fetchIndianPincode(pc);
    if (seq !== pincodeLookupSeq.current) return;
    setPincodeLoading(false);
    setForm((c) => {
      if (c.pincode !== pc) return c;
      if (info && (info.city || info.state)) {
        return { ...c, city: (info.city || "").trim(), state: (info.state || "").trim() };
      }
      return { ...c, city: "", state: "" };
    });
  };

  const handlePincodeChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 6);
    if (digits.length < 6) {
      pincodeLookupSeq.current += 1;
      setPincodeLoading(false);
    }
    setForm((current) => {
      const next = { ...current, pincode: digits };
      if (digits.length < 6) {
        return { ...next, city: "", state: "" };
      }
      return next;
    });
    if (digits.length === 6) {
      void fetchPincodeArea(digits);
    }
  };

  const save = async () => {
    const nextErrors = {};
    if (!form.houseName.trim()) nextErrors.houseName = "House name is required";
    if (!form.street.trim()) nextErrors.street = "Street is required";
    if (!/^\d{6}$/.test(form.pincode)) nextErrors.pincode = "Enter a valid 6-digit pincode";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    if (!authUser?.token) {
      toast.error("Please sign in to save your address.");
      return;
    }

    const city = (form.city || "").trim();
    const state = (form.state || "").trim();

    const payload = {
      address_line_1: form.houseName.trim(),
      address_line_2: form.street.trim(),
      city,
      state,
      pincode: form.pincode,
      landmark: form.landmark.trim(),
      is_default: form.isDefault ? 1 : 0,
    };

    setSubmitting(true);
    try {
      let data;
      if (isEdit) {
        data = await authAPI.updateDeliveryAddress(editingAddress.id, payload);
        if (data?.success === false) {
          toast.error(getLoginFailureMessage(data, "Could not update address."));
          return;
        }
        toast.success(
          typeof data?.message === "string" && data.message.trim()
            ? data.message.trim()
            : "Address updated successfully!",
        );
      } else {
        data = await authAPI.addAddress(payload);
        if (data?.success === false) {
          toast.error(getLoginFailureMessage(data, "Could not save address."));
          return;
        }
        toast.success(
          typeof data?.message === "string" && data.message.trim()
            ? data.message.trim()
            : "Address saved successfully!",
        );
      }

      if (onAddressSaved) {
        await onAddressSaved();
      }
      onClose();
    } catch (e) {
      toast.error(getApiErrorMessage(e, isEdit ? "Could not update address." : "Could not save address."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} style={modalOverlayStyle}>
      <div onClick={(event) => event.stopPropagation()} style={modalCardStyle} className="modal-card">
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>{isEdit ? "Edit Address" : "Add Address"}</h2>
          <button type="button" onClick={onClose} style={modalCloseStyle}>
            x
          </button>
        </div>
        <div style={{ padding: 26 }}>
          <ModalField label="House Name *" error={errors.houseName}>
            <input value={form.houseName} onChange={(event) => update("houseName", event.target.value)} placeholder="e.g. Green Villa, Flat 4B" style={inputStyle} />
          </ModalField>
          <ModalField label="Street *" error={errors.street}>
            <input value={form.street} onChange={(event) => update("street", event.target.value)} placeholder="e.g. MG Road" style={inputStyle} />
          </ModalField>
          <ModalField label="Pincode *" error={errors.pincode}>
            <input
              value={form.pincode}
              maxLength={6}
              inputMode="numeric"
              autoComplete="postal-code"
              onChange={handlePincodeChange}
              placeholder="6-digit pincode"
              style={inputStyle}
            />
            {pincodeLoading && (
              <p style={{ color: "#607060", fontSize: 12, fontWeight: 700, margin: "8px 0 0" }}>
                Looking up city &amp; state…
              </p>
            )}
            <p style={{ color: "#607060", fontSize: 12, fontWeight: 600, margin: "8px 0 0", lineHeight: 1.4 }}>
              Enter a 6-digit pincode to auto-fill city and state. You can edit them if needed.
            </p>
          </ModalField>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 0 }}>
            <div style={{ flex: "1 1 160px", minWidth: 0 }}>
              <ModalField label="City">
                <input
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                  placeholder="Auto-filled from pincode"
                  style={inputStyle}
                  autoComplete="address-level2"
                />
              </ModalField>
            </div>
            <div style={{ flex: "1 1 160px", minWidth: 0 }}>
              <ModalField label="State">
                <input
                  value={form.state}
                  onChange={(event) => update("state", event.target.value)}
                  placeholder="Auto-filled from pincode"
                  style={inputStyle}
                  autoComplete="address-level1"
                />
              </ModalField>
            </div>
          </div>
          <ModalField label="Landmark">
            <input value={form.landmark} onChange={(event) => update("landmark", event.target.value)} placeholder="e.g. Near City Mall" style={inputStyle} />
          </ModalField>
          <button
            type="button"
            onClick={() => update("isDefault", !form.isDefault)}
            style={{ ...defaultToggleStyle, borderColor: form.isDefault ? "#4CAF50" : "#D6E8D6", background: form.isDefault ? "#F1F8F1" : "#FFFFFF" }}
          >
            <span style={{ ...checkboxStyle, background: form.isDefault ? "#4CAF50" : "#FFFFFF" }}>{form.isDefault ? <Check size={15} /> : null}</span>
            Set as Default
          </button>
        </div>
        <div style={modalFooterStyle}>
          <button type="button" onClick={onClose} style={outlineButtonStyle} disabled={submitting}>
            Cancel
          </button>
          <button type="button" onClick={save} disabled={submitting} style={{ ...saveButtonStyle, opacity: submitting ? 0.8 : 1, cursor: submitting ? "wait" : "pointer" }}>
            {submitting ? (isEdit ? "Updating…" : "Saving…") : isEdit ? "Update Address" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function fetchIndianPincode(pincode) {
  if (!/^\d{6}$/.test(pincode)) return null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!res.ok) return null;
    const json = await res.json();
    const root = Array.isArray(json) ? json[0] : json;
    if (!root || typeof root !== "object") return null;
    if (String(root.Status || "").toLowerCase() !== "success") return null;
    const offices = root.PostOffice;
    if (!Array.isArray(offices) || !offices.length) return null;
    const po = offices.find((o) => /delivery/i.test(String(o?.DeliveryStatus || ""))) || offices[0];
    const city = String(po.District || po.Name || po.Division || "").trim();
    const state = String(po.State || "").trim();
    if (!city && !state) return null;
    return { city, state };
  } catch {
    return null;
  }
}

function ModalField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ color: "#1A2E1A", fontSize: 14, fontWeight: 800, marginBottom: 7, display: "block" }}>{label}</label>
      {children}
      {error && <p style={{ color: "#B91C1C", fontSize: 12, fontWeight: 800, margin: "6px 0 0" }}>{error}</p>}
    </div>
  );
}

const addressCardStyle = { border: "2px solid #D6E8D6", borderRadius: 16, padding: 18, background: "#FBFEFB" };
const defaultBadgeStyle = { background: "#E8F5E9", color: "#2E7D32", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 900 };
const addressIconButtonStyle = { background: "#F1F8F1", border: "1px solid #C8E6C9", color: "#2E7D32", borderRadius: 10, width: 38, height: 38, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const addressIconDangerButtonStyle = { background: "#FFF5F5", border: "1px solid #FECACA", color: "#EF4444", borderRadius: 10, width: 38, height: 38, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const defaultAddressButtonStyle = { background: "#FFFFFF", border: "1px solid #4CAF50", color: "#2E7D32", borderRadius: 10, padding: "8px 10px", fontSize: 12, fontWeight: 900, cursor: "pointer" };
const disabledAddressButtonStyle = { ...defaultAddressButtonStyle, background: "#E8F5E9", cursor: "default", opacity: 0.75 };
const modalOverlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 9999, padding: "20px", overflowY: "auto" };
const modalCardStyle = { background: "#FFFFFF", borderRadius: 24, width: "calc(100% - 32px)", maxWidth: 540, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.18)", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", scrollbarWidth: "none", msOverflowStyle: "none" };
const modalHeaderStyle = { background: "linear-gradient(135deg,#4CAF50,#388E3C)", padding: "22px 26px", borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const modalTitleStyle = { color: "#FFFFFF", fontSize: 20, fontWeight: 900, margin: 0 };
const modalCloseStyle = { background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF", width: 36, height: 36, borderRadius: "50%", fontSize: 20, cursor: "pointer", display: "grid", placeItems: "center", fontWeight: 900, lineHeight: 1 };
const modalFooterStyle = { padding: "16px 26px 24px", borderTop: "1px solid #EEF5EE", display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" };
const outlineButtonStyle = { background: "#FFFFFF", color: "#2E7D32", border: "2px solid #4CAF50", borderRadius: 12, padding: "11px 18px", fontWeight: 900, cursor: "pointer" };
const saveButtonStyle = { background: "linear-gradient(135deg,#4CAF50,#388E3C)", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "12px 18px", fontWeight: 900, cursor: "pointer" };
const defaultToggleStyle = { width: "100%", border: "2px solid #D6E8D6", borderRadius: 12, padding: "13px 14px", display: "flex", alignItems: "center", gap: 10, color: "#1A2E1A", fontWeight: 900, cursor: "pointer" };
const checkboxStyle = { width: 22, height: 22, borderRadius: 6, border: "2px solid #4CAF50", color: "#FFFFFF", display: "grid", placeItems: "center", flexShrink: 0 };
const inputStyle = { width: "100%", boxSizing: "border-box", background: "#FFFFFF", border: "2px solid #D6E8D6", borderRadius: 12, padding: "12px 14px", color: "#1A1A1A", fontSize: 15, outline: "none", fontWeight: 700 };
