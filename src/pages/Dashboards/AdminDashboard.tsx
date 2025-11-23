// src/pages/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  CheckSquare,
  TrendingUp,
  Target,
  MoreHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardReportServices from "../../services/DashboardReportServices";
import { CurrentUser } from "../../utils/helper";

/* Use the local uploaded path so your infra can transform it to a URL */

type UserRow = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: "Admin" | "Manager" | "Member";
  is_active: boolean;
  picture?: string | null;
  total_tasks?: number;
  completed_tasks?: number;
  last_active?: string; // ISO date
};

type Stats = {
  total_users: number;
  managers: number;
  members: number;
  total_tasks: number;
  completed_tasks: number;
  performance_pct: number;
  active_projects?: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(""); // "", Admin, Manager, Member
  const CUser = CurrentUser();
  // pagination (simple client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    fetchDash();
  }, []);

  async function fetchDash() {
    setLoading(true);
    setError(null);
    try {
      const res = await DashboardReportServices.FetchAdminDash();
      // expected shape: { stats: {...}, users: [...] }
      if (!res) throw new Error("Empty response from dashboard API");

      const incomingStats = res.stats || res.data?.stats || null;
      const incomingUsers = res.users || res.data?.users || [];

      // normalize stats
      if (incomingStats) {
        setStats({
          total_users:
            incomingStats.total_users ?? incomingStats.totalUsers ?? 0,
          managers: incomingStats.managers ?? 0,
          members: incomingStats.members ?? 0,
          total_tasks:
            incomingStats.total_tasks ?? incomingStats.totalTasks ?? 0,
          completed_tasks:
            incomingStats.completed_count ??
            incomingStats.completed_tasks ??
            incomingStats.completedCount ??
            0,
          performance_pct: Math.round(
            (incomingStats.performance ?? incomingStats.performance_pct ?? 0) ||
              0
          ),
          active_projects:
            incomingStats.active_projects ?? incomingStats.active ?? undefined,
        });
      }

      // normalize users list -> UserRow
      const mapped: UserRow[] = (incomingUsers || []).map((u: any) => {
        const totalTasks =
          u.total_tasks_assigned ??
          u.total_tasks ??
          u.total_tasks_assigned ??
          u.totalTasksAssigned ??
          u.totalTasks ??
          0;
        const completedTasks =
          u.completed_tasks_assigned ??
          u.completed_tasks ??
          u.completedAssigned ??
          u.completedTasks ??
          0;
        return {
          id: u.id ?? u.pk ?? String(u.username ?? Math.random()),
          first_name: u.first_name ?? u.firstName ?? "",
          last_name: u.last_name ?? u.lastName ?? "",
          username: u.username ?? "",
          email: u.email ?? "",
          role: (u.role as "Admin" | "Manager" | "Member") ?? "Member",
          is_active: !!u.is_active,
          picture: u.picture ?? null,
          total_tasks: Number(totalTasks || 0),
          completed_tasks: Number(completedTasks || 0),
          last_active: u.last_active ?? u.date_joined ?? null,
        };
      });

      setUsers(mapped);
    } catch (err: any) {
      console.error("FetchAdminDash error:", err);
      setError(err?.message || "Failed to load dashboard");
      toast.error("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }

  // Filtering logic
  const filtered = useMemo(() => {
    const low = q.trim().toLowerCase();
    return users
      .filter((u) => (roleFilter ? u.role === roleFilter : true))
      .filter((u) => {
        if (!low) return true;
        return (
          u.username.toLowerCase().includes(low) ||
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(low) ||
          (u.email || "").toLowerCase().includes(low)
        );
      });
  }, [users, q, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900">
              {CUser.role === "Admin" ? "Admin" : "Manager"} Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview & user management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 hidden md:block">
              {users.length} users • {stats ? stats.total_tasks : "—"} total
              tasks
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
          <StatCard>
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div>
                <p className="text-xs text-slate-500">Total Users</p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats?.total_users ?? "—"}
                  </div>
                  <div className="text-sm text-green-600">+12%</div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-slate-900 text-white text-xs">
                    2 Mgr
                  </span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                    2 Mem
                  </span>
                </div>
              </div>
              <div className="p-1 sm:p-3 rounded-lg bg-indigo-50">
                <Users className="size-5 sm:size-6 text-indigo-600" />
              </div>
            </div>
          </StatCard>

          <StatCard>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-slate-500">Total Tasks</p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats?.total_tasks ?? "—"}
                  </div>
                  <div className="text-sm text-green-600">+8%</div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${
                          stats
                            ? Math.min(
                                100,
                                Math.round(
                                  (stats.completed_tasks /
                                    Math.max(1, stats.total_tasks)) *
                                    100
                                )
                              )
                            : 0
                        }%`,
                        background: "#0f172a",
                      }}
                    />
                  </div>
                  <div className="text-xs text-green-600 mt-2">
                    {stats
                      ? `${Math.round(
                          (stats.completed_tasks /
                            Math.max(1, stats.total_tasks)) *
                            100
                        )}% completion`
                      : ""}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <CheckSquare className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </StatCard>

          <StatCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">Performance</p>
                <div className="text-2xl font-bold text-slate-900">
                  {stats?.performance_pct ?? "—"}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {stats ? `${stats.completed_tasks} completed tasks` : ""}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </StatCard>

          <StatCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">Active Projects</p>
                <div className="text-2xl font-bold text-slate-900">
                  {stats?.active_projects ?? "—"}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {stats
                    ? `${Math.max(
                        0,
                        (stats.active_projects ?? 0) - 5
                      )} active users`
                    : ""}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </StatCard>
        </div>

        {/* Filters & search */}
        <div className="mb-4 flex flex-col lg:flex-row items-start lg:items-center gap-3 justify-between">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-3 py-2 rounded-md border w-full text-sm"
                placeholder="Search users..."
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-md border text-sm bg-white"
            >
              <option value="">All roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Member">Member</option>
            </select>
          </div>
        </div>

        {/* MOBILE/TABLET: card list (show when screen < lg) */}
        <div className="block lg:hidden space-y-3">
          {loading && <div className="text-sm text-slate-500">Loading…</div>}
          {!loading && pageData.length === 0 && (
            <div className="text-sm text-slate-500">No users found.</div>
          )}
          {pageData.map((u) => {
            const percent = u.total_tasks
              ? Math.round(
                  ((u.completed_tasks ?? 0) / Math.max(1, u.total_tasks)) * 100
                )
              : 0;
            return (
              <div
                key={u.id}
                className="bg-white rounded-xl shadow-sm border p-2 sm:p-4"
              >
                <div className="flex items-start gap-1 sm:gap-3">
                  <div className="size-8 sm:flex rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={u.picture!}
                      alt={`${u.first_name} ${u.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between gap-0 sm:gap-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0.5 sm:gap-2">
                        <div className="text-xs sm:text-sm font-medium text-slate-900 whitespace-nowrap">
                          {u.first_name} {u.last_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          @{u.username}
                        </div>
                        <div className="text-xs text-slate-500 truncate w-28 xs:w-full ">
                          {u.email}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500">Tasks</div>
                        <div className="text-sm font-medium text-slate-900">
                          {u.completed_tasks}/{u.total_tasks} completed
                        </div>
                      </div>

                      <div className="flex-1 w-full">
                        <div className="text-xs text-slate-500">
                          Performance
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                          <div
                            style={{
                              width: `${percent}%`,
                              background: "#0f172a",
                              height: "100%",
                            }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {percent}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                          u.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {u.is_active ? "active" : "inactive"}
                      </div>
                      <div>
                        <div
                          className={`inline-flex items-center gap-2 px-1 sm:px-2 py-1 rounded-full text-xs sm:text-xs ${
                            u.role === "Manager"
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {u.role.toLowerCase()}
                        </div>
                      </div>
                      <button
                        className="px-2 py-1 rounded-md border text-xs"
                        onClick={() => toast(`More ${u.username}`)}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP/LARGE: table (show only on lg and up) */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border p-4 md:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                    Tasks
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                    Performance
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-100">
                {pageData.map((u) => {
                  const percent = u.total_tasks
                    ? Math.round(
                        ((u.completed_tasks ?? 0) /
                          Math.max(1, u.total_tasks)) *
                          100
                      )
                    : 0;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-2 py-3 ">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold overflow-hidden">
                            <img
                              src={u.picture!}
                              alt={`${u.first_name} ${u.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {u.first_name} {u.last_name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3 ">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                            u.role === "Manager"
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {u.role.toLowerCase()}
                        </div>
                      </td>

                      <td className="px-2 py-3 align-middle">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                            u.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {u.is_active ? "active" : "inactive"}
                        </div>
                      </td>

                      <td className="px-2 py-3 align-middle">
                        <div className="text-xs text-slate-500">
                          {u.completed_tasks}/{u.total_tasks} completed
                        </div>
                      </td>

                      <td className="px-2 py-3 align-middle w-48">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${percent}%`,
                              background: "#0f172a",
                              height: "100%",
                            }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {percent}%
                        </div>
                      </td>

                      <td className="px-2 py-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="px-3 py-1 rounded-md border text-xs"
                            onClick={() => toast(`More ${u.username}`)}
                          >
                            <MoreHorizontal />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Showing {(page - 1) * pageSize + 1} -{" "}
              {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <div>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  name="pageSize"
                  id="pageSize"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <button
                className="px-2 py-1 rounded-md border text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <div className="text-xs">
                Page {page}/{totalPages}
              </div>
              <button
                className="px-2 py-1 rounded-md border text-xs"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* small footer */}
        <div className="mt-6 text-xs text-slate-400 text-center">
          Last updated: {new Date().toLocaleString()}
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        {loading && (
          <div className="mt-3 text-sm text-slate-500">Loading...</div>
        )}
      </div>
    </div>
  );
}

/* ----- Small wrappers ----- */
function StatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-3 sm:p-4 min-w-[160px]">
      {children}
    </div>
  );
}
