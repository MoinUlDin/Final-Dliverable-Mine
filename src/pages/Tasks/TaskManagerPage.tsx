import React, { useEffect, useState, Fragment, type JSX } from "react";
import TaskServices from "../../services/TaskServices";
import {
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Paperclip,
  MessageCircle,
  Check,
  X,
} from "lucide-react";

// Minimal Task shape — adjust to match your backend
interface UserSummary {
  id: number;
  username: string;
}

interface TaskFile {
  id: string;
  file_name: string;
  url?: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  progress?: number;
  created_by?: UserSummary | null;
  assignees?: UserSummary[];
  files?: TaskFile[];
  created_at?: string;
  due_date?: string | null;
}

export default function TaskManagerPage(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // modals / UI state
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

  // Helpers
  const parseCSVIds = (csv: string) =>
    csv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((v) => Number(v));

  // Create
  const handleCreate = async () => {
    const payload: Record<string, any> = {
      title: formTitle,
      description: formDescription,
      due_date: formDueDate,
    };

    const assignees = parseCSVIds(formAssigneesCSV);

    setLoading(true);
    try {
      const res = await TaskServices.CreateTask(
        payload,
        formFiles,
        assignees,
        (ev) => {
          // optional: can show upload progress
          // console.log('upload', ev.loaded / ev.total);
        }
      );
      // optimistic update
      setTasks((p) => [res, ...p]);
      resetForms();
      setShowCreate(false);
    } catch (err) {
      console.error(err);
      alert("Create failed: " + (JSON.stringify(err) || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setFormTitle("");
    setFormDescription("");
    setFormDueDate(null);
    setFormAssigneesCSV("");
    setFormFiles([]);
    setAssignCSV("");
    setCommentText("");
  };

  // Edit
  const openEdit = (t: Task) => {
    setActiveTask(t);
    setFormTitle(t.title || "");
    setFormDescription(t.description || "");
    setFormDueDate(t.due_date || null);
    setFormAssigneesCSV((t.assignees || []).map((a) => String(a.id)).join(","));
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    if (!activeTask) return;
    const payload: Record<string, any> = {
      title: formTitle,
      description: formDescription,
      due_date: formDueDate,
    };
    const assignees = parseCSVIds(formAssigneesCSV);

    setLoading(true);
    try {
      // if files provided and you want to replace, use UpdateTask with files
      const res = await TaskServices.UpdateTask(
        activeTask.id,
        payload,
        formFiles.length ? formFiles : undefined,
        assignees,
        (ev) => {}
      );
      // update local
      setTasks((prev) => prev.map((x) => (x.id === res.id ? res : x)));
      setShowEdit(false);
      resetForms();
      setActiveTask(null);
    } catch (err) {
      console.error(err);
      alert("Update failed: " + (JSON.stringify(err) || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (t: Task) => {
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

  // Assign
  const openAssign = (t: Task) => {
    setActiveTask(t);
    setAssignCSV((t.assignees || []).map((a) => String(a.id)).join(","));
    setShowAssign(true);
  };

  const handleAssign = async () => {
    if (!activeTask) return;
    const assignees = parseCSVIds(assignCSV);
    setLoading(true);
    try {
      const res = await TaskServices.AssignTask(activeTask.id, assignees);
      // backend returns created ids; refresh task (or refresh all tasks)
      fetchTasks();
      setShowAssign(false);
      setActiveTask(null);
      resetForms();
    } catch (err) {
      console.error(err);
      alert("Assign failed: " + (JSON.stringify(err) || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  // Upload files to existing task
  const handleUploadFiles = async (task: Task, files: File[]) => {
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

  // Progress update
  const handleProgress = async (task: Task, value: number) => {
    setLoading(true);
    try {
      const res = await TaskServices.UpdateProgress(task.id, value);
      setTasks((p) => p.map((x) => (x.id === res.id ? res : x)));
    } catch (err) {
      console.error(err);
      alert("Progress update failed: " + (JSON.stringify(err) || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  // Comments — using PartialUpdateTask sending { comment }
  const openComment = (t: Task) => {
    setActiveTask(t);
    setCommentText("");
    setShowComment(true);
  };

  const handleComment = async () => {
    if (!activeTask) return;
    if (!commentText.trim()) return alert("Comment cannot be empty");
    setLoading(true);
    try {
      const res = await TaskServices.PartialUpdateTask(activeTask.id, {
        comment: commentText,
      });
      // refresh tasks
      fetchTasks();
      setShowComment(false);
      setActiveTask(null);
      setCommentText("");
    } catch (err) {
      console.error(err);
      alert("Comment failed: " + (JSON.stringify(err) || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 overflow-x-hidden p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Tasks — Manage
            </h1>
            <p className="text-sm text-slate-500">
              Create, update, assign, delete and comment on tasks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus size={16} />
              New Task
            </button>
            <button
              onClick={() => fetchTasks()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white"
            >
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((t) => (
              <article
                key={t.id}
                className="bg-white shadow-sm rounded-2xl p-4 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-medium truncate">{t.title}</h2>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-3">
                      {t.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-slate-500">
                      {t.status || "-"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 rounded hover:bg-slate-100"
                        onClick={() => openEdit(t)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-slate-100"
                        onClick={() => openAssign(t)}
                        title="Assign"
                      >
                        <UserPlus size={16} />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-slate-100"
                        onClick={() => openComment(t)}
                        title="Comment"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-red-50 text-red-600"
                        onClick={() => handleDelete(t)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
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
                        {(t.assignees || []).slice(0, 3).map((a) => (
                          <div
                            key={a.id}
                            className="text-xs bg-slate-100 px-2 py-0.5 rounded-full"
                          >
                            {a.username}
                          </div>
                        ))}
                        {(t.assignees || []).length > 3 && (
                          <div className="text-xs text-slate-400">
                            +{(t.assignees || []).length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      Set progress:
                    </label>
                    <div className="flex items-center gap-2">
                      {[0, 25, 50, 75, 100].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleProgress(t, val)}
                          className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200"
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <label className="text-xs text-slate-500">Files:</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(t.files || []).map((f) => (
                        <a
                          key={f.id}
                          className="text-xs underline truncate max-w-[10rem]"
                          href={f.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Paperclip size={12} className="inline-block mr-1" />{" "}
                          {f.file_name}
                        </a>
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
                        <Paperclip size={14} /> Upload
                      </label>
                    </div>
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

      {/* Create Modal */}
      {showCreate && (
        <Dialog title={"Create Task"} onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <label className="block">
              <div className="text-sm font-medium">Title</div>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Description</div>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
                rows={4}
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label>
                <div className="text-sm font-medium">Due date</div>
                <input
                  type="date"
                  value={formDueDate || ""}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
              <label>
                <div className="text-sm font-medium">Assignees (IDs)</div>
                <input
                  placeholder="e.g. 3,4"
                  value={formAssigneesCSV}
                  onChange={(e) => setFormAssigneesCSV(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
            </div>

            <label className="block">
              <div className="text-sm font-medium">Files</div>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setFormFiles(e.target.files ? Array.from(e.target.files) : [])
                }
                className="mt-1"
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className="px-3 py-2 rounded bg-white border"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-slate-900 text-white"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Edit Modal */}
      {showEdit && activeTask && (
        <Dialog title={"Edit Task"} onClose={() => setShowEdit(false)}>
          <div className="space-y-3">
            <label className="block">
              <div className="text-sm font-medium">Title</div>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Description</div>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
                rows={4}
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label>
                <div className="text-sm font-medium">Due date</div>
                <input
                  type="date"
                  value={formDueDate || ""}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
              <label>
                <div className="text-sm font-medium">Assignees (IDs)</div>
                <input
                  placeholder="e.g. 3,4"
                  value={formAssigneesCSV}
                  onChange={(e) => setFormAssigneesCSV(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
            </div>

            <label className="block">
              <div className="text-sm font-medium">Add files (optional)</div>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setFormFiles(e.target.files ? Array.from(e.target.files) : [])
                }
                className="mt-1"
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className="px-3 py-2 rounded bg-white border"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-slate-900 text-white"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Assign Modal */}
      {showAssign && activeTask && (
        <Dialog
          title={`Assign — ${activeTask.title}`}
          onClose={() => setShowAssign(false)}
        >
          <div className="space-y-3">
            <div className="text-sm">
              Provide comma separated user ids to assign (only members are
              accepted by the backend).
            </div>
            <input
              value={assignCSV}
              onChange={(e) => setAssignCSV(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="e.g. 3,4,5"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className="px-3 py-2 rounded bg-white border"
                onClick={() => setShowAssign(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-slate-900 text-white"
                onClick={handleAssign}
              >
                Assign
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Comment Modal */}
      {showComment && activeTask && (
        <Dialog
          title={`Comment — ${activeTask.title}`}
          onClose={() => setShowComment(false)}
        >
          <div className="space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              rows={4}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className="px-3 py-2 rounded bg-white border"
                onClick={() => setShowComment(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-slate-900 text-white"
                onClick={handleComment}
              >
                Post
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

/*
  Small Dialog component used in this page — lightweight and responsive.
  Replace with your project's modal component if desired.
*/
function Dialog({
  title,
  children,
  onClose,
}: {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
            <X />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
