import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";

import TaskServices from "../../services/TaskServices";
import type { TasksType, Assignees } from "../../Types/TaskTypes";
import type { UserCompactType } from "../../Types/UsersTypes";

interface Props {
  task: TasksType | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * AssignmentPopup
 *
 * - Shows current assignees (removable locally)
 * - Shows available members (searchable) to add
 * - On Save -> sends full list of assignee IDs to backend
 *   TaskServices.AssignTask(taskId, { assignees: number[] })
 */
const AssignmentPopup: React.FC<Props> = ({
  task = null,
  onClose,
  onSuccess,
}) => {
  const [members, setMembers] = useState<UserCompactType[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);

  // local set of assignee IDs (we will send this array to the API)
  const [localAssigneeIds, setLocalAssigneeIds] = useState<number[]>([]);

  // search input for member list
  const [search, setSearch] = useState<string>("");

  // processing state for save
  const [processing, setProcessing] = useState<boolean>(false);

  // fetch members once
  useEffect(() => {
    setLoadingMembers(true);
    TaskServices.FetchMembers()
      .then((res: UserCompactType[]) => {
        setMembers(res || []);
      })
      .catch((err) => {
        console.error("ListMembers error", err);
        toast.error("Failed to load members.");
      })
      .finally(() => setLoadingMembers(false));
  }, []);

  // initialize localAssigneeIds from task.assigned_users on mount / task change
  useEffect(() => {
    const ids: number[] = [];
    if (task?.assigned_users && Array.isArray(task.assigned_users)) {
      (task.assigned_users as Assignees[]).forEach((a) => {
        // Assignees.assignee is a UserCompactType per your Types file
        if (
          a &&
          (a as any).assignee &&
          typeof (a as any).assignee.id === "number"
        ) {
          ids.push((a as any).assignee.id);
        }
      });
    }
    setLocalAssigneeIds(ids);
  }, [task]);

  // helper: check if user is currently selected
  const isSelected = (id: number) => localAssigneeIds.includes(id);

  // toggle add/remove in local set
  function toggleUserLocal(id: number) {
    setLocalAssigneeIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      return [...prev, id];
    });
  }

  // build filtered available members (exclude those already in localAssigneeIds)
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const assignedSet = new Set(localAssigneeIds);
    return members
      .filter((m) => !assignedSet.has(m.id))
      .filter((m) => {
        if (!q) return true;
        return (
          (m.first_name || "").toLowerCase().includes(q) ||
          (m.last_name || "").toLowerCase().includes(q) ||
          (m.username || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q)
        );
      });
  }, [members, localAssigneeIds, search]);

  // names helper
  const displayName = (u?: UserCompactType | null) =>
    u
      ? `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username
      : "Unknown";

  // Save -> send full assignees array to backend
  function handleSave() {
    if (!task?.id) return;
    setProcessing(true);
    const payload = { assignees: localAssigneeIds };
    console.log("sending Paylaod: ", payload);

    TaskServices.AssignTask(task.id, payload)
      .then(() => {
        toast.success("Assignments updated.");
        onSuccess();
        onClose();
      })
      .catch((e) => {
        console.error("AssignTask error", e);
        toast.error("Failed to update assignments.");
      })
      .finally(() => setProcessing(false));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        aria-hidden="true"
        onClick={() => !processing && onClose()}
      />

      {/* modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-modal-title"
        className="relative z-50 w-full h-[95%] max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-auto"
      >
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3
              id="assign-modal-title"
              className="text-lg font-semibold text-slate-800"
            >
              Assign Members
            </h3>
            <p className="text-sm text-slate-500">
              Add or remove members for task{" "}
              <span className="font-medium text-slate-700">
                {task?.title ?? ""}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => !processing && onClose()}
              className="p-2 rounded-md hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="p-4 space-y-4">
          {/* Current assignees (editable locally) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-700">
                Current Assignees
              </h4>
              <div className="text-xs text-slate-400">
                {localAssigneeIds.length} selected
              </div>
            </div>

            {localAssigneeIds.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-50 text-slate-500">
                No assignees yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {localAssigneeIds.map((id) => {
                  // find full user info either from task.assigned_users or members cache
                  const fromAssigned = (task?.assigned_users || []).find(
                    (a: Assignees) =>
                      (a as any).assignee && (a as any).assignee.id === id
                  );
                  const user =
                    (fromAssigned && (fromAssigned as any).assignee) ||
                    members.find((m) => m.id === id) ||
                    null;

                  return (
                    <li
                      key={String(id)}
                      className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-5 sm:size-7 md:size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-xs sm:text-sm font-medium">
                          {(
                            user?.first_name?.[0] ??
                            user?.username?.[0] ??
                            "U"
                          ).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {displayName(user)}
                          </div>
                          <div className="text-xs text-slate-400">
                            {user?.email ?? ""}
                          </div>
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => toggleUserLocal(id)}
                          className="inline-flex items-center gap-1 sm:gap-2 px-1 sm:px-3 py-1 rounded-md text-sm bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                          disabled={processing}
                        >
                          <Trash2 className="size-4" />
                          <span className="hidden sm:block">Remove</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Add assignees */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-700">
                Add Members
              </h4>
              <div className="text-xs text-slate-400">
                {filteredMembers.length} available
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              {/* search */}
              <div className="flex items-center gap-2 px-3 py-2 border-b">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700"
                  placeholder="Search members by name, username or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* list */}
              <div className="max-h-56 overflow-auto">
                {loadingMembers ? (
                  <div className="p-4 text-sm text-slate-500">
                    Loading members...
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">
                    No matching members found.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {filteredMembers.map((m) => {
                      const selected = isSelected(m.id);
                      return (
                        <li
                          key={m.id}
                          className="flex items-center justify-between gap-3 px-3 py-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-4 sm:size-7 md:size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-medium">
                              {(
                                m.first_name?.[0] ||
                                m.username?.[0] ||
                                "U"
                              ).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm text-slate-800 truncate">
                                {m.first_name} {m.last_name}
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                @{m.username} • {m.email}
                              </div>
                            </div>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => toggleUserLocal(m.id)}
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm border ${
                                selected
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-slate-700"
                              }`}
                              disabled={processing}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{selected ? "Selected" : "Add"}</span>
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  // reset local selection to original state
                  const ids: number[] = [];
                  if (
                    task?.assigned_users &&
                    Array.isArray(task.assigned_users)
                  ) {
                    (task.assigned_users as Assignees[]).forEach((a) => {
                      if (
                        (a as any).assignee &&
                        typeof (a as any).assignee.id === "number"
                      ) {
                        ids.push((a as any).assignee.id);
                      }
                    });
                  }
                  setLocalAssigneeIds(ids);
                  setSearch("");
                }}
                className="px-3 py-2 rounded-md border text-sm bg-white text-slate-700"
                disabled={processing}
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={processing}
              >
                {processing
                  ? "Processing..."
                  : `Save (${localAssigneeIds.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPopup;
