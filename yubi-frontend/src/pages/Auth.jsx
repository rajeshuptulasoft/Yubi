import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "@/utils/theme";
import { Button, Card, Input, GradientText } from "@/components/UI";
import { useAuth } from "@/context/AuthContext";
import { authAPI, getApiErrorMessage, getLoginFailureMessage } from "@/lib/api";
import { sessionUserFromAuthResponse } from "@/utils/sessionUser";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const TOAST_DURATION = 4000;

export default function Auth() {
  const { login: setAuthUser } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });

  const handleUserLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.userLogin(form.email.trim(), form.password);

      if (response?.success === false) {
        const errorMessage = getLoginFailureMessage(
          response,
          "Invalid email or password.",
        );
        setError(errorMessage);
        toast.error(errorMessage, { duration: TOAST_DURATION });
        return;
      }

      const session = sessionUserFromAuthResponse(response);
      if (session) {
        localStorage.setItem("yubiUser", JSON.stringify(session));
        setAuthUser(session);

        const welcomeName = session.name || session.email || "there";
        toast.success(`Welcome back, ${welcomeName}!`, { duration: TOAST_DURATION });

        setForm({ email: "", password: "", confirmPassword: "", fullName: "", phone: "" });
        setError("");

        setTimeout(() => {
          nav("/home");
        }, 1000);
      } else {
        const errorMessage = getLoginFailureMessage(
          response,
          "Invalid email or password.",
        );
        setError(errorMessage);
        toast.error(errorMessage, { duration: TOAST_DURATION });
      }
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        "Login failed. Please check your credentials and try again.",
      );
      setError(errorMessage);
      toast.error(errorMessage, { duration: TOAST_DURATION });
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegister = async () => {
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.", { duration: TOAST_DURATION });
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirmPassword,
        phone: form.phone.trim(),
      });

      if (response?.success === false) {
        const msg = getLoginFailureMessage(response, "Registration failed.");
        toast.error(msg, { duration: TOAST_DURATION });
        return;
      }

      const session = sessionUserFromAuthResponse(response);
      if (session) {
        localStorage.setItem("yubiUser", JSON.stringify(session));
        setAuthUser(session);
        toast.success(
          response?.message || "Account created successfully!",
          { duration: TOAST_DURATION },
        );
        setForm({ email: "", password: "", confirmPassword: "", fullName: "", phone: "" });
        setTimeout(() => nav("/home"), 800);
      } else {
        toast.success(
          response?.message || "Account created. Please sign in.",
          { duration: TOAST_DURATION },
        );
        setMode("signin");
        setForm({
          email: form.email,
          password: "",
          confirmPassword: "",
          fullName: "",
          phone: form.phone,
        });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Registration failed. Please try again."), {
        duration: TOAST_DURATION,
      });
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signin") {
      await handleUserLogin();
      return;
    }
    await handleUserRegister();
  };

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Card className="ss-fade-up" style={{ maxWidth: 460, width: "100%", padding: 36 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: theme.shadow }}>
          <Sparkles color="#0D0D0D" />
        </div>
        <h1 style={{ fontFamily: theme.fonts.heading, fontSize: 32, textAlign: "center", margin: 0 }}>
          {mode === "signin" ? <>Welcome <GradientText>Back</GradientText></> : <>Join <GradientText>Saffron &amp; Sage</GradientText></>}
        </h1>
        <p style={{ textAlign: "center", color: theme.colors.textDim, marginTop: 8, marginBottom: 28 }}>
          {mode === "signin" ? "Sign in to continue" : "Create your account"}
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <>
              <Input
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
              <Input
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </>
          )}
          <Input 
            type="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setError("");
            }} 
            required 
          />
          <Input 
            type="password" 
            placeholder="Password (min 6 characters)" 
            value={form.password} 
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              setError("");
            }} 
            required 
            minLength={6}
          />
          {mode === "signup" && (
            <Input
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          )}
          {error && mode === "signin" && (
            <div style={{
              padding: 12,
              borderRadius: 8,
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid #dc2626",
              color: "#dc2626",
              fontSize: 13,
              fontFamily: theme.fonts.body,
              marginTop: 8
            }}>
              ❌ {error}
            </div>
          )}
          <Button type="submit" size="lg" disabled={loading} style={{ marginTop: error ? 12 : 8 }}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, color: theme.colors.textDim, fontSize: 14 }}>
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setForm((f) => ({
                ...f,
                password: "",
                confirmPassword: "",
              }));
            }}
            style={{ background: "none", border: "none", color: theme.colors.accent, cursor: "pointer", fontWeight: 600, fontFamily: theme.fonts.body }}>
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
}
