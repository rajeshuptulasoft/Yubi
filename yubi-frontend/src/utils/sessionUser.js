/**
 * Normalize POST /food/login and /food/register responses into the stored `yubiUser` shape.
 * Supports common backend variants: access_token, user_id, nested user object.
 */
export function sessionUserFromAuthResponse(res) {
  if (!res || typeof res !== "object" || res.success === false) return null;

  const nested = res.user ?? res.data?.user ?? {};
  const token =
    pickToken(res) ??
    pickToken(res.data ?? {}) ??
    pickToken(nested);
  if (!token) return null;

  const id = coalesceId(
    res.user_id,
    res.userId,
    res.id,
    nested.user_id,
    nested.id,
  );
  const role = String(res.role ?? nested.role ?? "customer");

  const base = {
    email: String(res.email ?? nested.email ?? ""),
    name: String(res.name ?? nested.name ?? ""),
    phone: String(res.phone ?? nested.phone ?? ""),
    token,
    role,
    profile_picture: res.profile_picture ?? nested.profile_picture ?? null,
  };

  if (id !== undefined) {
    base.id = id;
    base.user_id = res.user_id ?? id;
  }

  return base;
}

/**
 * Normalize POST /admin/login into stored `yubiUser` (role admin + Bearer token).
 */
export function adminSessionFromLoginResponse(res, phoneOrEmailInput = "") {
  if (!res || typeof res !== "object" || res.success === false) return null;

  const nested = res.user ?? res.data?.user ?? {};
  const token =
    pickToken(res) ??
    pickToken(res.data ?? {}) ??
    pickToken(nested);
  if (!token) return null;

  const input = String(phoneOrEmailInput ?? "").trim();
  const emailFromRes = String(res.email ?? nested.email ?? "");
  const phoneFromRes = String(res.phone ?? nested.phone ?? "");
  const email = emailFromRes || (input.includes("@") ? input : "");
  const phone = phoneFromRes || (!input.includes("@") && input ? input : "");

  return {
    role: "admin",
    token,
    email: email || input,
    phone,
  };
}

/**
 * Normalize POST /delivery-partner/login into stored `yubiUser` (role delivery; Bearer token when API returns one).
 */
export function deliverySessionFromLoginResponse(res, phoneInput = "") {
  if (!res || typeof res !== "object" || res.success === false || res.status === "error") return null;

  const nested =
    res.user ??
    res.data?.user ??
    res.partner ??
    res.delivery_partner ??
    res.data?.partner ??
    res.data?.delivery_partner ??
    {};
  const token =
    pickToken(res) ??
    pickToken(res.data ?? {}) ??
    pickToken(nested);

  const hasUserPayload =
    nested &&
    typeof nested === "object" &&
    (nested.phone != null ||
      nested.user_id != null ||
      nested.delivery_partner_id != null ||
      nested.mobile != null);

  /** JWT and/or `user` object from POST /delivery-partner/login (backend may omit top-level `status`). */
  if (!token && !hasUserPayload) return null;

  const input = String(phoneInput ?? "").trim();
  const phone = String(
    nested.phone ?? nested.mobile ?? res.phone ?? res.mobile ?? (input || ""),
  ).trim();

  const partnerDbId = coalesceId(
    nested.delivery_partner_id,
    nested.partner_id,
    nested.id,
    res.delivery_partner_id,
    res.partner_id,
  );
  const userDbId = coalesceId(nested.user_id, res.user_id);

  const base = {
    role: "delivery",
    ...(token ? { token } : {}),
    phone: phone || input,
    name: String(nested.name ?? res.name ?? ""),
    email: String(nested.email ?? res.email ?? ""),
  };

  if (partnerDbId !== undefined) {
    base.id = partnerDbId;
    base.partnerId = partnerDbId;
    base.delivery_partner_id = partnerDbId;
  }
  if (userDbId !== undefined) {
    base.user_id = userDbId;
  }

  return base;
}

function pickToken(obj) {
  if (!obj || typeof obj !== "object") return null;
  const keys = ["token", "access_token", "accessToken", "jwt", "authToken"];
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function coalesceId(...vals) {
  for (const v of vals) {
    if (v === undefined || v === null) continue;
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

/**
 * Flatten GET /food/profile JSON so UI always gets name, email, phone, role at top level.
 * Handles wrappers: data, user, profile, data[0].
 */
export function normalizeProfileResponse(raw) {
  if (!raw || typeof raw !== "object" || raw.success === false) return null;

  let obj = raw;
  if (Array.isArray(raw.data) && raw.data.length && typeof raw.data[0] === "object") {
    obj = raw.data[0];
  } else if (raw.data != null && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    obj = raw.data;
  } else if (raw.user && typeof raw.user === "object") {
    obj = raw.user;
  } else if (raw.profile && typeof raw.profile === "object") {
    obj = raw.profile;
  } else if (raw.payload && typeof raw.payload === "object") {
    obj = raw.payload;
  } else if (raw.result && typeof raw.result === "object") {
    obj = raw.result;
  }

  const pick = (keys) => {
    for (const k of keys) {
      if (!(k in obj)) continue;
      const v = obj[k];
      if (v === undefined || v === null) continue;
      const s = typeof v === "string" ? v.trim() : String(v);
      if (s !== "") return s;
    }
    return "";
  };

  const pic = () => {
    for (const k of ["profile_picture", "profilePicture", "avatar", "photo", "image"]) {
      if (!(k in obj)) continue;
      const v = obj[k];
      if (v === null) return null;
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return null;
  };

  const uid = obj.user_id ?? obj.id;

  return {
    name: pick(["name", "full_name", "fullName", "customer_name"]),
    email: pick(["email", "email_address"]),
    phone: pick(["phone", "phone_number", "mobile", "phoneNumber"]),
    role: pick(["role", "user_role"]),
    profile_picture: pic(),
    ...(uid !== undefined && uid !== null ? { user_id: uid, id: uid } : {}),
  };
}

/** Merge GET /food/profile into existing localStorage session (keeps token). */
export function mergeStoredUserWithProfile(profile) {
  if (!profile || typeof profile !== "object") return null;
  const raw = localStorage.getItem("yubiUser");
  if (!raw) return null;
  try {
    const u = JSON.parse(raw);
    if (!u?.token) return null;

    const id = profile.user_id ?? profile.id ?? u.id ?? u.user_id;
    const merged = {
      ...u,
      ...(id !== undefined ? { id, user_id: profile.user_id ?? id } : {}),
      name: profile.name ?? u.name,
      email: profile.email ?? u.email,
      phone: profile.phone ?? u.phone,
      role: profile.role ?? u.role,
      profile_picture: profile.profile_picture ?? u.profile_picture ?? null,
    };
    localStorage.setItem("yubiUser", JSON.stringify(merged));
    return merged;
  } catch {
    return null;
  }
}
