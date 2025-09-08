import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  ClipboardList,
  Settings,
  FileText,
  LogOut,
  Menu,
} from "lucide-react";

type Role = "Admin" | "Manager" | "Member" | null;

type SidebarLink = {
  to: string;
  label: string;
  Icon: React.ComponentType<any>;
  // If omitted => visible to any authenticated role.
  allowedRoles?: Role[]; // e.g. ['Admin', 'Manager']
  // if allowedRoles is [] or ['any'] treat as public (but sidebar usually only shows when logged in)
};

const LINKS: SidebarLink[] = [
  {
    to: "/Admin-Dashboard",
    label: "Dashboard",
    Icon: Home,
    allowedRoles: ["Admin"],
  },
  {
    to: "/Manager-Dashboard",
    label: "Dashboard",
    Icon: Home,
    allowedRoles: ["Manager"],
  },
  {
    to: "/Member-Dashboard",
    label: "Dashboard",
    Icon: Home,
    allowedRoles: ["Member"],
  },
  { to: "/users", label: "Manage Users", Icon: Users, allowedRoles: ["Admin"] },
  {
    to: "/tasks",
    label: "Tasks",
    Icon: ClipboardList,
    allowedRoles: ["Manager"],
  },
  {
    to: "/my-tasks",
    label: "My Tasks",
    Icon: ClipboardList,
    allowedRoles: ["Member"],
  },
  {
    to: "/reports",
    label: "Reports",
    Icon: FileText,
    allowedRoles: ["Admin", "Manager"],
  },
  {
    to: "/settings",
    label: "Settings",
    Icon: Settings,
    allowedRoles: ["Admin"],
  },
];

function getCurrentRole(): Role {
  try {
    const raw = localStorage.getItem("user_info");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return (user?.role ?? null) as Role;
  } catch {
    return null;
  }
}

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const role = getCurrentRole();
  const location = useLocation();
  const navigate = useNavigate();

  const visibleLinks = LINKS.filter((link) => {
    // if allowedRoles is not set -> visible to any authenticated user
    if (!link.allowedRoles) return true;
    // otherwise, show only if role is included
    return role !== null && link.allowedRoles.includes(role);
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");

    navigate("/");
  };

  // If no role / not logged in, you may want to return null (hide sidebar)
  if (!role) return null;

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } h-screen sticky top-0 border min-h-screen p-4 bg-slate-900 text-slate-200 transition-all duration-300`}
    >
      <div className="mb-6 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-bold text-white">RBAC App</h2>
            <p className="text-sm text-slate-400">
              Role: <span className="font-medium">{role}</span>
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-slate-200 hover:bg-slate-800 p-1 rounded"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex flex-col gap-2 text-slate-200">
        {visibleLinks.map((link) => {
          const active =
            location.pathname === link.to ||
            location.pathname.startsWith(link.to + "/");
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center ${
                collapsed ? "justify-center" : "gap-3"
              } px-3 py-2 rounded-md transition ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-200 hover:bg-slate-800"
              }`}
            >
              <link.Icon className={`${collapsed ? "w-6 h-6" : "w-5 h-5"}`} />
              {!collapsed && <span className="font-medium">{link.label}</span>}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className={`mt-4 flex items-center ${
            collapsed ? "justify-center" : "gap-3"
          } px-3 py-2 rounded-md text-left w-full hover:bg-slate-800 text-red-400`}
        >
          <LogOut className={`${collapsed ? "w-6 h-6" : "w-5 h-5"}`} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </nav>
    </aside>
  );
}
