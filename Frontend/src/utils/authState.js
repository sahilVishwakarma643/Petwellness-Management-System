let authDisplayName = "";

export function setAuthDisplayName(name) {
  authDisplayName = typeof name === "string" ? name.trim() : "";
}

export function getAuthDisplayName() {
  return authDisplayName;
}

export function clearAuthDisplayName() {
  authDisplayName = "";
}
