import api from "./api";

export default class CommentServices {
  // List comments for a task (GET /comments/?task_id=<uuid>)
  static async FetchComments(taskId: string) {
    try {
      const q = encodeURIComponent(taskId);
      const response = await api.get(`/comments/?task_id=${q}`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Comments ", error);
      throw error.response?.data || error.message;
    }
  }

  // Create comment: POST /comments/ with body { task: <id>, text, parent? }
  static async PostComment(
    taskId: string,
    payload: { text: string; parent?: string }
  ) {
    try {
      const body = { ...payload, task: taskId };
      const response = await api.post(`/comments/`, body);
      return response.data;
    } catch (error: any) {
      console.log("Error posting Comment ", error);
      throw error.response?.data || error.message;
    }
  }

  // Update existing comment (PATCH /comments/:id/)
  static async UpdateComment(commentId: string, payload: any) {
    try {
      const response = await api.patch(`/comments/${commentId}/`, payload);
      return response.data;
    } catch (error: any) {
      console.log("Error Updating Comment ", error);
      throw error.response?.data || error.message;
    }
  }

  // Delete (soft-delete) comment (DELETE /comments/:id/)
  static async DeleteComment(commentId: string) {
    try {
      const response = await api.delete(`/comments/${commentId}/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Deleting Comment ", error);
      throw error.response?.data || error.message;
    }
  }
}
