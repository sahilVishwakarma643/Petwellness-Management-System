import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { setAuthDisplayName } from "../utils/authState";
import "./Login.css";

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object" && data.message) {
    return data.message;
  }

  return error?.message || "Request failed";
}

function getRoleFromToken(token) {
  if (!token || typeof token !== "string") {
    return "";
  }

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return "";
    }

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const payload = JSON.parse(json);

    return typeof payload?.role === "string" ? payload.role.toUpperCase() : "";
  } catch {
    return "";
  }
}

function getNameFromToken(token) {
  if (!token || typeof token !== "string") {
    return "";
  }

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return "";
    }

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const payload = JSON.parse(json);

    const candidates = [payload?.fullName, payload?.name, payload?.firstName, payload?.username, payload?.sub];
    const raw = candidates.find((value) => typeof value === "string" && value.trim());
    if (!raw) return "";

    const clean = raw.trim();
    return clean.includes("@") ? clean.split("@")[0] : clean.split(" ")[0];
  } catch {
    return "";
  }
}

function getFirstNameFromPayload(payload, fallbackEmail = "") {
  const candidates = [
    payload?.firstName,
    payload?.first_name,
    payload?.user?.firstName,
    payload?.user?.first_name,
    payload?.fullName,
    payload?.name,
    payload?.user?.fullName,
    payload?.user?.name,
  ];

  const raw = candidates.find((value) => typeof value === "string" && value.trim());
  if (!raw) {
    return fallbackEmail ? fallbackEmail.split("@")[0] : "";
  }

  const clean = raw.trim();
  if (clean.includes("@")) {
    return clean.split("@")[0];
  }

  return clean.split(" ")[0];
}

function Login() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("OWNER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoadingAction("login");

    try {
      const requestedRole = selectedRole === "ADMIN" ? "ADMIN" : "OWNER";

      const response = await API.post("/auth/login", {
        email,
        password,
        role: requestedRole,
      });


      const payload = response?.data || {};
      const token = payload?.token || "";
      const role = getRoleFromToken(token);
      const tokenName = getNameFromToken(token);
      const firstName = getFirstNameFromPayload(payload, email);

      if (token) {
        localStorage.setItem("token", token);
      }
      setAuthDisplayName(tokenName || firstName || (email ? email.split("@")[0] : ""));

      if (payload.changePasswordRequired) {
        setSuccess("Login successful. Redirecting to set a new password.");
        navigate("/set-password");
      } else {
        setSuccess("Login successful. Navigating to your dashboard...");
        navigate(role === "ADMIN" ? "/dashboard" : "/user-dashboard");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div className="login-page min-h-screen px-4 py-10 text-slate-900">
      <div className="login-bg" aria-hidden="true">
        <span className="login-blob login-blob-one" />
        <span className="login-blob login-blob-two" />
        <span className="login-blob login-blob-three" />
      </div>

      <div className="login-paws" aria-hidden="true">
        <span className="paw paw-1">🐾</span>
        <span className="paw paw-2">🐾</span>
        <span className="paw paw-3">🐾</span>
        <span className="paw paw-4">🐾</span>
        <span className="paw paw-5">🐾</span>
      </div>

      <div className="login-card mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="brand-header">
          <div className="brand-badge" aria-hidden="true">
            <span>🐾</span>
          </div>
          <p className="brand-name">
            PetCare <span>Management</span> System
          </p>
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Login to PetCare
        </h1>

        <div className="role-toggle" aria-label="Select login role" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={selectedRole === "OWNER"}
            className={`role-toggle-option ${selectedRole === "OWNER" ? "active" : ""}`}
            onClick={() => setSelectedRole("OWNER")}
          >
            Pet Owner
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedRole === "ADMIN"}
            className={`role-toggle-option ${selectedRole === "ADMIN" ? "active" : ""}`}
            onClick={() => setSelectedRole("ADMIN")}
          >
            Admin
          </button>
        </div>

        <div className="login-credentials-note" aria-label="Default admin credential note">
          <p className="font-semibold"> login note</p>
          <p>Place the default admin email and password here for quick access during demos.</p>
          <p className="mt-1 text-xs text-teal-800/80">Email: admin@petwellness.com</p>
          <p className="mt-1 text-xs text-teal-800/80">Password: adminssakp</p>
        </div>

        {error ? <p className="status-message status-error">{error}</p> : null}
        {success ? <p className="status-message status-success">{success}</p> : null}

        <form className="login-form grid gap-3" onSubmit={handleLogin}>
          <div className="field-group stagger-1">
            <span className="field-icon" aria-hidden="true">✉️</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="field-group stagger-2">
            <span className="field-icon" aria-hidden="true">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input w-full"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.94 10.94 0 0112 19C7.52 19 3.73 16.06 2.46 12c.55-1.74 1.51-3.33 2.78-4.64" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88A3 3 0 0014.12 14.12" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.73 5.08A11.05 11.05 0 0112 5c4.48 0 8.27 2.94 9.54 7a10.96 10.96 0 01-1.88 3.12" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.64-7 10-7 10 7 10 7-3.64 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div className="forgot-password-row">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`login-button ${loadingAction === "login" ? "loading" : ""}`}
            disabled={loadingAction === "login"}
          >
            <span className="button-shimmer" aria-hidden="true" />
            <span className="button-content">
              <span className="button-paw" aria-hidden="true">🐾</span>
              <span className="button-label">{loadingAction === "login" ? "Logging in..." : "Login"}</span>
            </span>
            <span className="loading-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </form>

        <p className="login-footer text-sm text-slate-600">
          Need an account? <Link to="/register" className="font-semibold text-sky-700">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
