import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Bell, User } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export default function SidebarLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  console.log("using Sidebar Layout");
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (left) */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      {/* Main Content (right) */}
      <div className="w-full">
        {/* header with notifications */}
        <div className="flex border-b border-slate-200 w-full h-16 justify-between items-center px-6 py-2 bg-white shadow-sm">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-slate-800">
              RBAC Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
