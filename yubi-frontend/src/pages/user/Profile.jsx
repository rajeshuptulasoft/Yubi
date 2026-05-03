import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI, getApiErrorMessage, getLoginFailureMessage } from "@/lib/api";
import { mergeStoredUserWithProfile, normalizeProfileResponse } from "@/utils/sessionUser";
import {
  DeliveryAddressCard,
  DeliveryAddressModal,
} from "@/components/delivery/DeliveryAddresses";
import yubiLogo from "../../assets/yubi.png";

const PROFILE_EDITS_KEY = "yubiProfileEdits";

export default function Profile() {
  const {
    user,
    logout,
    login,
    addresses,
    addressesLoading,
    refreshDeliveryAddresses,
    setDefaultAddress,
    removeAddress,
  } = useAuth();
  const nav = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.token) {
      nav("/auth", { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await authAPI.getProfile();
        if (cancelled) return;
        if (data?.success === false) {
          const msg = getLoginFailureMessage(data, "Could not load profile.");
          // console.log("[Profile] GET food/profile error:", msg, data);
          setError(msg);
          setProfile(null);
          return;
        }
        // console.log("[Profile] GET food/profile success (raw):", data);
        const normalized = normalizeProfileResponse(data);
        // console.log("[Profile] GET food/profile normalized:", normalized);
        const savedEdits = readSavedProfileEdits();
        const mergedProfile = {
          ...normalized,
          ...savedEdits,
          profile_picture: savedEdits.profile_picture ?? user?.profile_picture ?? normalized?.profile_picture ?? null,
        };
        setProfile(mergedProfile);
        if (normalized) {
          const merged = mergeStoredUserWithProfile(mergedProfile);
          if (merged) login(merged);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = getApiErrorMessage(e, "Could not load profile.");
          // console.log("[Profile] GET food/profile error:", msg, e);
          setError(msg);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.token, user?.profile_picture, nav, login]);

  useEffect(() => {
    const source = profile || user || {};
    setProfileForm({
      name: source.name || "",
      email: source.email || "",
      phone: source.phone || "",
    });
  }, [profile, user]);

  const activeProfile = useMemo(() => ({ ...(user || {}), ...(profile || {}) }), [profile, user]);
  const displayName = (activeProfile.name || "").trim() || "Customer";
  const avatar = avatarPreviewUrl || activeProfile.profile_picture;

  const cancelEditing = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    }
    setPendingAvatarFile(null);
    const source = profile || user || {};
    setProfileForm({
      name: source.name || "",
      email: source.email || "",
      phone: source.phone || "",
    });
    setEditingProfile(false);
  };

  const saveProfile = async () => {
    const trimmed = {
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
    };
    if (!trimmed.name) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!trimmed.email) {
      toast.error("Please enter your email.");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmed.name);
    formData.append("email", trimmed.email);
    formData.append("phone", trimmed.phone);
    if (pendingAvatarFile) {
      formData.append("profile_picture", pendingAvatarFile);
    }

    setSaving(true);
    try {
      const data = await authAPI.updateProfile(formData);
      if (data?.success === false) {
        toast.error(getLoginFailureMessage(data, "Could not update profile."));
        return;
      }
      toast.success(
        typeof data?.message === "string" && data.message.trim()
          ? data.message.trim()
          : "Profile updated successfully!",
      );

      const normalized = normalizeProfileResponse(data);
      const base = normalized || {
        name: trimmed.name,
        email: trimmed.email,
        phone: trimmed.phone,
        role: activeProfile.role || "customer",
        profile_picture: activeProfile.profile_picture ?? null,
      };
      const updated = {
        ...activeProfile,
        ...base,
        token: user?.token,
      };
      localStorage.removeItem(PROFILE_EDITS_KEY);
      setProfile(updated);
      const merged = mergeStoredUserWithProfile(updated);
      if (merged) login(merged);

      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
      }
      setPendingAvatarFile(null);
      setEditingProfile(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not update profile."));
    } finally {
      setSaving(false);
    }
  };

  const changeProfilePicture = (event) => {
    if (!editingProfile) {
      toast.info("Please tap Edit Profile first to change your photo.");
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setPendingAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    event.target.value = "";
  };

  return (
    <main style={pageStyle}>
      <section style={profileGridStyle}>
        <div style={heroCardStyle}>
          <div style={heroGlowStyle} />
          <img src={yubiLogo} alt="YUBI" style={logoStyle} />
          <div style={avatarWrapStyle}>
            {avatar ? (
              <img src={avatar} alt={displayName} style={avatarImageStyle} />
            ) : (
              <UserRound size={50} color="#FFFFFF" />
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} style={avatarEditButtonStyle}>
              <Camera size={17} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={changeProfilePicture} hidden />
          </div>
          <h1 style={{ color: "#FFFFFF", fontSize: 34, margin: "22px 0 6px" }}>
            {loading ? "..." : displayName}
          </h1>
          <p style={{ color: "#DDF4DD", margin: 0 }}>Your YUBI food, spices and grocery profile</p>
        </div>

        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>Profile Details</h2>
            {!loading && !error && (
              <button
                type="button"
                onClick={() => (editingProfile ? cancelEditing() : setEditingProfile(true))}
                style={smallActionButtonStyle}
              >
                {editingProfile ? <X size={16} /> : <Edit3 size={16} />}
                {editingProfile ? "Cancel" : "Edit Profile"}
              </button>
            )}
          </div>

          {loading && <p style={{ color: "#4b604b", fontWeight: 700 }}>Loading profile...</p>}
          {!loading && error && <p style={{ color: "#B91C1C", fontWeight: 700, marginBottom: 16 }}>{error}</p>}
          {!loading && !error && (
            <>
              {editingProfile ? (
                <>
                  <EditableField icon={<UserRound size={18} />} label="Full Name">
                    <input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} style={inputStyle} />
                  </EditableField>
                  <EditableField icon={<Mail size={18} />} label="Email">
                    <input type="email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} style={inputStyle} />
                  </EditableField>
                  <EditableField icon={<Phone size={18} />} label="Phone Number">
                    <input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} style={inputStyle} />
                  </EditableField>
                  <ReadOnlyField icon={<Shield size={18} />} label="Role" value={activeProfile.role || "-"} />
                  <p style={{ color: "#607060", fontSize: 13, margin: "-4px 0 12px" }}>
                    {pendingAvatarFile ? `New photo selected — ${pendingAvatarFile.name}` : "Change photo with the camera button on your avatar, then save."}
                  </p>
                  <button type="button" onClick={saveProfile} disabled={saving} style={{ ...saveButtonStyle, opacity: saving ? 0.75 : 1, cursor: saving ? "wait" : "pointer" }}>
                    <Check size={17} /> {saving ? "Saving..." : "Save Profile"}
                  </button>
                </>
              ) : activeProfile ? (
                <>
                  <ReadOnlyField icon={<UserRound size={18} />} label="Full Name" value={activeProfile.name || "-"} />
                  <ReadOnlyField icon={<Mail size={18} />} label="Email" value={activeProfile.email || "-"} />
                  <ReadOnlyField icon={<Phone size={18} />} label="Phone Number" value={activeProfile.phone || "-"} />
                  <ReadOnlyField icon={<Shield size={18} />} label="Role" value={activeProfile.role || "-"} />
                </>
              ) : (
                <p style={{ color: "#666" }}>No profile data.</p>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => {
              logout();
              nav("/home");
            }}
            style={logoutButtonStyle}
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </section>

      <section style={addressSectionStyle}>
        <div className="profile-section-header" style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Address List</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setShowAddressModal(true);
            }}
            style={addAddressButtonStyle}
          >
            <Plus size={17} /> Add Address
          </button>
        </div>

        {addressesLoading ? (
          <p style={{ color: "#4b604b", fontWeight: 700, margin: "8px 0 0" }}>Loading addresses…</p>
        ) : addresses.length ? (
          <div className="profile-address-grid" style={addressGridStyle}>
            {addresses.map((address) => (
              <DeliveryAddressCard
                key={address.id}
                address={address}
                onDefault={async () => {
                  const res = await setDefaultAddress(address.id);
                  if (res.success) {
                    toast.success(
                      typeof res.data?.message === "string" && res.data.message.trim()
                        ? res.data.message.trim()
                        : "Successfully set as default.",
                    );
                  } else {
                    toast.error(res.message || "Could not set default address.");
                  }
                }}
                onEdit={() => {
                  setEditingAddress(address);
                  setShowAddressModal(true);
                }}
                onDelete={async () => {
                  if (!confirm("Delete this address?")) return;
                  const res = await removeAddress(address.id);
                  if (res.success) {
                    toast.success(
                      typeof res.data?.message === "string" && res.data.message.trim()
                        ? res.data.message.trim()
                        : "Address deleted successfully.",
                    );
                  } else {
                    toast.error(res.message || "Could not delete address.");
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div style={emptyAddressStyle}>
            <MapPin size={38} color="#4CAF50" />
            <strong>No saved addresses</strong>
            <span>Add your first delivery address to make checkout faster.</span>
          </div>
        )}
      </section>

      {showAddressModal && (
        <DeliveryAddressModal
          key={editingAddress?.id ?? "new"}
          editingAddress={editingAddress}
          hasAddresses={addresses.length > 0}
          onAddressSaved={refreshDeliveryAddresses}
          onClose={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
        />
      )}
      <style>{`@media(max-width:760px){.profile-address-grid{grid-template-columns:1fr !important}.profile-section-header{align-items:flex-start !important;flex-direction:column !important}}.modal-card::-webkit-scrollbar{display:none}`}</style>
    </main>
  );
}

function ReadOnlyField({ icon, label, value }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={fieldLabelStyle}>{icon}{label}</span>
      <div style={readOnlyValueStyle}>{value}</div>
    </label>
  );
}

function EditableField({ icon, label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={fieldLabelStyle}>{icon}{label}</span>
      {children}
    </label>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ color: "#1A2E1A", fontSize: 14, fontWeight: 800, marginBottom: 7, display: "block" }}>{label}</label>
      {children}
      {error && <p style={{ color: "#B91C1C", fontSize: 12, fontWeight: 800, margin: "6px 0 0" }}>{error}</p>}
    </div>
  );
}

function readSavedProfileEdits() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_EDITS_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

const pageStyle = { minHeight: "calc(100vh - 72px)", background: "linear-gradient(135deg,#F7FBF7 0%,#FFFFFF 45%,#E8F5E9 100%)", padding: "42px 18px", color: "#1A1A1A" };
const profileGridStyle = { maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, alignItems: "stretch" };
const heroCardStyle = { background: "#1A2E1A", borderRadius: 24, padding: 28, color: "#FFFFFF", boxShadow: "0 24px 70px rgba(26,46,26,0.20)", position: "relative", overflow: "hidden" };
const heroGlowStyle = { position: "absolute", right: -60, top: -60, width: 180, height: 180, borderRadius: "50%", background: "rgba(76,175,80,0.24)" };
const logoStyle = { height: 68, background: "#FFFFFF", borderRadius: 16, padding: 8, position: "relative" };
const avatarWrapStyle = { width: 108, height: 108, borderRadius: "50%", marginTop: 34, background: "linear-gradient(135deg,#4CAF50,#A5D6A7)", display: "grid", placeItems: "center", boxShadow: "0 18px 35px rgba(0,0,0,0.22)", position: "relative" };
const avatarImageStyle = { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" };
const avatarEditButtonStyle = { position: "absolute", right: -2, bottom: 4, width: 36, height: 36, borderRadius: "50%", border: "3px solid #1A2E1A", background: "#FFFFFF", color: "#1A2E1A", display: "grid", placeItems: "center", cursor: "pointer" };
const cardStyle = { background: "#FFFFFF", borderRadius: 24, padding: 26, border: "1px solid #D6E8D6", boxShadow: "0 18px 45px rgba(26,46,26,0.10)" };
const sectionHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 20 };
const sectionTitleStyle = { color: "#1A2E1A", margin: 0, fontSize: 24 };
const fieldLabelStyle = { display: "flex", alignItems: "center", gap: 8, color: "#1A2E1A", fontWeight: 900, marginBottom: 7 };
const readOnlyValueStyle = { background: "#F7FBF7", border: "1px solid #D6E8D6", borderRadius: 12, padding: "13px 14px", color: "#1A1A1A", fontWeight: 700 };
const inputStyle = { width: "100%", boxSizing: "border-box", background: "#FFFFFF", border: "2px solid #D6E8D6", borderRadius: 12, padding: "12px 14px", color: "#1A1A1A", fontSize: 15, outline: "none", fontWeight: 700 };
const smallActionButtonStyle = { border: "1px solid #C8E6C9", background: "#F7FBF7", color: "#1A2E1A", borderRadius: 12, padding: "10px 12px", fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" };
const saveButtonStyle = { background: "linear-gradient(135deg,#4CAF50,#388E3C)", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "12px 18px", fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" };
const logoutButtonStyle = { marginTop: 20, width: "100%", background: "#EF4444", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "13px 16px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" };
const addressSectionStyle = { maxWidth: 980, margin: "24px auto 0", background: "#FFFFFF", borderRadius: 24, padding: 26, border: "1px solid #D6E8D6", boxShadow: "0 18px 45px rgba(26,46,26,0.10)" };
const addressGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 };
const addAddressButtonStyle = { background: "#1A2E1A", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "12px 16px", display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 900, cursor: "pointer" };
const emptyAddressStyle = { border: "2px dashed #A5D6A7", borderRadius: 16, padding: 28, display: "grid", placeItems: "center", gap: 8, color: "#607060", textAlign: "center" };
