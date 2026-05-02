import { resolveUploadUrl } from "./foodProductUtils";

/**
 * Use the live order `status` first (admin PATCH updates this), then fallbacks.
 * Empty string on `order_status` must not hide a real `status` value.
 */
function pickPrimaryOrderStatus(raw) {
  if (!raw || typeof raw !== "object") return "";
  const candidates = [
    raw.status,
    raw.order_status,
    raw.orderStatus,
    raw.delivery_status,
  ];
  for (const c of candidates) {
    const t = String(c ?? "").trim();
    if (t !== "") return t;
  }
  return "";
}

/** Backend `current_step` 1–5 → DELIVERY_TRACK_STEPS index 0–4 (1 = Order placed … 5 = Delivered). */
function trackingStepIndexFromApiStep(stepNum) {
  const n = Math.round(Number(stepNum));
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return n - 1;
}

/** Map numeric step to a status string for getDeliveryTrackState fallbacks */
function mapTrackingStepToStatus(stepNum) {
  const n = Math.round(Number(stepNum));
  if (!Number.isFinite(n)) return "";
  const map = {
    1: "pending",
    2: "confirmed",
    3: "picked",
    4: "out_for_delivery",
    5: "delivered",
  };
  return map[n] ?? "";
}

function pickFirstString(...vals) {
  for (const v of vals) {
    const t = String(v ?? "").trim();
    if (t !== "") return t;
  }
  return "";
}

/**
 * Normalize GET /food/order-status/:order_id → fields for {@link getDeliveryTrackState} / {@link OrderTrackingSlider}.
 */
export function normalizeFoodOrderStatusPayload(res) {
  if (res == null || typeof res !== "object") return null;
  if (res.success === false) return null;

  const root = res.data ?? res.update ?? res.payload ?? res.result ?? res;
  if (root == null || typeof root !== "object") return null;

  const order =
    root.order && typeof root.order === "object"
      ? root.order
      : root.update && typeof root.update === "object"
        ? root.update
        : root;

  let statusRaw = pickFirstString(
    order.current_status,
    order.status,
    order.order_status,
    order.orderStatus,
    order.delivery_status,
    order.order_state,
    root.current_status,
    root.status,
    root.order_status,
  );

  const step =
    order.current_step ??
    order.currentStep ??
    order.step ??
    order.tracking_step ??
    order.order_step ??
    order.delivery_step ??
    root.current_step ??
    root.step ??
    root.tracking_step;

  let trackingStepIndex = trackingStepIndexFromApiStep(step);

  if (!statusRaw && step != null && step !== "") {
    const mapped = mapTrackingStepToStatus(step);
    if (mapped) statusRaw = mapped;
  }

  const paymentStatusRaw = String(order.payment_status ?? root.payment_status ?? "").trim();
  const cancelledAt = order.cancelled_at ?? order.cancelledAt ?? root.cancelled_at ?? null;

  if (
    !statusRaw &&
    !paymentStatusRaw &&
    cancelledAt == null &&
    trackingStepIndex == null
  ) {
    return null;
  }

  return {
    statusRaw: statusRaw || "",
    paymentStatusRaw,
    cancelledAt: cancelledAt ?? null,
    trackingStepIndex,
  };
}

/** Overlay GET /food/order-status/:id snapshot onto list row from GET /food/user-order */
export function mergeOrderWithStatusSnapshot(order, snap) {
  if (!order) return order;
  if (!snap) return order;
  return {
    ...order,
    statusRaw: snap.statusRaw?.trim() ? snap.statusRaw : order.statusRaw,
    paymentStatusRaw: snap.paymentStatusRaw?.trim() ? snap.paymentStatusRaw : order.paymentStatusRaw,
    cancelledAt: snap.cancelledAt != null ? snap.cancelledAt : order.cancelledAt,
    trackingStepIndex:
      snap.trackingStepIndex != null && Number.isFinite(Number(snap.trackingStepIndex))
        ? Number(snap.trackingStepIndex)
        : order.trackingStepIndex,
  };
}

/** Parse GET /food/user-order body into an array of order rows. */
export function extractUserOrdersList(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return [];
  if (payload.success === false) return [];
  if (Array.isArray(payload.orders)) return payload.orders;
  const d = payload.data ?? payload;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.orders)) return d.orders;
  if (Array.isArray(d.user_orders)) return d.user_orders;
  if (Array.isArray(d.data) && d.data.length && typeof d.data[0] === "object") return d.data;
  return [];
}

/**
 * Map API order row → UI model.
 * Field names vary by backend; extend as needed.
 */
export function mapUserOrderRow(raw, index) {
  if (!raw || typeof raw !== "object") {
    return {
      id: `order-${index}`,
      numericId: index,
      total: 0,
      shippingCharge: 0,
      createdAt: null,
      itemCount: 0,
      statusRaw: "",
      paymentStatusRaw: "",
      deliveryAddress: "",
      cancelledAt: null,
      items: [],
    };
  }
  const id = raw.order_id ?? raw.orderId ?? raw.id ?? raw.invoice_id ?? `order-${index}`;
  const total = Number(
    raw.total_amount ?? raw.total ?? raw.grand_total ?? raw.amount ?? raw.order_total ?? 0,
  );
  const shippingCharge = Number(raw.shipping_charge ?? raw.shipping ?? 0);
  const createdAt = raw.created_at ?? raw.createdAt ?? raw.date ?? raw.order_date ?? null;
  const items = raw.items ?? raw.order_items ?? raw.line_items ?? raw.products ?? [];
  const itemCount = Array.isArray(items) ? items.length : Number(raw.item_count ?? 0) || 0;
  /** Prefer `status` — admin updates use this; `order_status` is often null/legacy */
  const statusRaw = pickPrimaryOrderStatus(raw);
  const paymentStatusRaw = String(raw.payment_status ?? "").trim();
  const deliveryAddress = String(raw.delivery_address ?? "").trim();
  const cancelledAt = raw.cancelled_at ?? null;

  const mappedItems = Array.isArray(items)
    ? items.map((it) => ({
        orderItemId: it.order_item_id ?? it.id,
        productId: it.product_id,
        name: String(it.product_name ?? it.name ?? "Item"),
        quantity: Math.max(1, Number(it.quantity ?? 1) || 1),
        price: Number(it.price ?? it.total_price ?? it.unit_price ?? 0),
        image: resolveUploadUrl(it.image_url ?? it.image ?? it.product_image ?? it.thumbnail_url ?? ""),
      }))
    : [];

  return {
    id: String(id),
    numericId: Number.isFinite(Number(id)) ? Number(id) : id,
    total: Number.isFinite(total) ? total : 0,
    shippingCharge: Number.isFinite(shippingCharge) ? shippingCharge : 0,
    createdAt,
    itemCount,
    statusRaw,
    paymentStatusRaw,
    deliveryAddress,
    cancelledAt,
    items: mappedItems,
  };
}

/**
 * Show "Successful" or "Cancelled" per product request; other states use a readable label.
 */
export function getOrderStatusDisplay(statusRaw) {
  const s = String(statusRaw ?? "")
    .trim()
    .toLowerCase();
  if (!s) {
    return { label: "—", kind: "muted" };
  }
  if (/cancel|cancelled|canceled|reject|rejected|refund|failed/.test(s)) {
    return { label: "Cancelled", kind: "cancelled" };
  }
  if (/^pending$|processing|preparing|confirmed|packed|shipped|out for delivery|in transit/.test(s)) {
    if (/^pending$/.test(s)) return { label: "Pending", kind: "pending" };
    return { label: String(statusRaw).trim() || "—", kind: "pending" };
  }
  if (
    /success|successful|delivered|completed|complete|paid|fulfilled/.test(s)
  ) {
    return { label: "Successful", kind: "success" };
  }
  const raw = String(statusRaw).trim();
  return { label: raw || "—", kind: "other" };
}

/** Horizontal timeline entries for GET /food/order-status/:id (flexible shapes). */
export function parseOrderStatusTimeline(raw) {
  const root = raw?.data ?? raw;
  if (root == null) return [];
  if (Array.isArray(root)) {
    return root.map((x, i) => ({
      key: `r-${i}`,
      title: String(x.status ?? x.step ?? x.title ?? x.label ?? x.name ?? "Update"),
      detail: String(x.message ?? x.description ?? x.note ?? x.details ?? ""),
      time: x.at ?? x.time ?? x.created_at ?? x.updated_at ?? "",
    }));
  }
  if (typeof root !== "object") return [];
  if (Array.isArray(root.timeline))
    return root.timeline.map((x, i) => ({
      key: `t-${i}`,
      title: String(x.status ?? x.step ?? x.title ?? "Step"),
      detail: String(x.message ?? x.description ?? ""),
      time: x.at ?? x.time ?? x.created_at ?? "",
    }));
  if (Array.isArray(root.history))
    return root.history.map((x, i) => ({
      key: `h-${i}`,
      title: String(x.status ?? x.title ?? "Update"),
      detail: String(x.message ?? x.description ?? ""),
      time: x.at ?? x.created_at ?? "",
    }));
  if (Array.isArray(root.steps))
    return root.steps.map((x, i) => ({
      key: `s-${i}`,
      title: String(x.label ?? x.title ?? x.name ?? `Step ${i + 1}`),
      detail: String(x.description ?? x.detail ?? ""),
      time: x.completed_at ?? x.at ?? "",
    }));
  const st = root.status ?? root.order_status ?? root.current_status;
  if (st != null && st !== "")
    return [{ key: "cur", title: "Current status", detail: String(st), time: root.updated_at ?? "" }];
  /** Avoid listing raw snapshot fields (order_id, payment_status, timestamps) as timeline rows. */
  return [];
}

export function isOrderPending(statusRaw) {
  return /^pending$/i.test(String(statusRaw ?? "").trim());
}

export function canShowCancelOrder(order) {
  if (order?.cancelledAt) return false;
  const stepIdx = order?.trackingStepIndex;
  if (typeof stepIdx === "number" && !Number.isNaN(stepIdx) && stepIdx >= 4) return false;
  const s = String(order?.statusRaw ?? "")
    .trim()
    .toLowerCase();
  if (/delivered|complete|cancel|refund/.test(s)) return false;
  return true;
}

/** Swiggy/Zomato-style milestone labels (left → right). */
export const DELIVERY_TRACK_STEPS = [
  "Order Placed",
  "Order Confirmed",
  "Preparing Your Order",
  "On the Way",
  "Delivered",
];

/**
 * When GET /food/order-status returns `current_step` 1–5 mapped to index 0–4.
 */
export function getDeliveryTrackStateFromStepIndex(stepIndex0based, cancelledAt) {
  if (cancelledAt != null && cancelledAt !== "") {
    return {
      mode: "cancelled",
      activeStepIndex: 0,
      headline: "Order cancelled",
    };
  }
  const i = Math.max(0, Math.min(4, Math.round(Number(stepIndex0based))));
  if (i >= 4) {
    return {
      mode: "complete",
      activeStepIndex: 4,
      headline: DELIVERY_TRACK_STEPS[4],
    };
  }
  return {
    mode: "progress",
    activeStepIndex: i,
    headline: DELIVERY_TRACK_STEPS[i],
  };
}

/**
 * Combine GET /food/order-status `current_step` (as trackingStepIndex 0–4) with
 * status strings from the same payload or list row. Uses the **later** milestone
 * when API step lags (e.g. status "confirmed" but current_step still 1 → index 0).
 */
export function getResolvedDeliveryTrackState(statusRaw, paymentStatusRaw, cancelledAt, trackingStepIndex) {
  const fromStrings = getDeliveryTrackState(statusRaw, paymentStatusRaw, cancelledAt);

  const hasApi =
    typeof trackingStepIndex === "number" && !Number.isNaN(trackingStepIndex);
  if (!hasApi) return fromStrings;

  const apiTrack = getDeliveryTrackStateFromStepIndex(trackingStepIndex, cancelledAt);

  if (fromStrings.mode === "cancelled" || apiTrack.mode === "cancelled") {
    return fromStrings.mode === "cancelled" ? fromStrings : apiTrack;
  }
  if (fromStrings.mode === "complete" || apiTrack.mode === "complete") {
    return fromStrings.mode === "complete" ? fromStrings : apiTrack;
  }

  const idx = Math.max(fromStrings.activeStepIndex, apiTrack.activeStepIndex);
  return getDeliveryTrackStateFromStepIndex(idx, cancelledAt);
}

/**
 * Maps backend status → timeline UI (active step = in progress; earlier = done).
 * `headline` is the single status line shown on the order card.
 */
export function getDeliveryTrackState(statusRaw, paymentStatusRaw, cancelledAt) {
  if (cancelledAt != null && cancelledAt !== "") {
    return {
      mode: "cancelled",
      activeStepIndex: 0,
      headline: "Order cancelled",
    };
  }

  const s = String(statusRaw ?? "")
    .toLowerCase()
    .trim();
  if (/cancel|cancelled|canceled/.test(s) || s === "refunded") {
    return {
      mode: "cancelled",
      activeStepIndex: 0,
      headline: "Order cancelled",
    };
  }

  if (/out_for_delivered|out\s+for\s+delivered|out_for_delivery|out\s+for\s+delivery/.test(s)) {
    return {
      mode: "progress",
      activeStepIndex: 3,
      headline: DELIVERY_TRACK_STEPS[3],
    };
  }

  if (/delivered|completed|complete|success|fulfilled/.test(s)) {
    return {
      mode: "complete",
      activeStepIndex: 4,
      headline: DELIVERY_TRACK_STEPS[4],
    };
  }

  if (/^confirmed$|order\s+confirmed|^confirm(ed)?$/i.test(s)) {
    return {
      mode: "progress",
      activeStepIndex: 1,
      headline: DELIVERY_TRACK_STEPS[1],
    };
  }

  if (/^assigned$/.test(s)) {
    return {
      mode: "progress",
      activeStepIndex: 2,
      headline: "Delivery partner assigned",
    };
  }

  if (/^picked$/.test(s)) {
    return {
      mode: "progress",
      activeStepIndex: 2,
      headline: DELIVERY_TRACK_STEPS[2],
    };
  }

  if (/out_for_delivery|out for delivery/.test(s)) {
    return {
      mode: "progress",
      activeStepIndex: 3,
      headline: DELIVERY_TRACK_STEPS[3],
    };
  }

  if (/on the way|shipped|in transit|dispatched|near you|arriving|rider|picked up/.test(s)) {
    return {
      mode: "progress",
      activeStepIndex: 3,
      headline: DELIVERY_TRACK_STEPS[3],
    };
  }

  if (/prepar|packing|packed|cooking|making|kitchen|food is/.test(s)) {
    return {
      mode: "progress",
      activeStepIndex: 2,
      headline: DELIVERY_TRACK_STEPS[2],
    };
  }

  if (/confirm|accepted/.test(s) && !/prepar/.test(s)) {
    return {
      mode: "progress",
      activeStepIndex: 1,
      headline: DELIVERY_TRACK_STEPS[1],
    };
  }

  if (s === "pending" || s === "") {
    return {
      mode: "progress",
      activeStepIndex: 1,
      headline: DELIVERY_TRACK_STEPS[1],
    };
  }

  return {
    mode: "progress",
    activeStepIndex: 0,
    headline: DELIVERY_TRACK_STEPS[0],
  };
}

export function isStepDone(stepIndex, mode, activeStepIndex) {
  if (mode === "complete") return true;
  if (mode === "cancelled") return false;
  return stepIndex < activeStepIndex;
}

export function isStepCurrent(stepIndex, mode, activeStepIndex) {
  if (mode === "complete" || mode === "cancelled") return false;
  return stepIndex === activeStepIndex;
}
