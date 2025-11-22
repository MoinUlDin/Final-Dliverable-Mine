import { useEffect, useMemo, useState, type JSX } from "react";
import TaskServices from "../../services/TaskServices";
import type { TasksType, AttachedFile } from "../../Types/TaskTypes";
import CreateEditTask from "../../components/Popups.tsx/CreateEditTask";
import AssignmentPopup from "../../components/Popups.tsx/AssignmentPopup";
import CommentPopup from "../../components/Popups.tsx/CommentPopup";

import {
  Plus,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  Upload,
  Download,
  MessageCircleCode,
  User,
  Search,
  X,
} from "lucide-react";
import { FormatFileName, FormatSize } from "../../utils/helper";
import toast from "react-hot-toast";

/**
 * Fallback file URL (user-uploaded image). The developer requested that
 * uploaded file paths from the session be used directly. We'll use it as a
 * fallback when attached_files items don't have a url.
 *
 * We'll let your server/service transform this path into a proper public URL.
 */
const FILE_FALLBACK_URL = "/mnt/data/9aef8500-1147-42ce-9d1d-d741fbfb1d52.png";

export default function TaskManagerPage(): JSX.Element {
  const [tasks, setTasks] = useState<TasksType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<TasksType | null>(null);
  // modals / UI state
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [showAssign, setShowAssign] = useState<boolean>(false);
  const [showComment, setShowComment] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<TasksType | null>(null);

  // filters & search
  const [statusFilter, setStatusFilter] = useState<string>(""); // "", "PENDING", etc.
  const [priorityFilter, setPriorityFilter] = useState<string>(""); // "", "LOW", "MEDIUM", "HIGH"
  const [rawSearch, setRawSearch] = useState<string>("");
  const [search, setSearch] = useState<string>(""); // debounced
  const [debounceMs] = useState<number>(300);

  useEffect(() => {
    fetchTasks();
  }, []);

  // debounce rawSearch -> search
  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [rawSearch, debounceMs]);

  function fetchTasks() {
    setLoading(true);
    setError(null);
    TaskServices.FetchTasks()
      .then((res) => {
        setTasks(Array.isArray(res) ? res : []);
      })
      .catch((e) => {
        console.error(e);
        setError(typeof e === "string" ? e : JSON.stringify(e));
      })
      .finally(() => setLoading(false));
  }

  const handleDelete = async (t: TasksType) => {
    if (!confirm(`Delete task "${t.title}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await TaskServices.DeleteTask(t.id);
      setTasks((p) => p.filter((x) => x.id !== t.id));
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + (JSON.stringify(err) || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  // Upload files to existing task
  const handleUploadFiles = async (task: TasksType, files: File[]) => {
    if (!files || !files.length) return;
    setLoading(true);
    try {
      await TaskServices.UploadFiles(task.id, files, undefined, () => {});
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (JSON.stringify(err) || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  // Comments — using PartialUpdateTask sending { comment }
  const openComment = (t: TasksType) => {
    setSelectedTask(t);
    setShowComment(true);
  };
  const hendleCreate = () => {
    setInitialData(null);
    setShowCreate(true);
  };
  const handleEdit = (task: TasksType) => {
    setInitialData(task);
    setShowCreate(true);
  };
  const handleAssign = (task: TasksType) => {
    setSelectedTask(task);
    setShowAssign(true);
  };
  const handleDeleteFile = (id: string) => {
    if (!id)
      return toast.error("No id found, System Error", { duration: 4000 });
    TaskServices.DeleteFile(id)
      .then(() => {
        toast.success("File Deleted Successfully");
        fetchTasks();
      })
      .catch(() => {
        toast.error("Error deleting file");
      });
  };

  // helpers for badges and avatars (unchanged)
  const priorityBadge = (p: string) => {
    switch (p) {
      case "Low":
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      case "Medium":
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "High":
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "PENDING":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "Over_Due":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Filtering logic: memoized for performance
  const filteredTasks = useMemo(() => {
    const q = search.toLowerCase();

    return tasks.filter((t) => {
      // status filter
      if (
        statusFilter &&
        String(t.status).toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }
      // priority filter
      if (
        priorityFilter &&
        String(t.priority).toLowerCase() !== priorityFilter.toLowerCase()
      ) {
        return false;
      }
      // search across title, description, assignees (username, first_name, last_name)
      if (!q) return true;
      const inTitle = t.title?.toLowerCase().includes(q);
      const inDesc = t.description?.toLowerCase().includes(q);
      const inAssignees =
        Array.isArray(t.assigned_users) &&
        t.assigned_users.some((a) => {
          const u = a.assignee;
          return (
            (u.username && u.username.toLowerCase().includes(q)) ||
            (u.first_name && u.first_name.toLowerCase().includes(q)) ||
            (u.last_name && u.last_name.toLowerCase().includes(q))
          );
        });
      return Boolean(inTitle || inDesc || inAssignees);
    });
  }, [tasks, statusFilter, priorityFilter, search]);

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (priorityFilter ? 1 : 0) + (search ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 overflow-x-hidden pl-3 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col gap-3 sm:gap-2 md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
              Tasks — Manage
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Manage Tasks Effectively.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-start sm:items-center">
            <div className="flex items-center gap-3 self-end">
              <button
                onClick={hendleCreate}
                className="text-xs lg:text-sm inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800"
              >
                <Plus className="size-3 sm:size-4" />
                New Task
              </button>
              <button
                onClick={() => fetchTasks()}
                className="text-xs lg:text-sm inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white"
              >
                <RefreshCw className="size-3 sm:size-4" />
                Refresh
              </button>
            </div>
          </div>
        </header>
        {/* Search & Filters */}
        <div className="my-2">
          <div className="flex items-center gap-2 flex-col md:flex-row">
            <div className="relative flex-1 w-full flex">
              <Search className="absolute size-4 left-3 top-2 text-slate-400" />
              <input
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
                placeholder="Search title, description or assignees..."
                className="pl-10 pr-3 py-2 rounded-md border bg-white text-sm w-32 flex-1"
              />
              {rawSearch ? (
                <button
                  onClick={() => setRawSearch("")}
                  title="Clear search"
                  className="absolute right-2 top-1.5 text-slate-400"
                >
                  <X />
                </button>
              ) : null}
            </div>

            <div className="flex gap-2 items-center self-start">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 sm:px-3 py-2 rounded-md border bg-white text-xs sm:text-sm"
                aria-label="Filter by status"
              >
                <option value="">All status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="Over_Due">Overdue</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2 sm:px-3 py-2 rounded-md border bg-white text-xs sm:text-sm"
                aria-label="Filter by priority"
              >
                <option value="">All priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <button
              onClick={() => {
                setStatusFilter("");
                setPriorityFilter("");
                setRawSearch("");
              }}
              className="px-3 py-2 rounded-md border bg-white text-sm"
            >
              Clear
            </button>
          </div>
        </div>
        {/* small status row */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-1 justify-between mb-4">
          <div className="text-sm text-slate-600">
            Showing <strong>{filteredTasks.length}</strong> of{" "}
            <strong>{tasks.length}</strong> tasks
            {activeFilterCount ? (
              <span className="ml-3 text-xs text-slate-500">
                ({activeFilterCount} filter(s) active)
              </span>
            ) : null}
          </div>

          <div className="text-xs text-slate-500">
            Tip: search by assignee username or name
          </div>
        </div>

        {/* error / loader */}
        {error && (
          <div className="mb-4 text-sm text-red-600">Error: {error}</div>
        )}

        {loading && <div className="mb-4 text-sm text-slate-600">Loading…</div>}

        {/* responsive grid */}
        <main>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
            {filteredTasks.map((t) => {
              const completed = t.status === "COMPLETED";
              return (
                <article
                  key={t.id}
                  className={`hover:shadow-lg ${
                    completed ? "bg-green-50" : "bg-white"
                  }  hover:shadow-amber-200 transition-all duration-100 shadow-sm border border-gray-200 rounded-2xl p-4 flex flex-col`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2
                          className={`text-sm md:text-lg font-medium truncate ${
                            completed ? "line-through text-gray-400" : ""
                          }`}
                        >
                          {t.title}
                        </h2>

                        {/* priority badge */}
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${priorityBadge(
                            t.priority
                          )}`}
                        >
                          {t.priority || "—"}
                        </span>

                        {/* status badge */}
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${statusBadge(
                            t.status
                          )}`}
                        >
                          {t.status || "—"}
                        </span>
                      </div>

                      <p
                        className={`mt-2 text-sm text-slate-500 line-clamp-3 ${
                          completed ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {t.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 self-end">
                      <div className="text-xs text-slate-500">
                        {t.due_date
                          ? new Date(t.due_date).toLocaleDateString()
                          : "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        By: {t.created_by?.username || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${t.progress ?? 0}%`,
                          background: `linear-gradient(90deg,#4ade80,#06b6d4)`,
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      {t.progress ?? 0}%
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        {/* assignee count badge */}
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-slate-500">
                            Assignees:
                          </div>
                          <div className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                            {(t.assigned_users || []).length || 0}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-1">
                          {(t.assigned_users || []).map((a, idx) => (
                            <div
                              key={`assignee-${a.assignee.id}-${idx}`}
                              className="flex items-center gap-2 text-xs bg-white border border-slate-100 px-2 py-0.5 rounded-full"
                            >
                              {a.assignee.profile_picture ? (
                                <img
                                  src={a.assignee.profile_picture}
                                  alt={a.assignee.username}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <User className="size-4" />
                              )}
                              <div className="">@{a.assignee.username}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 gap-2">
                      <div>
                        <label className="text-xs text-slate-500">
                          Files: {t?.attached_files?.length || 0}
                        </label>
                      </div>

                      <div className="flex flex-col items-start gap-2 flex-wrap">
                        {(t.attached_files || []).map((f: AttachedFile) => (
                          <div
                            key={f.id}
                            className="group flex items-center justify-between hover:cursor-pointer gap-2 px-2 w-full transition-all duration-200 rounded hover:bg-gradient-to-r hover:from-indigo-800 hover:via-blue-300 hover:to-green-400"
                          >
                            <div>
                              <a
                                href={f.url || FILE_FALLBACK_URL}
                                target="_blank"
                                rel="noreferrer"
                                title="Click to Download"
                                className="inline-flex items-center gap-2 transition-colors duration-200 group-hover:text-white"
                              >
                                <Download
                                  size={14}
                                  className="inline-block mr-1 transition-colors duration-200 group-hover:text-white"
                                />
                                <span className="text-xs font-semibold truncate max-w-[12rem] block">
                                  {FormatFileName(f.file_name, 20)}
                                </span>
                              </a>

                              <p className="text-[10px] text-gray-500 pl-[26px] transition-colors duration-200 group-hover:text-white/80">
                                Size: {FormatSize(f.file_size)}
                              </p>
                            </div>

                            <div
                              onClick={() => handleDeleteFile(f.id)}
                              title="Delete File"
                              className="px-2 sm:px-3 py-3 text-black hover:text-red-700"
                            >
                              <Trash2 className="size-4" />
                            </div>
                          </div>
                        ))}

                        <label className="ml-auto flex items-center gap-2 cursor-pointer text-xs text-slate-500">
                          <input
                            type="file"
                            className="hidden"
                            multiple
                            onChange={(e) =>
                              e.target.files &&
                              handleUploadFiles(t, Array.from(e.target.files))
                            }
                          />
                          <span
                            title="Upload File"
                            className="flex item-center gap-2 border hover:border-indigo-950 border-gray-500 hover:bg-blue-800 hover:text-white px-4 py-2 rounded"
                          >
                            <Upload size={14} /> Upload
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 sm:gap-4 mt-4">
                      {t.status !== "COMPLETED" && (
                        <button
                          className="p-1 rounded hover:bg-slate-100"
                          onClick={() => handleEdit(t)}
                          title="Edit"
                        >
                          <Edit className="size-4 sm:size-5" />
                        </button>
                      )}
                      {t.status !== "COMPLETED" && (
                        <button
                          className="p-1 rounded hover:bg-slate-100"
                          onClick={() => handleAssign(t)}
                          title="Assign"
                        >
                          <UserPlus className="size-4 sm:size-5" />
                        </button>
                      )}

                      <button
                        className="p-1 rounded hover:bg-slate-100"
                        onClick={() => openComment(t)}
                        title="Comment"
                      >
                        <MessageCircleCode className="size-4 sm:size-5" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-red-50 text-red-600"
                        onClick={() => handleDelete(t)}
                        title="Delete"
                      >
                        <Trash2 className="size-4 sm:size-5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* empty state */}
          {!loading && filteredTasks.length === 0 && (
            <div className="mt-10 text-center text-slate-500">
              No tasks found. Create one with the New Task button.
            </div>
          )}
        </main>
      </div>

      {showCreate && (
        <CreateEditTask
          onSuccess={fetchTasks}
          initialData={initialData}
          onClose={() => setShowCreate(false)}
        />
      )}
      {showAssign && (
        <AssignmentPopup
          onSuccess={fetchTasks}
          task={selectedTask}
          onClose={() => setShowAssign(false)}
        />
      )}
      {showComment && (
        <CommentPopup
          task={selectedTask!}
          onClose={() => setShowComment(false)}
        />
      )}
    </div>
  );
}
