// src/pages/dashboards/UserManagement.tsx
import { useEffect, useState } from "react";
import UserManagerment from "../../services/UserManagerment";
import {
  AlertTriangle,
  CheckCheck,
  CheckCircle,
  CheckSquare,
  Clock,
  Mail,
  ThumbsDown,
  ThumbsUp,
  UserMinus,
  UserRoundX,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import SpinnerLoader from "../../components/SpinnerLoader";

interface UserType {
  id: number;
  username: string;
  picture: string;
  email: string;
  first_name: string;
  employee_number: string;
  last_name: string;
  role: string;
  date_joined: string;
}
interface UserCountType {
  total: number;
  pending: number;
  active: number;
  rejected: number;
  manager: number;
  member: number;
}

export default function UserManagement() {
  const [pending, setPending] = useState<UserType[]>([]);
  const [active, setActive] = useState<UserType[]>([]);
  const [rejected, setRejected] = useState<UserType[]>([]);
  const [uCount, setuCount] = useState<UserCountType>();
  const [sending, setSending] = useState<boolean>(false);
  const [tabs, setTabs] = useState<number>(1);

  const fetchPending = () => {
    UserManagerment.FetchpendingRequests()
      .then((r) => {
        setPending(r.pending);
        setActive(r.active);
        setRejected(r.rejected);
        setuCount(r.count);
        console.log("we got Users data ", r);
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

  useEffect(() => {
    console.log("tabs: ", tabs);
  }, [tabs]);

  return (
    <div className="p-3 md:p-4">
      {sending && <SpinnerLoader />}

      <h1 className="text-xl sm:text-2xl font-bold">User Management</h1>
      <p className="text-gray-600 mb-4 text-xs sm:text-sm">
        Manage pending user registrations
      </p>
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4 gap-1 sm:gap-2 md:gap-3">
        {/* Total Users */}
        <div className="border rounded-xl p-4 bg-gradient-to-r from-blue-100 to to-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm md:text-lg">
              <h3>Total Users</h3>
              <h4 className="text-center text-xl font-bold text-blue-950">
                {uCount?.total}
              </h4>
            </span>

            <Users />
          </div>
          <div className="mt-2 flex flex-col md:flex-row gap-2 md:gap-4 text-xs sm:text-sm text-gray-400">
            <p>Managers: {uCount?.manager}</p>
            <p>Members: {uCount?.member}</p>
          </div>
        </div>
        {/* Pending Users */}
        <div className="border rounded-xl p-4 bg-gradient-to-r from-orange-100 to to-orange-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm md:text-lg">
              <h3>Pending Users</h3>
              <h4 className="text-center text-xl font-bold text-orange-950">
                {uCount?.pending}
              </h4>
            </span>
            <Clock className="text-orange-900" />
          </div>
        </div>
        {/* Rejected Users */}
        <div className="border rounded-xl p-4 bg-gradient-to-r from-red-100 to to-red-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm md:text-lg">
              <h3>Rejected Users</h3>
              <h4 className="text-center text-xl font-bold text-red-600">
                {uCount?.rejected}
              </h4>
            </span>
            <UserMinus />
          </div>
        </div>
        {/* Active Users */}
        <div className="border rounded-xl p-4 bg-gradient-to-r from-green-100 to to-green-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm md:text-lg">
              <h3>Active Users</h3>
              <h4 className="text-center text-xl font-bold text-emerald-900">
                {uCount?.active}
              </h4>
            </span>
            <CheckCheck />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-end gap-2 mb-2 w-full border-2 p-1 bg-white rounded-full">
        <button
          onClick={() => {
            setTabs(1);
          }}
          className={`${
            tabs === 1 ? "bg-blue-300 " : "border-gray-500"
          } px-2 py-1 sm:py-2 flex items-center justify-center gap-2 flex-1 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap`}
        >
          <Clock className="hidden sm:block" size={16} />
          Pending
        </button>
        <button
          onClick={() => {
            setTabs(2);
          }}
          className={`${
            tabs === 2 ? "bg-blue-300 " : "border-gray-500"
          } px-2 py-1 sm:py-2 flex items-center justify-center gap-2 flex-1 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap`}
        >
          <CheckCircle size={16} className="hidden sm:block" />
          Active
        </button>
        <button
          onClick={() => {
            setTabs(3);
          }}
          className={`${
            tabs === 3 ? "bg-blue-300 " : "border-gray-500"
          } px-2 py-1 sm:py-2 flex items-center justify-center gap-2 flex-1 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap`}
        >
          <UserRoundX size={16} className="hidden sm:block" />
          Rejected
        </button>
      </div>

      {/* Pending Registrations Requests */}
      {tabs === 1 && (
        <div>
          {pending && pending?.length === 0 ? (
            <div className="bg-white p-6 border rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <CheckSquare className="size-14 md:size-20" />
                <p className="bg-white px-6 py-4 rounded-md text-center">
                  All done, No Pending
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pending?.map((u) => (
                <UserCard
                  user={u}
                  approveBtn
                  rejectBtn
                  handleDecision={handleDecision}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active User */}
      {tabs === 2 && (
        <div>
          {active && active?.length === 0 ? (
            <div className="bg-white p-6 border rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle className="size-14 md:size-20" />
                <p className="bg-white px-6 py-4 rounded-md text-center">
                  No Active User
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {active?.map((u) => (
                <UserCard user={u} rejectBtn handleDecision={handleDecision} />
              ))}
            </div>
          )}
        </div>
      )}
      {/* Rejected Users */}
      {tabs === 3 && (
        <div>
          {rejected && rejected?.length === 0 ? (
            <div className="bg-white p-6 border rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle className="size-14 md:size-20" />
                <p className="bg-white px-6 py-4 rounded-md text-center">
                  No rejected User
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {rejected?.map((u) => (
                <UserCard user={u} approveBtn handleDecision={handleDecision} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface propsType {
  user: UserType | null;
  rejectBtn?: boolean;
  approveBtn?: boolean;
  handleDecision: (id: number, action: "approve" | "reject") => void;
}
export function UserCard({
  user = null,
  rejectBtn = false,
  approveBtn = false,
  handleDecision,
}: propsType) {
  if (!user) return <div></div>;
  const u = user;
  return (
    <div
      key={u.id}
      className="border rounded-lg p-4 flex flex-col sm:flex-row flex-1 justify-between items-start sm:items-center"
    >
      <div className="size-20 rounded-full self-start flex items-center gap-3 flex-1">
        <img
          className="size-10 sm:size-16 md:size-20 rounded-full"
          src={u.picture}
          alt=""
        />
        <div className="self-start sm:self-center">
          <p className="font-medium flex flex-col sm:flex-row sm:gap-3">
            <span className="whitespace-nowrap">
              {u.first_name} {u.last_name}
            </span>
            <span className="italic sm:ml-2 md:ml-4">@{u.username}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-500 flex gap-1 items-center">
            <Mail size={14} className="hidden sm:block" />
            {u.email}
          </p>
          <p className="text-sm text-gray-500">
            Employee #: {u.employee_number}
          </p>
        </div>
      </div>
      <div className="flex mt-3 sm:mt-0 gap-2 self-end sm:self-center">
        {approveBtn && (
          <button
            onClick={() => handleDecision(u.id, "approve")}
            className="px-1 sm:px-2 py-1 flex items-center min-w-[78px] text-[12px] gap-2 bg-green-500 text-white rounded-lg"
          >
            <ThumbsUp size={12} />
            Approve
          </button>
        )}

        {rejectBtn && (
          <button
            onClick={() => handleDecision(u.id, "reject")}
            className="px-1 sm:px-2 py-1 flex items-center min-w-[78px] text-[12px] gap-2 bg-red-500 text-white rounded-lg"
          >
            <ThumbsDown size={12} />
            Reject
          </button>
        )}
      </div>
    </div>
  );
}
