import { useState } from "react";
import { CalendarDays, CheckCircle2, IndianRupee, PackageCheck } from "lucide-react";
import { orders } from "../../data";
import { getCurrentDeliveryPartner } from "../../utils/deliveryState";

export default function DeliveryHistory() {
  const partner = getCurrentDeliveryPartner();
  const rows = orders.filter((order) => order.deliveryPartnerId === partner.id);
  const [selected, setSelected] = useState(null);
  const headers = ["Order ID", "Customer", "Amount", "Payment Method", "Date", "Status"];
  const delivered = rows.filter((order) => order.orderStatus === "Delivered").length;
  const earnings = rows.reduce((total, order) => total + Number(order.total || 0), 0);

  return <div style={{ color: "#1A1A1A" }}>
    <div style={head}>
      <div>
        <h1 style={title}>Delivery History</h1>
        <p style={{ margin: "4px 0 0", color: "#6B7280", fontWeight: 700 }}>{partner.name}'s assigned delivery records</p>
      </div>
    </div>
    <div style={statsGrid}>
      <Stat icon={PackageCheck} label="Assigned" value={rows.length} />
      <Stat icon={CheckCircle2} label="Delivered" value={delivered} />
      <Stat icon={IndianRupee} label="Order Value" value={`Rs ${earnings}`} />
    </div>
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr>{[...headers, "Action"].map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>
          {rows.map((order) => <tr key={order.id}>{[order.id, order.customerName, `Rs ${order.total}`, order.paymentMethod, new Date(order.createdAt).toLocaleDateString(), order.orderStatus].map((value, index) => <td key={`${order.id}-${headers[index]}`} data-label={headers[index]}>{value}</td>)}<td data-label="Action"><button onClick={() => setSelected(order)} className="admin-view-btn">View</button></td></tr>)}
        </tbody>
      </table>
    </div>
    {!rows.length && <div style={empty}>No delivery history found for {partner.name}.</div>}
    {selected && <div className="admin-modal-backdrop" onClick={() => setSelected(null)}><div className="admin-modal" onClick={(event) => event.stopPropagation()}><div className="admin-modal__head"><h3 className="admin-modal__title">Delivery Details</h3></div><div className="admin-modal__body"><div className="admin-modal__row"><span className="admin-modal__label">Order</span><span className="admin-modal__value">{selected.id}</span></div><div className="admin-modal__row"><span className="admin-modal__label">Customer</span><span className="admin-modal__value">{selected.customerName}</span></div><div className="admin-modal__row"><span className="admin-modal__label">Phone</span><span className="admin-modal__value">{selected.customerPhone}</span></div><div className="admin-modal__row"><span className="admin-modal__label">Address</span><span className="admin-modal__value">{selected.customerAddress}</span></div><div className="admin-modal__row"><span className="admin-modal__label">Total</span><span className="admin-modal__value">Rs {selected.total}</span></div><div className="admin-modal__row"><span className="admin-modal__label">Status</span><span className="admin-modal__value">{selected.orderStatus}</span></div></div><div className="admin-modal__foot"><button onClick={() => setSelected(null)} className="admin-modal__close">Close</button></div></div></div>}
  </div>;
}

function Stat({ icon: Icon, label, value }) {
  return <div style={statCard}><div style={statIcon}><Icon size={22} /></div><div><strong style={{ color: "#1A2E1A", fontSize: 20 }}>{value}</strong><div style={{ color: "#6B7280", fontWeight: 800, fontSize: 13 }}>{label}</div></div></div>;
}

const head = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 };
const title = { color: "#1A2E1A", margin: 0, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 };
const statCard = { background: "#FFFFFF", border: "1px solid #D6E8D6", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 12px 28px rgba(26,46,26,.07)" };
const statIcon = { width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "#E8F5E9", color: "#4CAF50" };
const empty = { marginTop: 16, padding: 20, borderRadius: 16, border: "1px dashed #A5D6A7", background: "#FFFFFF", color: "#1A2E1A", fontWeight: 800, textAlign: "center" };
