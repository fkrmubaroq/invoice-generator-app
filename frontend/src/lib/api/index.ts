import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ganti dengan base URL kamu
  timeout: 10000, // 10 detik
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;