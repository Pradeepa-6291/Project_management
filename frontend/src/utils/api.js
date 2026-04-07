import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ngo_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const path = window.location.pathname;
    const url = String(err.config?.url || "");
    const isAuthEndpoint = url.includes("/api/auth/login") || url.includes("/api/auth/register");
    if (status === 401 && !isAuthEndpoint && path !== "/login" && path !== "/register") {
      localStorage.removeItem("ngo_token");
      localStorage.removeItem("ngo_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
export const apiBaseUrl = baseURL;
