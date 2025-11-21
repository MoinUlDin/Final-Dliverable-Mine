import api from "./api";

export default class DashboardReportServices {
  static async FetchAdminDash() {
    try {
      const response = await api.get(`/dashbord/admin/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Admin Dash ", error);
      throw error.response?.data || error.message;
    }
  }
  static async FetchMemberDashboard(id: number | string | null = null) {
    try {
      const response = await api.get(`/dashbord/member/${id}/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Member Dash ", error);
      throw error.response?.data || error.message;
    }
  }
  static async FetchStatistics(param?: string) {
    try {
      const response = await api.get(`/tasks/statistics/?${param}`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Member Dash ", error);
      throw error.response?.data || error.message;
    }
  }
}
