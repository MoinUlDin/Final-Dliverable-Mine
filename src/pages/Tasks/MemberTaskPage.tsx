import { useEffect, useState } from "react";
import TaskServices from "../../services/TaskServices";
import toast from "react-hot-toast";
import { CheckCircle, CheckSquare, CloudDownload } from "lucide-react";
import type { TasksType, Assignees } from "../../Types/TaskTypes";
import { FormatFileName, FormatSize } from "../../utils/helper";

/* ---------- Utilities ---------- */
function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString();
}

function isOverdue(task: any) {
  if (!task.due_date) return false;
  if ((task.status || "").toLowerCase() === "completed") return false;
  return new Date(task.due_date) < new Date();
}

/* ---------- Component: TaskCard ---------- */
function TaskCard({
  task,
  onProgressChange,
  onMarkComplete,
}: {
  task: TasksType;
  onProgressChange: (id: string, progress: number) => Promise<void>;
  onMarkComplete: (id: string) => Promise<void>;
}) {
  const progress = task.progress ?? 0;
  const completed = task.status === "COMPLETED";

  const priorityColor =
    task.priority === "High"
      ? "bg-red-500"
      : task.priority === "Low"
      ? "bg-green-400"
      : "bg-yellow-400";

  return (
    <div
      key={`task-${task.id}`}
      className="bg-white rounded-xl shadow-sm border p-3 sm:p-5 flex flex-col justify-between min-h-[220px]"
    >
      <div>
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3
              className={`text-sm sm:text-lg font-semibold ${
                completed ? "line-through text-green-600" : ""
              } text-slate-800`}
            >
              {task.title}
            </h3>
            <p
              className={`text-sm ${
                completed ? "line-through text-gray-400" : ""
              } text-slate-500 mt-1 line-clamp-2`}
            >
              {task.description || "No description"}
            </p>
          </div>
          <div
            className={`px-1 sm:px-2 py-1 rounded text-xs font-semibold text-white ${priorityColor} self-start`}
          >
            {task.priority?.toUpperCase() ?? "MEDIUM"}
          </div>
        </div>

        {/* progress bar */}
        <div className="mt-4">
          <div className="text-xs text-slate-500 mb-2">Progress</div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-indigo-600 to-pink-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 gap-3">
            <div className="flex items-center gap-2">
              <select
                className="text-sm form-select min-w-24 px-2 py-1 rounded bg-white border"
                value={String(progress)}
                onChange={(e) =>
                  onProgressChange(task.id, Number(e.target.value))
                }
              >
                <option value="0">0%</option>
                <option value="10">10%</option>
                <option value="25">25%</option>
                <option value="30">30%</option>
                <option value="40">40%</option>
                <option value="50">50%</option>
                <option value="60">60%</option>
                <option value="70">70%</option>
                <option value="75">75%</option>
                <option value="80">80%</option>
                <option value="90">90%</option>
                <option value="100">100%</option>
              </select>
              {/* <div className="text-xs text-slate-500">({progress}%)</div> */}
            </div>
          </div>
        </div>

        {/* meta row */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-slate-500 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {task.assigned_users.map((item: Assignees) => {
              return (
                <div className="flex items-center gap-2">
                  <img
                    src={item.assignee.profile_picture}
                    alt={"Assignee"}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm text-slate-700">
                      {item.assignee.username}
                    </div>
                    <div className="text-xs text-slate-400">
                      By: {item.assigned_by.username ?? "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 text-right">
            <div>
              Due:{" "}
              <span
                className={`${
                  isOverdue(task) ? "text-red-500 font-semibold" : ""
                }`}
              >
                {formatDate(task.due_date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* bottom row: and attachments */}
      <div className="mt-4">
        <h4 className="text-gray-700 my-3">
          Total files: {task.attached_files.length}
        </h4>
        <div className="flex px-8 flex-col md:flex-row items-start md:items-center justify-between gap-2">
          {task.attached_files ? (
            task.attached_files.map((f) => {
              return (
                <a
                  key={`file-${f.id}`}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className=""
                >
                  <div>
                    <div>
                      <p className="text-gray-600 text-xs">
                        {FormatFileName(f.file_name)}
                      </p>
                      <p className="text-gray-600 text-xs">
                        size: {FormatSize(f.file_size)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <CloudDownload size={16} /> <span>Download</span>
                    </div>
                  </div>
                </a>
              );
            })
          ) : (
            <div className="text-xs text-slate-400">No attachment</div>
          )}
        </div>
      </div>
      {/* actions Button */}
      <div className="flex items-center gap-2 mt-5">
        {completed ? (
          <div className="flex items-center gap-2 bg-green-400 text-white px-3 py-1 rounded-md text-sm">
            <CheckSquare size={16} /> Completed
          </div>
        ) : (
          <button
            onClick={() => onMarkComplete(task.id)}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
            title="Mark Complete"
          >
            <CheckCircle size={16} /> Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Main page component ---------- */
export default function MemberTaskPage() {
  const [tasks, setTasks] = useState<TasksType[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "in_progress">(
    "all"
  );
  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    TaskServices.FetchMyTasks()
      .then((r) => {
        console.log("Tasks: ", r);
        setTasks(r);
      })
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load tasks");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function handleProgressChange(id: string, newProgress: number) {
    // optimistic update
    const prev = tasks.slice();
    setTasks((t) =>
      t.map((x) =>
        x.id === id
          ? {
              ...x,
              progress: newProgress,
              status: newProgress === 100 ? "Completed" : x.status,
            }
          : x
      )
    );

    const payload: any = { progress: newProgress };
    if (newProgress === 100) payload.status = "Completed";
    TaskServices.UpdateProgress(id, payload)
      .then(() => {
        toast.success("Progress updated");
        load();
      })
      .catch((e) => {
        setTasks(prev);
        console.log("Progress error", e);

        toast.error(e.detail || "Failed to update progress");
      });
  }

  async function handleMarkComplete(id: string) {
    const prev = tasks.slice();
    setTasks((t) =>
      t.map((x) =>
        x.id === id ? { ...x, progress: 100, status: "Completed" } : x
      )
    );
    try {
      TaskServices.UpdateTask(id, { progress: 100, status: "Completed" });
      toast.success("Task marked complete");
    } catch (err) {
      console.error("Error", err);
      setTasks(prev);
      toast.error("Failed to mark complete");
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "completed")
      return (t.status || "").toLowerCase() === "completed";
    if (filter === "in_progress")
      return (t.status || "").toLowerCase().includes("progress");
    return true;
  });

  return (
    <div className="p-2 md:p-4 lg:p-6 min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-emerald-700">
            My Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your assigned tasks and track progress
          </p>
        </div>

        {/* filters */}
        <div className="flex flex-col sm:flex-row flex-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="form-select"
            >
              <option value="all">All Tasks</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="completed">OverDue</option>
            </select>
            <select className="form-select">
              <option>Due Date</option>
              <option>Priority</option>
              <option>Progress</option>
            </select>
          </div>
          <div className="text-sm text-slate-500">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>

        {/* tasks grid */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-slate-500 py-10">
              Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 py-10">
              No tasks found.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={`tc-${task.id}`}
                task={task}
                onProgressChange={handleProgressChange}
                onMarkComplete={handleMarkComplete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
