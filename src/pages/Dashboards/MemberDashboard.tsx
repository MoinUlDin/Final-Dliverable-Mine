// src/pages/dashboards/MemberDashboard.tsx
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";
import DashboardReportServices from "../../services/DashboardReportServices";
import type { MemberDashboardType } from "../../Types/DashboardTypes";
import { CurrentUser } from "../../utils/helper";

export default function MemberDashboard() {
  const userInfo = CurrentUser();
  const [dashData, setDashData] = useState<MemberDashboardType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMemberDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMemberDashboard = () => {
    setLoading(true);
    DashboardReportServices.FetchMemberDashboard()
      .then((r) => {
        setDashData(r);
      })
      .catch((e) => {
        console.error("member dash Error", e);
      })
      .finally(() => setLoading(false));
  };

  const formatDateShort = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const formatDateFull = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const dueRelativeText = (iso?: string | null) => {
    if (!iso) return "";
    const now = new Date();
    const due = new Date(iso);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffMs < 0) {
      const overdueDays = Math.ceil(-diffMs / (1000 * 60 * 60 * 24));
      return `Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}`;
    }
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

  const badgeForTask = (t: any) => {
    if (t.over_due) {
      return (
        <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
          <AlertCircle className="w-3.5 h-3.5" />
          Overdue
        </span>
      );
    }
    if (t.dead_line) {
      return (
        <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-100">
          <Calendar className="w-3.5 h-3.5" />
          Approaching
        </span>
      );
    }
    if (t.status === "COMPLETED" || t.progress === 100) {
      return (
        <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
          <CheckCircle className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-100">
        <Target className="w-3.5 h-3.5" />
        {t.status}
      </span>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-slate-800 mb-1">
            Member Dashboard
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg">
            Welcome back, {dashData?.user?.first_name ?? userInfo?.first_name}!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
            <img
              src={dashData?.user?.profile_picture ?? userInfo?.profile_picture}
              alt={dashData?.user?.username ?? userInfo?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">
                {dashData?.user?.first_name ?? userInfo?.first_name}{" "}
                {dashData?.user?.last_name ?? userInfo?.last_name}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {dashData?.user?.role ?? userInfo?.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6">
        <div className="bg-white p-3 lg:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs lg:text-sm font-medium text-slate-600">
                Tasks Completed
              </p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? "—" : dashData?.counts?.completed ?? 0}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
              <CheckCircle className="size-4 lg:size-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 lg:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs lg:text-sm font-medium text-slate-600">
                In Progress
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? "—" : dashData?.counts?.in_progress ?? 0}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
              <Clock className="size-4 lg:size-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 lg:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs lg:text-sm font-medium text-slate-600">
                Overdue
              </p>
              <p className="text-2xl font-bold text-red-600">
                {loading ? "—" : dashData?.counts?.overdue ?? 0}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-red-100 rounded-lg">
              <AlertCircle className="size-4 lg:size-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 lg:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs lg:text-sm font-medium text-slate-600">
                Performance
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {loading
                  ? "—"
                  : `${dashData?.performance?.average_progress ?? 0}%`}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="size-4 lg:size-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* My Tasks */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm sm:text-lg md:text-xl font-semibold text-slate-800">
            My Tasks
          </h2>
          <div className="text-xs sm:text-sm text-slate-500">
            Showing up to {dashData?.top_tasks?.length ?? 0} tasks
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
          {loading ? (
            <div className="space-y-3">
              <div className="h-14 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-14 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-14 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4">
              {(dashData?.top_tasks ?? []).map((t) => {
                const isOverdue = !!t.over_due;
                const isDeadline = !!t.dead_line && !isOverdue;
                const isCompleted =
                  t.status === "COMPLETED" || t.progress === 100;
                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border ${
                      isOverdue
                        ? "bg-red-50 border-red-200"
                        : isDeadline
                        ? "bg-yellow-50 border-yellow-200"
                        : isCompleted
                        ? "bg-green-50 border-green-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div
                      className={`hidden size-8 lg:size-10 rounded-full sm:flex items-center justify-center ${
                        isOverdue
                          ? "bg-red-100"
                          : isDeadline
                          ? "bg-yellow-100"
                          : isCompleted
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {isOverdue ? (
                        <AlertCircle className="size-4 lg:size-5 text-red-600" />
                      ) : isDeadline ? (
                        <Calendar className="size-4 lg:size-5 text-yellow-700" />
                      ) : isCompleted ? (
                        <CheckCircle className="size-4 lg:size-5 text-green-600" />
                      ) : (
                        <Clock className="size-4 lg:size-5 text-blue-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                            {t.title}
                          </p>
                          <p className="text-xs sm:text-sm whitespace-normal text-slate-500 truncate">
                            {isCompleted
                              ? `Completed ${formatDateFull(t.due_date)}`
                              : dueRelativeText(t.due_date)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">
                            {t.progress ?? 0}%
                          </p>
                          <p className="text-xs text-slate-400">
                            {t.assigned_at
                              ? formatDateShort(t.assigned_at)
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-0.5 sm:gap-2">
                        {badgeForTask(t)}
                        <div className="ml-2 text-xs text-slate-400">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-white/30 border border-slate-100">
                            {t.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* if no tasks */}
              {(!dashData?.top_tasks || dashData.top_tasks.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  No tasks found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
