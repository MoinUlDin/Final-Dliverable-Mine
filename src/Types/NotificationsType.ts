export interface NotificationsType {
  id: string;
  recipient: number;
  type: string;
  title: string;
  message: string;
  meta: {
    user_id: string;
  };
  read: boolean;
  created_at: string;
}
