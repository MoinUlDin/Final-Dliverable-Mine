import api from "./api";

export default class DashboardReportServices {
  static async FetchMemberDashboard(id: number | string | null = null) {
    try {
      const response = await api.get(`/dashbord/member/${id}/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Pending ", error);
      throw error.response?.data || error.message;
    }
  }
}
