import React, { useEffect, useState } from "react";
import TaskServices from "../../services/TaskServices";
import type { TasksType } from "../../Types/TaskTypes";
import type { UserCompactType } from "../../Types/UsersTypes";

import { X, Upload, Check, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialData: TasksType | null;
}

type Errors = Partial<Record<string, string>>;

const PRIORITY_OPTIONS = [
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
  { value: "High", label: "High" },
];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function CreateEditTask({ onClose, onSuccess, initialData = null }: Props) {
  const editing = Boolean(initialData);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [members, setMembers] = useState<UserCompactType[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  // form fields
  const [title, setTitle] = useState<string>(initialData?.title ?? "");
  const [description, setDescription] = useState<string>(
    initialData?.description ?? ""
  );
  const [priority, setPriority] = useState<string>(
    initialData?.priority ?? "Medium"
  );
  const [status, setStatus] = useState<string>(
    initialData?.status ?? "PENDING"
  );
  // progress only used for editing (not sent on create)
  const [progress, setProgress] = useState<number>(initialData?.progress ?? 0);
  // due_date: datetime-local value
  const [dueDate, setDueDate] = useState<string>(
    initialData?.due_date ? toDatetimeLocal(initialData.due_date) : ""
  );

  // assignees: array of user ids (assigned_users shape on the read side)
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>(
    extractAssignedIds(initialData) ?? []
  );

  useEffect(() => {
    fetchAssignees();
    // refresh form whenever modal opened with different initialData
    setTitle(initialData?.title ?? "");
    setDescription(initialData?.description ?? "");
    setPriority(initialData?.priority ?? "Medium");
    setStatus(initialData?.status ?? "PENDING");
    setProgress(initialData?.progress ?? 0);
    setDueDate(
      initialData?.due_date ? toDatetimeLocal(initialData.due_date) : ""
    );
    setSelectedAssignees(extractAssignedIds(initialData) ?? []);
    setFiles([]);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  async function fetchAssignees() {
    setLoadingMembers(true);
    try {
      const r = await TaskServices.FetchMembers();
      setMembers(Array.isArray(r) ? r : []);
    } catch (e) {
      console.error("Error Fetching Assignees: ", e);
      toast.error("Unable to load members list");
    } finally {
      setLoadingMembers(false);
    }
  }

  function toggleAssignee(id: number) {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function onFilesChange(list: FileList | null) {
    setFiles(list ? Array.from(list) : []);
  }

  function validate(): boolean {
    const e: Errors = {};
    if (!title.trim()) e.title = "Title is required";
    if (!dueDate) e.due_date = "Due date is required";
    if (!priority) e.priority = "Priority is required";
    if (!status) e.status = "Status is required";
    // if editing, validate progress
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev?: React.FormEvent) {
    ev?.preventDefault();
    if (!validate()) {
      toast.error("Please fix highlighted errors", { duration: 3000 });
      return;
    }

    // Build payload to match TaskViewSet.perform_create expectations
    const basePayload: Record<string, any> = {
      title: title.trim(),
      description: description || "",
      priority,
      status,
      // backend expects ISO datetime; we convert from datetime-local
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      // 'assignees' will be sent separately (as array)
    };

    setSubmitting(true);
    try {
      if (editing && initialData?.id) {
        // For updates include progress (allowed) and other fields. Use UpdateTask signature:
        // UpdateTask(id, data, files?, assignees?)
        const updatePayload = { ...basePayload, progress: Number(progress) };
        await TaskServices.UpdateTask(
          initialData.id,
          updatePayload,
          files.length ? files : undefined,
          selectedAssignees
        );
        toast.success("Task updated successfully");
      } else {
        // CREATE: do NOT include progress per request. Use CreateTask signature:
        // CreateTask(data, files?, assignees?)
        await TaskServices.CreateTask(
          basePayload,
          files.length ? files : undefined,
          selectedAssignees
        );
        toast.success("Task created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Create/Update error", error);
      toast.error("Operation failed. See console for details");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => (submitting ? null : onClose())}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden"
        aria-labelledby="task-modal-title"
      >
        <div className="flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-sky-400 to-emerald-300">
          <div>
            <h3
              id="task-modal-title"
              className="text-lg md:text-xl font-semibold text-slate-900"
            >
              {editing ? "Update Task" : "Create Task"}
            </h3>
            <p className="text-xs text-slate-800/80">
              {editing
                ? "Edit fields and save"
                : "Fill required fields to create a task"}
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => (submitting ? null : onClose())}
              className="p-2 rounded hover:bg-red-200"
              aria-label="Close"
            >
              <X />
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.title
                    ? "border-red-400 ring-red-100"
                    : "border-slate-200 ring-sky-100"
                }`}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle size={14} /> {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 border-slate-200"
                placeholder="Optional longer description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Files
              </label>
              <div className="mt-1 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => onFilesChange(e.target.files)}
                  />
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded border border-slate-200 hover:bg-sky-50">
                    <Upload size={14} /> Attach files
                  </span>
                </label>
                <div className="text-xs text-slate-500">
                  {files.length
                    ? `${files.length} file(s) selected`
                    : "No files selected"}
                </div>
              </div>

              {files.length > 0 && (
                <ul className="mt-2 max-h-28 overflow-auto text-xs space-y-1">
                  {files.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 bg-slate-50 px-2 py-1 rounded"
                    >
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="text-xs text-red-600 px-2"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Priority *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.priority
                      ? "border-red-400 ring-red-100"
                      : "border-slate-200 ring-sky-100"
                  }`}
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-xs text-red-600">{errors.priority}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.status
                      ? "border-red-400 ring-red-100"
                      : "border-slate-200 ring-sky-100"
                  }`}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs text-red-600">{errors.status}</p>
                )}
              </div>
            </div>

            {editing && (
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Progress (%)
                </label>
                <input
                  type="number"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  min={0}
                  max={100}
                  className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.progress
                      ? "border-red-400 ring-red-100"
                      : "border-slate-200 ring-sky-100"
                  }`}
                />
                {errors.progress && (
                  <p className="mt-1 text-xs text-red-600">{errors.progress}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Due date *
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.due_date
                    ? "border-red-400 ring-red-100"
                    : "border-slate-200 ring-sky-100"
                }`}
              />
              {errors.due_date && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle size={14} /> {errors.due_date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Assignees (optional)
              </label>
              <div className="mt-1 border rounded-md p-2 max-h-40 overflow-auto bg-white">
                {loadingMembers ? (
                  <div className="text-xs text-slate-500">Loading members…</div>
                ) : members.length === 0 ? (
                  <div className="text-xs text-slate-500">No members found</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {members.map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 text-sm p-1 rounded hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAssignees.includes(m.id)}
                          onChange={() => toggleAssignee(m.id)}
                          className="h-4 w-4"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-xs">
                            @{m.username}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {m.first_name} {m.last_name}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                You may leave this empty — admins can create tasks without
                assigning anyone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 md:p-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => (submitting ? null : onClose())}
            className="px-3 py-2 rounded bg-white border text-sm"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-slate-900 text-white text-sm disabled:opacity-60"
            disabled={submitting}
          >
            <Check />
            {submitting
              ? editing
                ? "Saving..."
                : "Creating..."
              : editing
              ? "Save"
              : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEditTask;

/* ---------- helpers ---------- */

function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => `${n}`.padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  } catch {
    return "";
  }
}

function extractAssignedIds(initialData: TasksType | null): number[] {
  if (!initialData) return [];
  try {
    // assigned_users: Assignees[] -> { assignee: UserCompactType }
    if (
      Array.isArray(initialData.assigned_users) &&
      initialData.assigned_users.length
    ) {
      return initialData.assigned_users
        .map((a) => Number(a.assignee?.id))
        .filter(Boolean);
    }
    // fallback: no assignments
  } catch (e) {
    /* noop */
  }
  return [];
}
