export const BASE_URL = 'https://waverbackend-production.up.railway.app'
// export const BASE_URL = 'http://localhost:8080'

// src/api.js
import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:8080",
  baseURL: "https://waverbackend-production.up.railway.app",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
