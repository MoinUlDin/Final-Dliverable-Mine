import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Bell, CheckCircle, Clock, LogOut, User, User2, X } from "lucide-react";
import NotificationServices from "../services/NotificationServices";
import type { NotificationsType } from "../Types/NotificationsType";
import { useNavigate } from "react-router-dom";
import { CurrentUser } from "../utils/helper";
import { formatTime } from "../utils/helper";
import toast from "react-hot-toast";
type Props = {
  children: React.ReactNode;
};

export default function SidebarLayout({ children }: Props) {
  const [notification, setNotification] = useState<NotificationsType[] | null>(
    null
  );
  const [openNoti, setOpenNoti] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const CurrentUsr = CurrentUser();
  // unread count derived from notifications
  const unreadCount = (notification || []).reduce(
    (acc, n) => (n.read ? acc : acc + 1),
    0
  );

  // fetch notifications
  const fetchNotifications = async (): Promise<void> => {
    try {
      const r = await NotificationServices.FetchNotifications();
      setNotification(Array.isArray(r) ? (r as NotificationsType[]) : []);
    } catch (e) {
      console.error("Error Notifications: ", e);
    }
  };

  // initial fetch + polling every 10s (clean up on unmount)
  useEffect(() => {
    fetchNotifications();
    const id = window.setInterval(fetchNotifications, 10_000);
    return () => {
      window.clearInterval(id);
    };
  }, []); // run once

  // close dropdown on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      if (!dropdownRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!dropdownRef.current.contains(e.target)) {
        setOpenNoti(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // close Menu on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuOpen) return;
      if (!menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  // mark a single notification as read (optimistic update)
  const handleDelete = (id: string) => {
    if (!id) return toast.error("No id provided");
    NotificationServices.DeleteNotification(id)
      .then(() => {
        toast.success("Notifications Deleted Successfully");
        fetchNotifications();
      })
      .catch(() => {
        toast.error("Error Deleting Notification");
      });
  };

  async function handleMarkRead(id: string) {
    // optimistic UI
    setNotification((prev) =>
      prev ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : prev
    );
    NotificationServices.MarkAsRead(id)
      .then(() => {})
      .catch((e) => console.log("error mark read: ", e));
  }

  // mark all as read
  async function handleMarkAllRead() {
    // optimistic set
    setNotification((prev) =>
      prev ? prev.map((n) => ({ ...n, read: true })) : prev
    );
    NotificationServices.MarkAllAsRead()
      .then(() => {
        toast.success("All Marked as read");
        fetchNotifications();
      })
      .catch((e) => {
        console.log("notification Mark all read error: ", e);
        toast.error("error");
      });
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (left) */}
      <Sidebar />

      {/* Main Content (right) */}
      <div className="w-full ml-[50px] md:ml-0">
        {/* header with notifications */}
        <div className="flex border-b border-slate-200 w-full h-16 justify-between items-center px-6 py-2 bg-white shadow-sm">
          <div className="flex items-center">
            <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-slate-800">
              RBAC Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative mr-6">
              {/* bell button */}
              <button
                onClick={() => setOpenNoti((v) => !v)}
                aria-haspopup="true"
                aria-expanded={openNoti}
                className="relative p-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                title="Notifications"
              >
                <Bell size={20} className="text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center px-1.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Notifications*/}
              {openNoti && (
                <div
                  ref={dropdownRef}
                  className="absolute -right-[76px] md:right-0 mt-2 w-[290px] sm:min-w-[330px] md:min-w-[390px] max-w-[92vw] bg-white rounded-lg shadow-lg border overflow-hidden z-50"
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-slate-600" />
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          Notifications
                        </div>
                        <div className="text-xs text-slate-500">
                          {(notification || []).length} total
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded hover:bg-sky-100"
                          title="Mark all read"
                          type="button"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setOpenNoti(false)}
                        className="p-1 rounded hover:bg-slate-100"
                        title="Close"
                      >
                        <X className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-84 overflow-auto">
                    {notification && notification.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        No notifications
                      </div>
                    ) : (
                      <ul className="divide-y">
                        {(notification || []).map((n) => (
                          <li
                            key={String(n.id)}
                            onClick={() => handleMarkRead(n.id)}
                            className={`flex gap-3 px-4 py-3 hover:cursor-pointer ${
                              n.read ? "bg-white" : "bg-slate-200"
                            }`}
                          >
                            <div className="flex-shrink-0">
                              <div
                                className={`w-10 h-10 rounded-md flex items-center justify-center ${
                                  !n.read
                                    ? "bg-slate-600 border"
                                    : "bg-sky-600 text-white"
                                }`}
                              >
                                {!n.read ? (
                                  <Clock className="w-4 h-4 text-white" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-slate-900 truncate">
                                    {n.title}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    {n.message}
                                  </div>
                                </div>

                                <div className="text-xs text-slate-400 text-right whitespace-nowrap pl-2">
                                  {formatTime(n.created_at)}
                                </div>
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                {!n.read && (
                                  <button
                                    onClick={() => handleMarkRead(String(n.id))}
                                    className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded hover:bg-sky-100"
                                    type="button"
                                  >
                                    Mark read
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(String(n.id))}
                                  className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded hover:bg-sky-100"
                                  type="button"
                                >
                                  Delete
                                </button>
                                <div className="text-xs text-slate-400">
                                  Type: {n.type}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="px-4 py-3 border-t text-xs text-slate-500">
                    Click an item to mark as read.
                  </div>
                </div>
              )}
            </div>
            <div
              onClick={() => setMenuOpen((p) => !p)}
              className="rounded-full relative hover:cursor-pointer"
            >
              {CurrentUsr?.profile_picture ? (
                <img
                  className="size-8 rounded-full"
                  src={CurrentUsr?.profile_picture}
                  alt=""
                />
              ) : (
                <User2 />
              )}

              {/* User Drop Down */}
              {menuOpen && (
                <div
                  className="absolute -right-4 md:right-0 mt-2 min-w-[160px] sm:min-w-[200px] max-w-[92vw] bg-white rounded-lg shadow-lg border overflow-hidden z-50"
                  ref={menuRef}
                >
                  <ul className="space-y-1">
                    <li
                      onClick={() => navigate("/my-profile")}
                      className="px-4 py-3 hover:bg-orange-500 hover:text-white font-semibold flex items-center gap-1"
                    >
                      <User size={14} />
                      Profile
                    </li>
                    <li
                      onClick={handleLogout}
                      className="px-4 py-3 hover:bg-orange-400 hover:text-white font-semibold flex items-center gap-1"
                    >
                      <LogOut size={14} />
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <main className="flex-1 p-1 sm:p-2 md:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
