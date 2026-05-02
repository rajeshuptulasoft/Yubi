import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { authAPI, getApiErrorMessage, getLoginFailureMessage } from "../../lib/api";
import { sessionUserFromAuthResponse } from "@/utils/sessionUser";
import yubiLogo from "../../assets/yubi.png";

const blankLogin = { email: "", password: "" };
const blankRegister = { name: "", email: "", phone: "", password: "", confirmPassword: "" };
const TOAST_DURATION = 4000;

export default function AuthModal({ initialTab = "login", onClose }) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loginForm, setLoginForm] = useState(blankLogin);
  const [registerForm, setRegisterForm] = useState(blankRegister);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  useEffect(() => setActiveTab(initialTab), [initialTab]);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const close = () => {
    setErrors({});
    onClose();
  };

  const handleLogin = async () => {
    const nextErrors = {};
    if (!loginForm.email) nextErrors.email = "Email is required";
    if (!loginForm.password) nextErrors.password = "Password is required";
    if (loginForm.email === "yubiadmin@gmail.com") nextErrors.email = "Use /admin for admin login";
    if (loginForm.email === "yubidelivery@gmail.com") nextErrors.email = "Use /delivery-partner for delivery login";
    if (loginForm.password && loginForm.password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);

    try {
      const response = await authAPI.userLogin(loginForm.email.trim(), loginForm.password);

      if (response?.success === false) {
        toast.error(getLoginFailureMessage(response, "Invalid email or password."), {
          duration: TOAST_DURATION,
        });
        return;
      }

      const session = sessionUserFromAuthResponse(response);
      if (session) {
        login(session);
        const welcomeName = session.name || session.email || "there";
        toast.success(`Welcome back, ${welcomeName}!`, { duration: TOAST_DURATION });
        close();
      } else {
        toast.error(getLoginFailureMessage(response, "Invalid email or password."), {
          duration: TOAST_DURATION,
        });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Login failed. Please try again."), {
        duration: TOAST_DURATION,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const nextErrors = {};
    ["name", "email", "phone", "password", "confirmPassword"].forEach((field) => {
      if (!registerForm[field]) nextErrors[field] = "This field is required";
    });
    if (registerForm.password && registerForm.password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    if (registerForm.confirmPassword && registerForm.confirmPassword !== registerForm.password) nextErrors.confirmPassword = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        confirm_password: registerForm.confirmPassword,
        phone: registerForm.phone.trim(),
      });

      const serverMessage =
        response?.message ||
        response?.error ||
        response?.msg;

      if (response?.success === false) {
        toast.error(getLoginFailureMessage(response, "Registration failed."), {
          duration: TOAST_DURATION,
        });
        return;
      }

      const session = sessionUserFromAuthResponse(response);
      if (session) {
        login(session);
        toast.success("Account created successfully!", { duration: TOAST_DURATION });
        close();
      } else {
        toast.success(serverMessage || "Account created. Please sign in.", {
          duration: TOAST_DURATION,
        });
        setActiveTab("login");
        setRegisterForm(blankRegister);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Registration failed. Please try again."), {
        duration: TOAST_DURATION,
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = registerForm.password.length < 6 ? "Weak" : registerForm.password.length < 10 ? "Medium" : "Strong";
  const strengthColor = passwordStrength === "Weak" ? "#EF4444" : passwordStrength === "Medium" ? "#F59E0B" : "#4CAF50";

  return createPortal(
    <div onClick={close} style={overlayStyle}>
      <div style={centerWrap}>
        <div onClick={(event) => event.stopPropagation()} style={cardStyle}>
          <div style={headerStyle}>
            <img src={yubiLogo} alt="YUBI" style={logoStyle} />
            <h2 style={modalTitle}>Welcome to YUBI</h2>
            <button onClick={close} style={closeButtonStyle} aria-label="Close auth modal">x</button>
          </div>
          <div style={tabsWrap}>
            {["login", "register"].map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setErrors({}); }} style={tabStyle(activeTab === tab)}>{tab === "login" ? "Login" : "Register"}</button>
            ))}
          </div>
          <div style={formBody}>
            {activeTab === "login" ? (
              <>
                <Field label="Email Address" error={errors.email}>
                  <input type="email" placeholder="your@email.com" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </Field>
                <Field label="Password" error={errors.password}>
                  <PasswordInput value={loginForm.password} show={showLoginPassword} setShow={setShowLoginPassword} onChange={(value) => setLoginForm({ ...loginForm, password: value })} />
                </Field>
                <button disabled={loading} onClick={handleLogin} style={{ ...primaryButton, width: "100%", opacity: loading ? 0.7 : 1 }}>{loading ? "Loading..." : "Login to YUBI"}</button>
                <p style={helperText}>Don't have an account? <button onClick={() => setActiveTab("register")} style={linkButton}>Register</button></p>
              </>
            ) : (
              <>
                <Field label="Full Name" error={errors.name}><input value={registerForm.name} onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} /></Field>
                <Field label="Email Address" error={errors.email}><input type="email" value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} /></Field>
                <Field label="Phone Number" error={errors.phone}><input type="tel" value={registerForm.phone} onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} /></Field>
                <Field label="Password" error={errors.password}>
                  <PasswordInput value={registerForm.password} show={showRegisterPassword} setShow={setShowRegisterPassword} onChange={(value) => setRegisterForm({ ...registerForm, password: value })} />
                  <div style={strengthTrack}><div style={{ ...strengthBar, width: passwordStrength === "Weak" ? "33%" : passwordStrength === "Medium" ? "66%" : "100%", background: strengthColor }} /></div>
                  <div style={{ color: strengthColor, fontSize: 12, fontWeight: 700, marginTop: 4 }}>{passwordStrength}</div>
                </Field>
                <Field label="Confirm Password" error={errors.confirmPassword || (registerForm.confirmPassword && registerForm.confirmPassword !== registerForm.password ? "Passwords do not match" : "")}>
                  <input type="password" value={registerForm.confirmPassword} onChange={(event) => setRegisterForm({ ...registerForm, confirmPassword: event.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </Field>
                <button disabled={loading} onClick={handleRegister} style={{ ...primaryButton, width: "100%", opacity: loading ? 0.7 : 1 }}>{loading ? "Loading..." : "Create Account"}</button>
                <p style={helperText}>Already have an account? <button onClick={() => setActiveTab("login")} style={linkButton}>Login</button></p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, error, children }) {
  return <div style={{ marginBottom: 18, textAlign: "left" }}><label style={labelStyle}>{label}</label>{children}{error && <p style={errorStyle}>{error}</p>}</div>;
}

function PasswordInput({ value, onChange, show, setShow }) {
  return <div style={{ position: "relative" }}><input type={show ? "text" : "password"} placeholder="Enter password" value={value} onChange={(event) => onChange(event.target.value)} style={{ ...inputStyle, paddingRight: 48 }} onFocus={focus} onBlur={blur} /><button type="button" onClick={() => setShow(!show)} style={passwordToggle}>{show ? "Hide" : "Show"}</button></div>;
}

function focus(event) { event.target.style.borderColor = "#4CAF50"; }
function blur(event) { event.target.style.borderColor = "#E8F5E9"; }

const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.58)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 2147483000, padding: 16, animation: "fadeIn 0.2s ease", overflowY: "auto" };
const centerWrap = { minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0" };
const cardStyle = { background: "#FFFFFF", borderRadius: 24, width: "min(460px, calc(100vw - 32px))", maxHeight: "calc(100vh - 48px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", boxShadow: "0 24px 80px rgba(0,0,0,0.28)", animation: "modalScaleIn 0.22s ease", position: "relative", zIndex: 1 };
const headerStyle = { background: "#FFFFFF", padding: "28px 28px 18px", borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 1 };
const logoStyle = { height: 72, width: "auto", objectFit: "contain", background: "#FFFFFF", borderRadius: 16, padding: 6, boxShadow: "0 8px 24px rgba(76,175,80,0.14)" };
const modalTitle = { color: "#1A2E1A", fontSize: 22, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "12px 0 0", textAlign: "center" };
const closeButtonStyle = { position: "absolute", right: 16, top: 16, background: "#E8F5E9", border: "none", color: "#1A2E1A", width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, lineHeight: 1 };
const tabsWrap = { display: "flex", borderBottom: "2px solid #E8F5E9", background: "white" };
const tabStyle = (active) => ({ flex: 1, padding: 14, textAlign: "center", fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none", background: "transparent", color: active ? "#4CAF50" : "#888888", borderBottom: active ? "3px solid #4CAF50" : "3px solid transparent" });
const formBody = { padding: 28, textAlign: "center" };
const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #E8F5E9", fontSize: 15, color: "#1A1A1A", outline: "none", background: "#FFFFFF", fontFamily: "'Plus Jakarta Sans', sans-serif" };
const labelStyle = { display: "block", color: "#1A2E1A", fontSize: 14, fontWeight: 700, marginBottom: 6 };
const errorStyle = { color: "#EF4444", fontSize: 12, margin: "6px 0 0", fontWeight: 700 };
const primaryButton = { background: "linear-gradient(135deg, #4CAF50, #388E3C)", color: "#FFFFFF", border: "none", padding: "13px 32px", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(76,175,80,0.35)" };
const linkButton = { color: "#4CAF50", background: "transparent", border: "none", fontWeight: 800, cursor: "pointer" };
const helperText = { margin: "18px 0 0", textAlign: "center", color: "#1A1A1A", fontSize: 14 };
const passwordToggle = { position: "absolute", right: 8, top: 8, minWidth: 48, height: 34, border: "none", background: "transparent", color: "#4CAF50", cursor: "pointer", fontWeight: 800 };
const strengthTrack = { marginTop: 8, height: 6, borderRadius: 8, background: "#E8F5E9", overflow: "hidden" };
const strengthBar = { height: "100%", transition: "width 0.2s ease" };
