import api from "./api";

export default class TaskServices {
  /** GET /tasks/ */
  static async FetchTasks() {
    try {
      const response = await api.get(`/tasks/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Tasks", error);
      throw error.response?.data;
    }
  }

  /**
   * POST /tasks/
   *
   * If `files` is provided, sends multipart/form-data.
   * - `assignees` can be passed as an array of ids.
   *   - For multipart it will append each id as `assignees` field (getlist on backend).
   *   - For JSON it will send { assignees: [1,2] }.
   */
  static async CreateTask(
    data: Record<string, any>,
    files?: File[] | Blob[],
    assignees?: Array<number | string>,
    onUploadProgress?: (progressEvent: any) => void
  ) {
    try {
      if (files && files.length) {
        const form = new FormData();

        // append simple fields
        Object.keys(data || {}).forEach((k) => {
          const v = (data as any)[k];
          if (v === undefined || v === null) return;
          // objects/arrays -> JSON string
          if (
            typeof v === "object" &&
            !(v instanceof File) &&
            !(v instanceof Blob)
          ) {
            form.append(k, JSON.stringify(v));
          } else {
            form.append(k, String(v));
          }
        });

        // append assignees as multiple fields so backend.getlist('assignees') works
        if (assignees && assignees.length) {
          assignees.forEach((a) => form.append("assignees", String(a)));
        }

        files.forEach((f) => form.append("files", f));

        const response = await api.post(`/tasks/`, form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress,
        });
        return response.data;
      } else {
        // no files: send JSON body (backend will accept assignees array in validated_data)
        const payload = { ...data };
        if (assignees) payload.assignees = assignees;
        const response = await api.post(`/tasks/`, payload);
        return response.data;
      }
    } catch (error: any) {
      console.log("Error Creating Task", error);
      throw error.response?.data;
    }
  }

  /** GET /tasks/{id}/ */
  static async FetchTaskById(id: number | string) {
    try {
      const response = await api.get(`/tasks/${id}/`);
      return response.data;
    } catch (error: any) {
      console.log(`Error Fetching Task ${id}`, error);
      throw error.response?.data;
    }
  }

  /**
   * PUT /tasks/{id}/ - full update
   * If files provided, uses multipart/form-data and sends fields similarly to CreateTask.
   */
  static async UpdateTask(
    id: number | string,
    data: Record<string, any>,
    files?: File[] | Blob[],
    assignees?: Array<number | string>,
    onUploadProgress?: (progressEvent: any) => void
  ) {
    try {
      if (files && files.length) {
        const form = new FormData();
        Object.keys(data || {}).forEach((k) => {
          const v = (data as any)[k];
          if (v === undefined || v === null) return;
          if (
            typeof v === "object" &&
            !(v instanceof File) &&
            !(v instanceof Blob)
          ) {
            form.append(k, JSON.stringify(v));
          } else {
            form.append(k, String(v));
          }
        });
        if (assignees && assignees.length) {
          assignees.forEach((a) => form.append("assignees", String(a)));
        }
        files.forEach((f) => form.append("files", f));
        const response = await api.put(`/tasks/${id}/`, form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress,
        });
        return response.data;
      } else {
        const payload: any = { ...data };
        if (assignees) payload.assignees = assignees;
        const response = await api.put(`/tasks/${id}/`, payload);
        return response.data;
      }
    } catch (error: any) {
      console.log(`Error Updating Task ${id}`, error);
      throw error.response?.data;
    }
  }

  /** PATCH /tasks/{id}/ - partial update */
  static async PartialUpdateTask(
    id: number | string,
    data: Record<string, any>
  ) {
    try {
      const response = await api.patch(`/tasks/${id}/`, data);
      return response.data;
    } catch (error: any) {
      console.log(`Error Partially Updating Task ${id}`, error);
      throw error.response?.data;
    }
  }

  /** DELETE /tasks/{id}/ */
  static async DeleteTask(id: number | string) {
    try {
      const response = await api.delete(`/tasks/${id}/`);
      return response.data;
    } catch (error: any) {
      console.log(`Error Deleting Task ${id}`, error);
      throw error.response?.data;
    }
  }
  static async DeleteFile(id: string) {
    try {
      const response = await api.delete(`/tasks/remove-file/${id}/`);
      return response.data;
    } catch (error: any) {
      console.log(`Error Deleting Task ${id}`, error);
      throw error.response?.data;
    }
  }

  /**
   * POST /tasks/{id}/assign/
   * Body: { assignees: [1,2,3] }
   */
  static async AssignTask(
    id: number | string,
    assignees: Array<number | string>
  ) {
    try {
      const response = await api.post(`/tasks/${id}/assign/`, { assignees });
      return response.data;
    } catch (error: any) {
      console.log(`Error Assigning Task ${id}`, error);
      throw error.response?.data;
    }
  }

  /**
   * PATCH /tasks/{id}/update-progress/
   * Body: { progress: 50 }
   */
  static async UpdateProgress(id: number | string, progress: number) {
    try {
      const response = await api.patch(`/tasks/${id}/update-progress/`, {
        progress,
      });
      return response.data;
    } catch (error: any) {
      console.log(`Error Updating Progress for Task ${id}`, error);
      throw error.response?.data;
    }
  }

  /**
   * POST /tasks/{id}/upload-files/
   * multipart/form-data with `files` fields (backend uses request.FILES.getlist('files')).
   * extraData can include any additional fields (they will be appended to the form).
   */
  static async UploadFiles(
    id: number | string,
    files: File[] | Blob[],
    extraData?: Record<string, any>,
    onUploadProgress?: (progressEvent: any) => void
  ) {
    try {
      if (!files || !files.length) {
        throw { files: "No files provided." };
      }
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      if (extraData) {
        Object.keys(extraData).forEach((k) => {
          const v = (extraData as any)[k];
          if (v === undefined || v === null) return;
          if (typeof v === "object") form.append(k, JSON.stringify(v));
          else form.append(k, String(v));
        });
      }
      const response = await api.post(`/tasks/${id}/upload-files/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      });
      return response.data;
    } catch (error: any) {
      console.log(`Error Uploading Files for Task ${id}`, error);
      throw error.response?.data;
    }
  }

  /** GET /tasks/my-tasks/ */
  static async FetchMyTasks() {
    try {
      const response = await api.get(`/tasks/my-tasks/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching My Tasks", error);
      throw error.response?.data;
    }
  }
  /** GET /tasks/my-tasks/ */
  static async FetchMembers() {
    try {
      const response = await api.get(`/tasks/list-members/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching My Tasks", error);
      throw error.response?.data;
    }
  }
}
