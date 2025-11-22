import api from "./api";

export default class UserManagerment {
  static async FetchpendingRequests() {
    try {
      const response = await api.get(`/auth/pending-requests`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Pending ", error);
      throw error.response?.data || error.message;
    }
  }
  static async ApproveRequest(payload: any) {
    try {
      const response = await api.post(`/auth/approve/`, payload);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Pending ", error);
      throw error.response?.data || error.message;
    }
  }
  static async RejectRequest(payload: any) {
    try {
      const response = await api.post(`/auth/approve/`, payload);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Pending ", error);
      throw error.response?.data || error.message;
    }
  }
}
