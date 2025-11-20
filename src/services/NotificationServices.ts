import api from "./api";

export default class NotificationServices {
  static async FetchNotifications() {
    try {
      const response = await api.get(`/tasks/notifications/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Active Users ", error);
      throw error.response?.data || error.message;
    }
  }
  static async MarkAsRead(id: string) {
    try {
      const response = await api.post(`/tasks/notifications/${id}/mark-read/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Active Users ", error);
      throw error.response?.data || error.message;
    }
  }
  static async MarkAllAsRead() {
    try {
      const response = await api.post(`/tasks/notifications/mark-all-read/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Active Users ", error);
      throw error.response?.data || error.message;
    }
  }
  static async DeleteNotification(id: string) {
    try {
      const response = await api.delete(`/tasks/notifications/${id}/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Active Users ", error);
      throw error.response?.data || error.message;
    }
  }
}
