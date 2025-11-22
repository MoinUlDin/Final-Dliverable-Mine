export interface NotificationsType {
  id: string;
  recipient: number;
  type: "Comment" | "Assignment" | "Deadline Reminder" | "Update";
  title: string;
  message: string;
  meta: {
    user_id?: string;
    task_id?: string;
    comment_id?: string;
    parent_id?: string;
  };
  read: boolean;
  created_at: string;
}
