import api from "./api";

export default class ProfileServices {
  static async FetchProfile() {
    try {
      const response = await api.get(`/auth/profile/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching User ", error);
      throw error.response?.data || error.message;
    }
  }
  static async UpdateProfile(payload: any, image = false) {
    try {
      let response = null;
      if (image) {
        response = await api.patch(`/auth/profile/`, payload, {
          headers: { "Content-Type": "Multipart/formData" },
        });
      } else {
        response = await api.patch(`/auth/profile/`, payload);
      }

      return response?.data;
    } catch (error: any) {
      console.log("Error Fetching User ", error);
      throw error.response?.data || error.message;
    }
  }
  static async ChangePassword(payload: any) {
    try {
      const response = await api.post(`/auth/change-password/`, payload);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching User ", error);
      throw error.response?.data || error.message;
    }
  }
}
