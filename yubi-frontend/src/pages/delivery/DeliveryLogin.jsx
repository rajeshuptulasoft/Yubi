import { useState } from "react";
import { useNavigate } from "react-router-dom";
import yubiLogo from "../../assets/yubi.png";
import { authAPI, getApiErrorMessage, getLoginFailureMessage } from "../../lib/api";
import { deliverySessionFromLoginResponse } from "../../utils/sessionUser";

export default function DeliveryLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const trimmed = phone.trim().replace(/\s/g, "");
    if (!trimmed || !password) {
      setError("Enter mobile number and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.deliveryLogin(trimmed, password);

      if (response?.success === false) {
        setError(getLoginFailureMessage(response, "Invalid mobile number or password."));
        return;
      }

      const session = deliverySessionFromLoginResponse(response, trimmed);
      if (session) {
        localStorage.setItem("yubiUser", JSON.stringify(session));
        nav("/delivery-partner/dashboard");
      } else {
        setError(getLoginFailureMessage(response, "Invalid mobile number or password."));
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Login failed. Please check your credentials and try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <form onSubmit={submit} style={card}>
        <img
          src={yubiLogo}
          alt="YUBI"
          style={{
            height: 76,
            objectFit: "contain",
            margin: "0 auto 16px",
            display: "block",
          }}
        />
        <h1
          style={{
            ...title,
            fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
          }}
        >
          Delivery Partner Login
        </h1>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="Mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={input}
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />
        <button type="submit" style={button} disabled={loading}>
          {loading ? "Logging in…" : "Login to Portal"}
        </button>
        {error ? (
          <p style={{ color: "#D32F2F", textAlign: "center", fontWeight: 800 }}>{error}</p>
        ) : null}
      </form>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(circle at top left,#E8F5E9,#FFFFFF 45%,#F7FBF7)",
  padding: 24,
};
const card = {
  maxWidth: 420,
  width: "100%",
  background: "#FFFFFF",
  border: "1px solid #D6E8D6",
  borderRadius: 24,
  padding: 34,
  boxShadow: "0 24px 70px rgba(26,46,26,0.16)",
};
const title = {
  color: "#1A2E1A",
  textAlign: "center",
  margin: "0 0 24px",
  fontSize: 30,
};
const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: 14,
  border: "1px solid #D6E8D6",
  borderRadius: 12,
  marginBottom: 14,
  color: "#1A1A1A",
  background: "#FFFFFF",
  fontWeight: 700,
};
const button = {
  width: "100%",
  background: "#4CAF50",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 12,
  padding: 14,
  fontWeight: 900,
  cursor: "pointer",
};
