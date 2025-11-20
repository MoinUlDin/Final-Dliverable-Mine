// Types/TaskTypes.ts
import type { UserCompactType } from "./UsersTypes";

export interface Assignees {
  assignee: UserCompactType;
  assigned_by: UserCompactType;
  assigned_at: "2025-11-16T13:01:54.222833+00:00";
}
export interface AttachedFile {
  id: string;
  file_name: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
  uploaded_by: UserCompactType;
  url: string;
}

export interface TasksType {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "Over_Due";
  progress: number;
  due_date: string;
  created_at: string;
  updated_at: string;
  completed_at: null;
  attached_files: AttachedFile[];
  created_by: UserCompactType;
  assigned_users: Assignees[];
  meta: any;
}
