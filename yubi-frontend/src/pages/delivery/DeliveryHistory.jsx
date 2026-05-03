import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, IndianRupee, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { deliveryPartnerAPI, getApiErrorMessage } from "../../lib/api";
import { getCurrentDeliveryPartner, getDeliveryPartnerIdFromSession } from "../../utils/deliveryState";

function formatMoney(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : String(v ?? "—");
}

function formatDate(raw) {
  if (!raw) return "—";
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleString();
}

/** Strip internal id fields for display rows (order id not shown per product requirement). */
function rowForDisplay(order) {
  const {
    order_id: _oid,
    order_item_id: _oi,
    user_id: _uid,
    delivery_partner_id: _dp,
    ...rest
  } = order;
  return rest;
}

export default function DeliveryHistory() {
  const partner = getCurrentDeliveryPartner();
  const dpId = getDeliveryPartnerIdFromSession();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const headers = ["Customer", "Amount", "Payment", "Date", "Status"];

  const load = useCallback(async () => {
    if (!dpId) {
      toast.error("Missing delivery partner id. Please log in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await deliveryPartnerAPI.getOrderHistory(dpId);
      if (res?.status === "error" || res?.success === false) {
        toast.error(res?.message || "Could not load history.");
        setRows([]);
        return;
      }
      const list = Array.isArray(res?.orders) ? res.orders : [];
      setRows(list);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not load order history."));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [dpId]);

  useEffect(() => {
    load();
  }, [load]);

  const delivered = rows.filter((o) => String(o.status).toLowerCase() === "delivered").length;
  const earnings = rows.reduce((total, order) => total + Number(order.total_amount ?? order.total ?? 0), 0);

  return (
    <div style={{ color: "#1A1A1A" }}>
      <div style={head}>
        <div>
          <h1 style={title}>Delivery History</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontWeight: 700 }}>
            {partner.name}'s assigned delivery records
          </p>
        </div>
      </div>
      <div style={statsGrid}>
        <Stat icon={PackageCheck} label="Records" value={loading ? "…" : rows.length} />
        <Stat icon={CheckCircle2} label="Delivered" value={loading ? "…" : delivered} />
        <Stat
          icon={IndianRupee}
          label="Order value"
          value={loading ? "…" : `Rs ${earnings.toFixed(2)}`}
        />
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {[...headers, "Action"].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => {
              const customer = order.customer_name ?? order.customerName ?? "—";
              const amount = formatMoney(order.total_amount ?? order.total);
              const pay = order.payment_method ?? order.paymentMethod ?? "—";
              const when = formatDate(order.created_at ?? order.createdAt);
              const status = order.status ?? order.orderStatus ?? "—";
              const key = order.order_id ?? `${customer}-${when}`;
              return (
                <tr key={key}>
                  {[customer, `Rs ${amount}`, pay, when, status].map((value, index) => (
                    <td key={`${key}-${headers[index]}`} data-label={headers[index]}>
                      {value}
                    </td>
                  ))}
                  <td data-label="Action">
                    <button
                      type="button"
                      onClick={() => setSelected(rowForDisplay(order))}
                      className="admin-view-btn"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!loading && !rows.length && (
        <div style={empty}>No delivery history found for {partner.name}.</div>
      )}

      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3 className="admin-modal__title">Delivery details</h3>
            </div>
            <div className="admin-modal__body">
              {Object.entries(selected).map(([k, v]) => (
                <div key={k} className="admin-modal__row">
                  <span className="admin-modal__label">{k.replace(/_/g, " ")}</span>
                  <span className="admin-modal__value">{String(v ?? "—")}</span>
                </div>
              ))}
            </div>
            <div className="admin-modal__foot">
              <button type="button" onClick={() => setSelected(null)} className="admin-modal__close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div style={statCard}>
      <div style={statIcon}>
        <Icon size={22} />
      </div>
      <div>
        <strong style={{ color: "#1A2E1A", fontSize: 20 }}>{value}</strong>
        <div style={{ color: "#6B7280", fontWeight: 800, fontSize: 13 }}>{label}</div>
      </div>
    </div>
  );
}

const head = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 16,
};
const title = {
  color: "#1A2E1A",
  margin: 0,
  fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
};
const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
  marginBottom: 16,
};
const statCard = {
  background: "#FFFFFF",
  border: "1px solid #D6E8D6",
  borderRadius: 16,
  padding: 16,
  display: "flex",
  alignItems: "center",
  gap: 12,
  boxShadow: "0 12px 28px rgba(26,46,26,.07)",
};
const statIcon = {
  width: 42,
  height: 42,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  background: "#E8F5E9",
  color: "#4CAF50",
};
const empty = {
  marginTop: 16,
  padding: 20,
  borderRadius: 16,
  border: "1px dashed #A5D6A7",
  background: "#FFFFFF",
  color: "#1A2E1A",
  fontWeight: 800,
  textAlign: "center",
};
