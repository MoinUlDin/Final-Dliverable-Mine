// Types/TaskTypes.ts
import type { UserCompactType } from "./UsersTypes";

export interface Assignees {
  assignee: UserCompactType;
  assigned_by: UserCompactType;
  assigned_at: "2025-11-16T13:01:54.222833+00:00";
}
export interface MembersTasks {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  progress: number;
  due_date: string;
  created_at: string;
  updated_at: string;
  completed_at: null;
  created_by: UserCompactType;
  assigned_users: Assignees[];
  meta: any;
}
