import axios from "axios";
import { navigateTo } from "./navigate";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api"),
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - unwrap {success, data} responses
api.interceptors.response.use(
  (response) => {
    // If response has nested {success, data}, unwrap to just data
    if (response.data && response.data.success !== undefined && response.data.data) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      navigateTo("/");
    }
    return Promise.reject(error);
  }
);

export default api;
