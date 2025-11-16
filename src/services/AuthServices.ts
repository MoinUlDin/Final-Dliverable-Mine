import axios from "axios";
import api from "./api";
const API_BASE_URL = "http://localhost:8000/api"; // Adjust to your DRF backend URL

class AuthServices {
  static async login(credentials: any) {
    try {
      const response = await api.post(`/auth/login/`, credentials);
      const { access, refresh, user_info } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user_info", JSON.stringify(user_info));
      return response.data;
    } catch (error: any) {
      console.log("Login Error: ", error);
      throw error.response?.data || error.message;
    }
  }

  static async register(userData: any) {
    try {
      const formData = new FormData();

      Object.entries(userData).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") return;

        if (key === "designation") {
          formData.append("role", value as string); // map designation → role
        } else if (key === "picture" && value instanceof File) {
          formData.append("picture", value); // ✅ only append if File
        } else {
          formData.append(key, value as string);
        }
      });

      const response = await api.post(`/auth/register/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      console.log("Register Error: ", error);
      throw error.response?.data || error.message;
    }
  }

  static async logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  static async refreshToken() {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) throw new Error("No refresh token available");

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh,
      });
      const { access } = response.data;
      localStorage.setItem("access_token", access);
      return access;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  static getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  static getAccessToken() {
    return localStorage.getItem("access_token");
  }

  static isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export default AuthServices;
