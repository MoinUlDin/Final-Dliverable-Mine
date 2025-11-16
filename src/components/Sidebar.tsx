import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  ClipboardList,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
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
    allowedRoles: ["Admin", "Manager"],
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
export default function Sidebar(): React.ReactElement | null {
  const role = getCurrentRole();
  const location = useLocation();
  const navigate = useNavigate();

  // Desktop collapsed state (md+). Hamburger toggles this.
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Mobile overlay open (for full sidebar on small screens)
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Used to prevent body scroll when mobileOpen
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const visibleLinks = LINKS.filter((link) => {
    if (!link.allowedRoles) return true;
    return role !== null && link.allowedRoles.includes(role);
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
    navigate("/");
  };

  if (!role) return null;

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  /* ----------------------
     Desktop / Tablet Sidebar
     - Shown for md+ (Tailwind responsive)
     - Controlled by `collapsed` (w-16 vs w-64)
     ---------------------- */
  const DesktopSidebar = (
    <aside
      className={`hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:min-h-screen transition-all duration-200 bg-slate-800 text-white border-r ${
        collapsed ? "md:w-16" : "md:w-64"
      }`}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-700">
        {!collapsed ? (
          <div>
            <h2 className="text-lg font-bold">RBAC App</h2>
            <p className="text-xs text-slate-400">
              Role: <span className="font-medium">{role}</span>
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            {/* small brand in collapsed mode */}
            <span className="text-sm font-semibold">RB</span>
          </div>
        )}

        <button
          onClick={() => setCollapsed((p) => !p)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1 rounded hover:bg-slate-700"
          type="button"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-1 py-4 space-y-1">
        {visibleLinks.map((link) => {
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md mx-2 transition-colors ${
                active
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-white hover:bg-slate-700"
              }`}
              onClick={() => {
                // keep collapsed state as-is (do not auto-expand)
              }}
            >
              <div className="flex items-center justify-center w-6 h-6">
                <link.Icon className="w-5 h-5" />
              </div>

              {/* label hidden when collapsed */}
              {!collapsed && (
                <span className="text-sm font-medium">{link.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-slate-700"
          type="button"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );

  /* ----------------------
     Mobile slim icon bar (default on small screens)
     - fixed, shows only icons vertically centered
     - clicking menu opens full overlay
     ---------------------- */
  const MobileSlim = (
    <div className="md:hidden fixed left-2 top-0 h-full z-40 flex flex-col items-center gap-2 bg-slate-800">
      {/* menu toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="w-12 h-12 bg-slate-800 text-white rounded-lg flex items-center justify-center shadow"
        type="button"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* quick icons for top 5 visible links (icons only) */}
      <div className="mt-12 md:mt-2 flex flex-col gap-2 ">
        {visibleLinks.slice(0, 6).map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-white hover:bg-white/10 shadow"
            aria-label={link.label}
            onClick={() => {
              // keep mobile overlay closed (user will be on new route)
            }}
          >
            <link.Icon className="w-5 h-5" />
          </Link>
        ))}
      </div>

      {/* logout icon */}
      <button
        onClick={handleLogout}
        aria-label="Logout"
        className="w-12 h-12 fixed bottom-16 bg-white/5 rounded-lg flex items-center justify-center text-red-400 hover:bg-white/10 mt-2"
        type="button"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );

  /* ----------------------
     Mobile overlay full sidebar (appears when mobileOpen=true)
     - fixed left panel overlaying content
     - close via X or backdrop
     ---------------------- */
  const MobileOverlay = mobileOpen ? (
    <div
      className="md:hidden fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
    >
      {/* backdrop */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        tabIndex={-1}
        type="button"
      />

      {/* panel */}
      <div className="relative w-64 max-w-full h-full bg-slate-800 text-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold">RBAC App</h2>
            <p className="text-xs text-slate-400">
              Role: <span className="font-medium">{role}</span>
            </p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded hover:bg-slate-700"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-2 py-4 space-y-1">
          {visibleLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md mx-2 transition-colors ${
                  active
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-white hover:bg-slate-700"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  <link.Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-slate-700"
            type="button"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {DesktopSidebar}
      {MobileSlim}
      {MobileOverlay}
    </>
  );
}
