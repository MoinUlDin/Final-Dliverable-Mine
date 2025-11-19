// Dashboard types
import type { UserCompactType } from "./UsersTypes";

export interface MemberTasksCompactType {
  id: string;
  title: string;
  status: string;
  over_due: false;
  dead_line: true;
  progress: number;
  due_date: string;
  assigned_at: string;
}
export interface MemberDashboardType {
  user: UserCompactType;
  counts: {
    total: number;
    in_progress: number;
    completed: number;
    overdue: number;
  };
  performance: {
    average_progress: number;
    on_time_completion_rate: number;
  };
  top_tasks: MemberTasksCompactType[];
}
