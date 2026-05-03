import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { deliveryPartnerAPI, getApiErrorMessage } from "../../lib/api";

const TOAST = 4000;

export default function DeliveryChangePasswordModal({ open, onClose, defaultPhone = "" }) {
  const [phone, setPhone] = useState(defaultPhone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPhone(defaultPhone);
      setCurrentPassword("");
      setNewPassword("");
    }
  }, [open, defaultPhone]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    const trimmedPhone = phone.trim().replace(/\s/g, "");
    if (!trimmedPhone || !currentPassword || !newPassword) {
      toast.error("Fill in mobile number, current password, and new password.", { duration: TOAST });
      return;
    }
    setLoading(true);
    try {
      const res = await deliveryPartnerAPI.changePassword({
        phone: trimmedPhone,
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res?.status === "error" || res?.success === false) {
        toast.error(res?.message || "Could not change password.", { duration: TOAST });
        return;
      }
      toast.success(res?.message || "Password changed successfully.", { duration: TOAST });
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not change password."), { duration: TOAST });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(ev) => ev.stopPropagation()}>
        <div style={modalHead}>
          <h2 style={modalTitle}>Change password</h2>
          <button type="button" style={iconBtn} onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label style={lab}>Mobile number</label>
          <input
            style={inp}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
          />
          <label style={lab}>Recent password</label>
          <input
            style={inp}
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
          />
          <label style={lab}>New password</label>
          <input
            style={inp}
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
          />
          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? "Updating…" : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 4000,
  padding: 16,
};
const modal = {
  background: "#FFFFFF",
  borderRadius: 20,
  padding: 24,
  maxWidth: 420,
  width: "100%",
  border: "1px solid #D6E8D6",
  boxShadow: "0 24px 70px rgba(26,46,26,0.18)",
};
const modalHead = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};
const modalTitle = {
  margin: 0,
  color: "#1A2E1A",
  fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
  fontSize: 22,
};
const iconBtn = {
  border: "none",
  background: "#F3F4F6",
  borderRadius: 10,
  padding: 8,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};
const lab = {
  display: "block",
  fontSize: 12,
  fontWeight: 800,
  color: "#6B7280",
  marginBottom: 6,
};
const inp = {
  width: "100%",
  boxSizing: "border-box",
  padding: 12,
  border: "1px solid #D6E8D6",
  borderRadius: 12,
  marginBottom: 14,
  fontWeight: 700,
};
const submitBtn = {
  width: "100%",
  marginTop: 8,
  background: "#4CAF50",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 12,
  padding: 14,
  fontWeight: 900,
  cursor: "pointer",
};
