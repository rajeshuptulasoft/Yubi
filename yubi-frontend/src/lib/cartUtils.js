import { resolveUploadUrl } from "./foodProductUtils";

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Map one GET /food/cart line item to UI row — DELETE uses food/cart/:cart_item_id */
export function mapCartLineFromApi(raw, index) {
  const id =
    raw?.cart_item_id ??
    raw?.cartItemId ??
    raw?.id ??
    raw?.cart_id ??
    index;
  const productId = raw?.product_id ?? raw?.product?.id;
  const qty = Math.max(1, Math.floor(num(raw?.quantity ?? raw?.qty ?? 1)));
  const price = num(
    raw?.price ??
      raw?.unit_price ??
      raw?.selling_price ??
      raw?.product?.price ??
      raw?.product?.selling_price ??
      0,
  );
  const name = String(
    raw?.product_name ??
      raw?.name ??
      raw?.product?.product_name ??
      raw?.product?.name ??
      "Item",
  ).trim();
  const imageRaw =
    raw?.image_url ??
    raw?.image ??
    raw?.product?.image_url ??
    raw?.product?.image ??
    raw?.thumbnail_url ??
    "";
  const image = resolveUploadUrl(imageRaw);
  const variant = String(raw?.variant ?? raw?.pack_size ?? raw?.unit ?? "").trim();
  const cartItemId = String(id);
  return {
    key: cartItemId,
    cartItemId,
    productId,
    name,
    price,
    qty,
    image,
    variant,
  };
}

/**
 * Parse GET /food/cart response — supports common envelopes { data }, { items }, etc.
 */
export function parseFoodCartResponse(raw) {
  if (raw && typeof raw === "object" && raw.success === false) {
    return {
      lines: [],
      subtotal: 0,
      discount: 0,
      deliveryFee: 0,
      tax: 0,
      total: 0,
      errorMessage: typeof raw.message === "string" && raw.message.trim() ? raw.message.trim() : null,
    };
  }

  const root = raw?.data ?? raw;
  const arr = Array.isArray(root?.items)
    ? root.items
    : Array.isArray(root?.cart_items)
      ? root.cart_items
      : Array.isArray(root?.cart)
        ? root.cart
        : Array.isArray(raw?.items)
          ? raw.items
          : [];

  const lines = arr.map((row, i) => mapCartLineFromApi(row, i));

  let subtotal = num(root?.subtotal ?? root?.cart_subtotal ?? raw?.subtotal);
  let discount = num(root?.discount ?? root?.discount_amount ?? 0);
  let deliveryFee = num(root?.delivery_fee ?? root?.delivery ?? root?.shipping ?? 0);
  let tax = num(root?.tax ?? root?.gst ?? root?.tax_amount ?? 0);
  let total = num(root?.total ?? root?.grand_total ?? root?.payable ?? 0);

  const computedSub = lines.reduce((s, l) => s + l.price * l.qty, 0);
  if (!subtotal && computedSub) subtotal = computedSub;
  if (!total && (subtotal || computedSub)) {
    const base = subtotal || computedSub;
    total = base - discount + deliveryFee + tax;
  }

  return {
    lines,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    errorMessage: null,
  };
}

/** Normalize address id for APIs that expect int or string id */
export function normalizeAddressIdForApi(aid) {
  if (aid == null || aid === "") return undefined;
  const s = String(aid).trim();
  if (!s) return undefined;
  const n = Number(s);
  if (Number.isFinite(n) && String(n) === s) return n;
  return s;
}

/**
 * POST /food/order — backend often expects `items` alongside address + payment.
 * Each row sends product_id and/or cart_item_id plus quantity.
 */
export function buildFoodOrderItemsFromCartLines(lines) {
  if (!Array.isArray(lines)) return [];
  return lines.map((line) => {
    const item = { quantity: Math.max(1, Math.floor(Number(line.qty) || 1)) };
    if (line.productId != null && line.productId !== "") {
      const pid = line.productId;
      const n = Number(pid);
      item.product_id = Number.isFinite(n) && String(n) === String(pid).trim() ? n : pid;
    }
    if (line.cartItemId != null && line.cartItemId !== "") {
      const ci = Number(line.cartItemId);
      item.cart_item_id = Number.isFinite(ci) && String(ci) === String(line.cartItemId).trim() ? ci : line.cartItemId;
    }
    if (line.variant) item.variant = String(line.variant);
    return item;
  });
}
