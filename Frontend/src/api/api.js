import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

const baseURL = (configuredBaseUrl || "http://localhost:8080")
  .replace(/\/$/, "");

const API = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    Accept: "application/json, text/plain, */*",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
