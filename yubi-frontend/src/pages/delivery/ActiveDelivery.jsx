import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, IndianRupee, MapPin, Navigation, PackageCheck, Phone, Truck } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { orders } from "../../data";
import { getCurrentDeliveryPartner, getDeliveryPartners, saveDeliveryPartners } from "../../utils/deliveryState";

const steps = ["Reached at Restaurant", "Picked Up the Parcel", "On the Way to Customer", "Reached at Destination", "Order Delivered"];

export default function ActiveDelivery() {
  const partner = getCurrentDeliveryPartner();
  const [order, setOrder] = useState(orders.find((item) => item.deliveryPartnerId === partner.id && item.orderStatus !== "Delivered") || orders.find((item) => item.deliveryPartnerId === partner.id) || null);
  const [step, setStep] = useState(0);
  const [qr, setQr] = useState(false);
  const [success, setSuccess] = useState(false);
  const [onlineMark, setOnlineMark] = useState(false);
  const [trip, setTrip] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  function startLocationSharing(orderId) {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        import("../../lib/firebase").then(({ database }) => {
          import("firebase/database").then(({ ref, set }) => {
            set(ref(database, `deliveries/${orderId}/location`), {
              lat: latitude,
              lng: longitude,
              updatedAt: Date.now(),
              partnerName: partner.name,
              status: "On the Way",
            });
          });
        });
      },
      (error) => console.error("Location error:", error),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 },
    );

    setWatchId(id);
    setIsTracking(true);
  }

  function stopLocationSharing() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
    }
  }

  const complete = () => {
    setStep(4);
    setSuccess(true);
    setOrder({ ...order, orderStatus: "Delivered" });
    saveDeliveryPartners(getDeliveryPartners().map((item) => (item.id === partner.id ? { ...item, status: "Available", currentOrderId: null } : item)));
    setOnlineMark(true);
    stopLocationSharing();
  };

  const startNavigation = () => {
    const destination = encodeURIComponent(order.customerAddress);
    window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    startLocationSharing(order.id);
    let progress = 0;
    const id = setInterval(() => {
      progress += 25;
      setTrip(progress);
      if (progress >= 100) {
        clearInterval(id);
        setStep(3);
      }
    }, 1000);
  };

  const click = () => {
    if (!order) return;
    if (step === 1) {
      startLocationSharing(order.id);
      setStep(step + 1);
      return;
    }
    if (step === 2) {
      startNavigation();
      return;
    }
    if (step === 3) {
      if (order.paymentMethod === "COD") setQr(true);
      else setStep(4);
    } else setStep(step + 1);
  };

  return <div style={{ color: "#1A1A1A" }}>
    <section style={activeHero}>
      <div>
        <div style={heroEyebrow}>Delivery Mission</div>
        <h1 style={heroTitle}>Active Delivery</h1>
        <p style={heroText}>{order ? `${partner.name}, keep this order moving step by step.` : `No active delivery is assigned to ${partner.name} right now.`}</p>
      </div>
      {order && <div style={heroBadge}><PackageCheck size={18} />{order.id}</div>}
    </section>

    {!order && <div style={emptyCard}><PackageCheck size={34} /><strong>No active delivery</strong><span>Assigned orders for this partner will appear here.</span></div>}
    {order && isTracking && <div style={trackingBanner}><MapPin size={18} />Live location sharing active</div>}

    {order && <div style={activeGrid}>
      <div style={orderShell}><ActiveOrderCard order={order} /></div>
      <div style={routeCard}>
        <div style={routeIcon}><Navigation size={24} /></div>
        <h2 style={routeTitle}>Route Progress</h2>
        <p style={routeText}>{step >= 3 ? "Almost there. Complete the payment and delivery handoff." : "Follow the delivery checklist to keep admin and customer updated."}</p>
        <div style={progressTrack}><div style={{ ...progressBar, width: `${success ? 100 : Math.max(8, (step / 4) * 100)}%` }} /></div>
        <div style={routeMeta}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Clock size={15} />ETA 34 min</span><strong>{success ? "Completed" : `${Math.round((step / 4) * 100)}%`}</strong></div>
      </div>
    </div>}

    {order && <div style={stepsCard}>
      <h2 style={sectionTitle}>Delivery Checklist</h2>
      {steps.map((label, index) => (
        <div key={label} style={{ ...stepRow, borderColor: index === step && !success ? "#A5D6A7" : "#E8F5E9", background: index === step && !success ? "#F6FFF6" : "#FFFFFF" }}>
          <div style={{ ...stepDot, background: index < step || success ? "#4CAF50" : index === step ? "#A5D6A7" : "#EEEEEE", color: index <= step || success ? "#FFFFFF" : "#888888" }}>{index < step || success ? "✓" : index + 1}</div>
          <div style={{ flex: 1, color: index <= step ? "#1A2E1A" : "#888888", fontWeight: index === step ? 800 : 600, minWidth: 160, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>{label}</div>
          {index === step && !success && index < 4 && <button onClick={click} style={btn}>{index === 1 ? "Picked Up" : label}</button>}
          {index === 4 && step === 4 && !success && <button onClick={complete} style={btn}>Mark as Delivered</button>}
        </div>
      ))}
      {step === 2 && trip > 0 && trip < 100 && <div style={{ marginTop: 10 }}><div style={{ fontWeight: 700, color: "#1A2E1A", marginBottom: 6 }}>Moving towards customer: {trip}%</div><div style={progressTrack}><div style={{ ...progressBar, width: `${trip}%` }} /></div></div>}
    </div>}

    {order && currentLocation && <div style={{ marginTop: 24, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
      <MapContainer center={[currentLocation.lat, currentLocation.lng]} zoom={15} style={{ height: 250, width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <Marker position={[currentLocation.lat, currentLocation.lng]}><Popup>Your current location</Popup></Marker>
      </MapContainer>
    </div>}

    {order && success && <div style={successCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}><CheckCircle2 size={22} />Order Delivered Successfully! Partner status: {onlineMark ? "Available" : ""}</div>
      <div style={{ marginTop: 10 }}>Order ID: {order.id} | Customer: {order.customerName} | Amount: Rs {order.total} | Time taken: 34 min</div>
      <Link to="/delivery-partner/dashboard" style={backLink}>Back to Dashboard</Link>
    </div>}

    {order && qr && <div style={backdrop}>
      <div style={modal}>
        <h2 style={{ color: "#1A2E1A", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>Collect Payment from Customer</h2>
        <h3 style={{ color: "#4CAF50" }}>Amount to collect: Rs {order.total}</h3>
        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=yubifoods@upi%26am=${order.total}%26cu=INR`} alt="UPI QR" style={{ width: 250, height: 250 }} />
        <p style={{ color: "#1A1A1A" }}>Show this QR to customer for UPI payment</p>
        <button onClick={() => { setQr(false); complete(); }} style={{ ...btn, width: "100%" }}>Payment Received - Mark as Delivered</button>
      </div>
    </div>}
  </div>;
}

function ActiveOrderCard({ order }) {
  return <article style={activeOrderCard}>
    <div style={activeOrderTop}>
      <div>
        <div style={orderIdRow}><span style={orderId}>{order.id}</span><span style={typePill}>{order.orderType}</span></div>
        <div style={customerName}>{order.customerName}</div>
      </div>
      <span style={paymentPill}>{order.paymentMethod}</span>
    </div>

    <div style={detailGrid}>
      <div style={detailItem}><Phone size={17} /><span>{order.customerPhone}</span></div>
      <div style={detailItem}><IndianRupee size={17} /><span>Rs {order.total}</span></div>
      <div style={{ ...detailItem, gridColumn: "1 / -1", alignItems: "flex-start" }}><MapPin size={17} /><span>{order.customerAddress}</span></div>
    </div>

    <div style={itemsBox}>
      <div style={itemsLabel}>Items</div>
      <strong>{order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}</strong>
    </div>

    <div style={actionRow}>
      <Link to="/delivery-partner/active" style={primaryAction}><Truck size={18} />Continue Delivery</Link>
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerAddress)}`} style={secondaryAction}><Navigation size={17} />Map</a>
    </div>
  </article>;
}

const activeHero = { background: "linear-gradient(135deg,#1A2E1A,#4CAF50)", color: "#FFFFFF", borderRadius: 20, padding: 22, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", boxShadow: "0 18px 44px rgba(26,46,26,0.18)" };
const heroEyebrow = { color: "#D9F99D", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 };
const heroTitle = { margin: "6px 0", fontSize: 32, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" };
const heroText = { margin: 0, color: "#F1F8F1", lineHeight: 1.5, maxWidth: 560 };
const heroBadge = { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.24)", borderRadius: 999, padding: "9px 13px", fontWeight: 900 };
const activeGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, alignItems: "stretch" };
const orderShell = { background: "linear-gradient(145deg,#FFFFFF,#F5FFF5)", border: "1px solid #D6E8D6", borderRadius: 22, padding: 12, boxShadow: "0 18px 38px rgba(26,46,26,.1)" };
const activeOrderCard = { background: "#FFFFFF", border: "1px solid #DDEEDD", borderRadius: 20, padding: 20, height: "100%", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)", color: "#1A1A1A" };
const activeOrderTop = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 18 };
const orderIdRow = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" };
const orderId = { color: "#102510", fontSize: 30, fontWeight: 950, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", lineHeight: 1 };
const typePill = { background: "#E8F5E9", color: "#2E7D32", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900, textTransform: "uppercase" };
const customerName = { marginTop: 8, color: "#4B5563", fontSize: 16, fontWeight: 800 };
const paymentPill = { background: "#FFE8C7", color: "#111827", padding: "10px 17px", borderRadius: 999, fontWeight: 950, boxShadow: "0 8px 18px rgba(245,158,11,0.16)" };
const detailGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 14 };
const detailItem = { display: "flex", alignItems: "center", gap: 9, background: "#F8FCF8", border: "1px solid #E3F1E3", borderRadius: 13, padding: "11px 12px", color: "#1A2E1A", fontWeight: 800, lineHeight: 1.35 };
const itemsBox = { background: "linear-gradient(135deg,#F1F8F1,#FFFFFF)", border: "1px solid #D6E8D6", borderRadius: 15, padding: 14, color: "#1A2E1A", marginBottom: 16 };
const itemsLabel = { color: "#6B7280", fontSize: 12, fontWeight: 900, textTransform: "uppercase", marginBottom: 5 };
const actionRow = { display: "flex", gap: 10, flexWrap: "wrap" };
const primaryAction = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, flex: "1 1 210px", background: "linear-gradient(135deg,#4CAF50,#2E7D32)", color: "#FFFFFF", padding: "13px 16px", borderRadius: 13, textDecoration: "none", fontWeight: 950, boxShadow: "0 10px 22px rgba(76,175,80,0.24)" };
const secondaryAction = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, flex: "1 1 110px", background: "#FFFFFF", color: "#2E7D32", border: "2px solid #4CAF50", padding: "11px 14px", borderRadius: 13, textDecoration: "none", fontWeight: 950 };
const routeCard = { background: "#FFFFFF", border: "1px solid #D6E8D6", borderRadius: 20, padding: 20, boxShadow: "0 14px 30px rgba(26,46,26,.08)", display: "flex", flexDirection: "column", justifyContent: "center" };
const routeIcon = { width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", background: "#E8F5E9", color: "#4CAF50", marginBottom: 14 };
const routeTitle = { color: "#1A2E1A", margin: 0, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" };
const routeText = { color: "#6B7280", lineHeight: 1.5, fontWeight: 700 };
const progressTrack = { height: 10, borderRadius: 999, background: "#E5E7EB", overflow: "hidden" };
const progressBar = { height: "100%", background: "linear-gradient(90deg,#4CAF50,#8BC34A)", transition: "width .25s ease" };
const routeMeta = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 12, color: "#1A2E1A", fontWeight: 900 };
const stepsCard = { background: "#FFFFFF", borderRadius: 20, padding: 20, marginTop: 16, border: "1px solid #D6E8D6", boxShadow: "0 14px 30px rgba(26,46,26,.07)" };
const sectionTitle = { color: "#1A2E1A", margin: "0 0 14px", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" };
const stepRow = { display: "flex", gap: 14, alignItems: "center", marginBottom: 12, flexWrap: "wrap", border: "1px solid #E8F5E9", borderRadius: 14, padding: 12 };
const stepDot = { width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 };
const trackingBanner = { background: "#4CAF50", color: "white", padding: "12px 16px", borderRadius: 12, marginBottom: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 };
const successCard = { marginTop: 16, padding: 18, background: "#DCFCE7", borderRadius: 14, color: "#1A2E1A", fontWeight: 800, border: "1px solid #A7F3D0" };
const emptyCard = { background: "#FFFFFF", border: "1px dashed #A5D6A7", borderRadius: 18, padding: 28, color: "#1A2E1A", fontWeight: 800, display: "grid", placeItems: "center", gap: 8, textAlign: "center" };
const btn = { background: "#4CAF50", color: "#FFFFFF", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer" };
const backLink = { display: "inline-block", marginTop: 12, background: "#4CAF50", color: "#FFFFFF", padding: "10px 14px", borderRadius: 8, textDecoration: "none" };
const backdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 };
const modal = { background: "#FFFFFF", borderRadius: 10, padding: 24, maxWidth: 380, width: "90%", textAlign: "center" };
