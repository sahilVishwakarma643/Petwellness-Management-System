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

export function getLoggedInFirstName(fallback = "Pet Parent") {
  const payload = decodeJwtPayload(localStorage.getItem("token"));
  const candidates = [
    localStorage.getItem("firstName"),
    localStorage.getItem("userName"),
    payload?.firstName,
    payload?.first_name,
    payload?.given_name,
    payload?.fullName,
    payload?.name,
    payload?.username,
    payload?.sub,
    payload?.email,
  ];

  const chosen = candidates.find((value) => typeof value === "string" && value.trim());
  return firstNameFromValue(chosen) || fallback;
}
