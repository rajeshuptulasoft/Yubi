import { useEffect, useState } from "react";
import { toast } from "sonner";
import { foodAPI, getApiErrorMessage } from "@/lib/api";

const DEFAULT_CODE = "DELAYED_DELIVERY";
const DEFAULT_REASON = "Order is too late, I no longer need it";

/**
 * POST /food/cancel-order — JSON { order_id, cancel_code, reason, review? }
 * `review` is optional user feedback for the cancellation.
 */
export default function OrderCancelModal({ orderId, open, onClose, onCancelled }) {
  const [cancelCode, setCancelCode] = useState(DEFAULT_CODE);
  const [reason, setReason] = useState(DEFAULT_REASON);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCancelCode(DEFAULT_CODE);
      setReason(DEFAULT_REASON);
      setReview("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = async () => {
    if (orderId == null || orderId === "") return;
    const code = cancelCode.trim();
    const text = reason.trim();
    if (!code || !text) {
      toast.error("Enter cancel code and reason.");
      return;
    }
    setSubmitting(true);
    try {
      const oid = Number(orderId);
      const payload = {
        order_id: Number.isFinite(oid) ? oid : orderId,
        cancel_code: code,
        reason: text,
      };
      const reviewTrim = review.trim();
      if (reviewTrim) payload.review = reviewTrim;
      const res = await foodAPI.cancelOrder(payload);
      if (res && typeof res === "object" && res.success === false) {
        toast.error(getApiErrorMessage(res, "Could not cancel order."));
        return;
      }
      toast.success("Order cancelled successfully.");
      onCancelled?.();
      onClose();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not cancel order."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div role="presentation" style={overlay} onClick={onClose}>
      <div role="dialog" aria-modal="true" style={panel} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 16px", color: "#1A2E1A", fontSize: 18 }}>Cancel this order?</h2>
        <p style={{ color: "#607060", fontSize: 14, marginBottom: 16 }}>
          Provide a cancel code and reason. Add an optional review if you like.
        </p>
        <label style={label}>
          Cancel code
          <input
            type="text"
            value={cancelCode}
            onChange={(e) => setCancelCode(e.target.value)}
            style={input}
            placeholder={DEFAULT_CODE}
            autoComplete="off"
          />
        </label>
        <label style={label}>
          Reason
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ ...input, minHeight: 88, resize: "vertical" }}
            placeholder={DEFAULT_REASON}
          />
        </label>
        <label style={{ ...label, marginBottom: 20 }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            Review
            <span style={{ fontWeight: 600, color: "#9E9E9E", fontSize: 11 }}>(optional)</span>
          </span>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            style={{ ...input, minHeight: 72, resize: "vertical" }}
            placeholder="Any extra feedback about your experience…"
            autoComplete="off"
          />
        </label>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" onClick={onClose} style={secondaryBtn} disabled={submitting}>
            Back
          </button>
          <button type="button" onClick={() => void submit()} style={dangerBtn} disabled={submitting}>
            {submitting ? "Cancelling…" : "Cancel order"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 1001,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};
const panel = {
  background: "#FFFFFF",
  borderRadius: 16,
  maxWidth: 440,
  width: "100%",
  padding: 24,
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};
const label = { display: "block", fontSize: 12, fontWeight: 800, color: "#607060", marginBottom: 16 };
const input = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #D6E8D6",
  fontSize: 14,
  boxSizing: "border-box",
};
const secondaryBtn = {
  background: "#FFFFFF",
  color: "#1A2E1A",
  border: "2px solid #D6E8D6",
  borderRadius: 10,
  padding: "10px 18px",
  fontWeight: 700,
  cursor: "pointer",
};
const dangerBtn = {
  background: "#C62828",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontWeight: 800,
  cursor: "pointer",
};
