import { Navigate, useLocation } from "react-router-dom";

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return {};

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return {};

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return {};
  }
}

export default function RequireRole({ children, allowedRole = "ADMIN" }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const payload = decodeJwtPayload(token);
  const role = String(payload?.role || "").toUpperCase();

  if (role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
