import { getAuthDisplayName } from "./authState";

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

function firstNameFromValue(value) {
  if (typeof value !== "string") return "";

  const clean = value.trim();
  if (!clean) return "";

  const base = clean.includes("@") ? clean.split("@")[0] : clean;
  const firstChunk = base.split(/[\s._-]+/).find(Boolean) || "";
  if (!firstChunk) return "";

  return firstChunk.charAt(0).toUpperCase() + firstChunk.slice(1);
}

function fullNameFromValue(value) {
  if (typeof value !== "string") return "";

  const clean = value.trim();
  if (!clean) return "";

  return clean.includes("@") ? clean.split("@")[0] : clean;
}

export function getLoggedInFirstName(fallback = "Pet Parent") {
  const payload = decodeJwtPayload(localStorage.getItem("token"));
  const candidates = [
    localStorage.getItem("fullName"),
    localStorage.getItem("displayName"),
    payload?.fullName,
    payload?.name,
    localStorage.getItem("firstName"),
    payload?.firstName,
    payload?.first_name,
    payload?.given_name,
    localStorage.getItem("userName"),
    payload?.username,
    payload?.sub,
    payload?.email,
  ];

  const chosen = candidates.find((value) => typeof value === "string" && value.trim());
  return firstNameFromValue(chosen) || fallback;
}

function fullNameFallbackFromAuth() {
  const payload = decodeJwtPayload(localStorage.getItem("token"));
  const candidates = [
    getAuthDisplayName(),
    payload?.fullName,
    payload?.name,
    localStorage.getItem("userName"),
    payload?.username,
    payload?.sub,
    payload?.email,
  ];

  const chosen = candidates.find((value) => typeof value === "string" && value.trim());
  return fullNameFromValue(chosen);
}

export function getLoggedInFullName(fallback = "") {
  return fullNameFallbackFromAuth() || fallback;
}
