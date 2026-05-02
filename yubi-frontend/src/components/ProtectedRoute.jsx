import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "./UI";

export default function ProtectedRoute({ children, allow }) {
  const { user, role, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace />;
  if (allow && !allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}
