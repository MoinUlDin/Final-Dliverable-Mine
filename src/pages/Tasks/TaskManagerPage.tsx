import { useEffect, useState, type JSX } from "react";
import TaskServices from "../../services/TaskServices";
import type { TasksType, AttachedFile } from "../../Types/TaskTypes";
import type { UserCompactType } from "../../Types/UsersTypes";

import {
  Plus,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  Upload,
  Download,
  MessageCircleCode,
} from "lucide-react";
import { FormatFileName, FormatSize } from "../../utils/helper";
import toast from "react-hot-toast";

export default function TaskManagerPage(): JSX.Element {
  const [tasks, setTasks] = useState<TasksType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // modals / UI state
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [activeTask, setActiveTask] = useState<TasksType | null>(null);

  // form state for create/edit
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDueDate, setFormDueDate] = useState<string | null>(null);
  const [formAssigneesCSV, setFormAssigneesCSV] = useState(""); // comma separated ids
  const [formFiles, setFormFiles] = useState<File[]>([]);

  // assign modal
  const [assignCSV, setAssignCSV] = useState("");

  // comment
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  function fetchTasks() {
    setLoading(true);
    setError(null);
    TaskServices.FetchTasks()
      .then((res) => {
        // assume API returns array
        console.log("tasks", res);
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
      await TaskServices.UploadFiles(task.id, files, undefined, (ev) => {});
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
    setActiveTask(t);
    setCommentText("");
    setShowComment(true);
  };
  const handleEdit = (task: TasksType) => {
    console.log("editing Task: ", task);
  };
  const handleAssign = (task: TasksType) => {
    console.log("Assigning Task: ", task);
  };
  const handleDeleteFile = (id: string) => {
    console.log("delete clicked wiht id: ", id);
    if (!id)
      return toast.error("No id found, System Error", { duration: 4000 });
    TaskServices.DeleteFile(id)
      .then(() => {
        toast.success("File Deleted Succussfully");
        fetchTasks();
      })
      .catch((e) => {
        toast.error("Error deleting file");
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 overflow-x-hidden p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col gap-3 sm:gap-1 sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
              Tasks — Manage
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Manage Tasks Effectively.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end">
            <button
              onClick={() => setShowCreate(true)}
              className="text-xs lg:text-sm inline-flex items-center gap-2 md:gap-1 lg:gap-2 px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800"
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
        </header>

        {/* error / loader */}
        {error && (
          <div className="mb-4 text-sm text-red-600">Error: {error}</div>
        )}

        {loading && <div className="mb-4 text-sm text-slate-600">Loading…</div>}

        {/* responsive grid */}
        <main>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
            {tasks.map((t) => (
              <article
                key={t.id}
                className="bg-white hover:shadow-lg hover:shadow-amber-200 transition-all duration-100 shadow-sm border border-gray-600 rounded-2xl p-4 flex flex-col"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-medium truncate">{t.title}</h2>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-3">
                      {t.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 self-end">
                    <div className="text-xs text-slate-500">
                      {t.status || "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div>
                      Due:{" "}
                      {t.due_date
                        ? new Date(t.due_date).toLocaleDateString()
                        : "—"}
                    </div>
                    <div>By: {t.created_by?.username || "—"}</div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${t.progress ?? 0}%`,
                          background: `linear-gradient(90deg,#4ade80,#06b6d4)`,
                        }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <div>{t.progress ?? 0}%</div>
                      <div className="flex items-center gap-2">
                        {(t.assigned_users || []).slice(0, 3).map((a) => (
                          <div
                            key={`assignee ${a.assignee.id}`}
                            className="text-xs italic bg-slate-100 px-2 py-0.5 rounded-full"
                          >
                            @{a.assignee.username}.
                          </div>
                        ))}
                        {(t.assigned_users || []).length > 3 && (
                          <div className="text-xs text-slate-400">
                            +{(t.assigned_users || []).length - 3}
                          </div>
                        )}
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
                          title="Click to Download"
                          className="group flex items-center justify-between hover:cursor-pointer gap-2 px-2 w-full transition-all duration-200 rounded
                 hover:bg-gradient-to-r hover:from-indigo-800 hover:via-blue-300 hover:to-green-400"
                        >
                          <div>
                            <a
                              href={f.url || "#"}
                              target="_blank"
                              rel="noreferrer"
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

                      <label className="ml-auto flex  items-center gap-2 cursor-pointer text-xs text-slate-500">
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
                    <button
                      className="p-1 rounded hover:bg-slate-100"
                      onClick={() => handleEdit(t)}
                      title="Edit"
                    >
                      <Edit className="size-4 sm:size-5" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-slate-100"
                      onClick={() => handleAssign(t)}
                      title="Assign"
                    >
                      <UserPlus className="size-4 sm:size-5" />
                    </button>
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
            ))}
          </div>

          {/* empty state */}
          {!loading && tasks.length === 0 && (
            <div className="mt-10 text-center text-slate-500">
              No tasks found. Create one with the New Task button.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
