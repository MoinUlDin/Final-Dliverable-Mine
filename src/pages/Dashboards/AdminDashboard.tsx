// src/pages/dashboards/AdminDashboard.tsx
import { useEffect, useState } from "react";
import UserManagerment from "../../services/UserManagerment";
import {
  ThumbsDown,
  ThumbsUp,
  Users,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import ThreeDotLoader from "../../components/ThreeDotLoader";

interface PendingUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  employee_number: string;
}

export default function AdminDashboard() {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [rejected, setRejected] = useState<PendingUser[]>([]);

  const fetchPending = () => {
    UserManagerment.FetchpendingRequests()
      .then((r) => {
        setPending(r.requests);
        setRejected(r.rejected);
        console.log("we got Pending ", r);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleDecision = async (id: number, action: "approve" | "reject") => {
    const payload = {
      user_id: id,
      action: action,
    };
    console.log("payload we Sending: ", payload);
    setSending(true);
    UserManagerment.ApproveRequest(payload)
      .then(() => {
        const text = action === "approve" ? "Approved" : "Rejected";
        console.log("text: ", text);
        toast.success(`Request ${text} Successfully`);
        console.log("toast appears");
        fetchPending();
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setSending(false);
      });
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {sending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <ThreeDotLoader />
            <div className="text-slate-700 -translate-y-4">
              Processing request...
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-600">
          Manage user registrations and system overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Pending
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {pending?.length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Approved Today
              </p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Rejected Today
              </p>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Registrations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Pending Registrations
          </h2>
          <p className="text-slate-600 mt-1">
            Review and approve new user registrations
          </p>
        </div>

        <div className="p-6">
          {pending?.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                All Caught Up!
              </h3>
              <p className="text-slate-600">
                No pending registrations to review
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending &&
                pending?.map((u) => (
                  <div
                    key={u.id}
                    className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-slate-50"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              {u.first_name} {u.last_name}
                            </h3>
                            <p className="text-sm text-slate-600">
                              @{u.username}
                            </p>
                          </div>
                        </div>
                        <div className="ml-13 space-y-1">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Role:</span> {u.role}
                          </p>
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Email:</span>{" "}
                            {u.email}
                          </p>
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Employee #:</span>{" "}
                            {u.employee_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleDecision(u.id, "approve")}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(u.id, "reject")}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      {/* Rejected Registrations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Rejected Registrations
          </h2>
          <p className="text-slate-600 mt-1">
            Review and approve rejected users
          </p>
        </div>

        <div className="p-6">
          {rejected.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                All Caught Up!
              </h3>
              <p className="text-slate-600">No rejected user to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rejected.map((u) => (
                <div
                  key={u.id}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-slate-50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {u.first_name} {u.last_name}
                          </h3>
                          <p className="text-sm text-slate-600">
                            @{u.username}
                          </p>
                        </div>
                      </div>
                      <div className="ml-13 space-y-1">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Role:</span> {u.role}
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Email:</span> {u.email}
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Employee #:</span>{" "}
                          {u.employee_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleDecision(u.id, "approve")}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
