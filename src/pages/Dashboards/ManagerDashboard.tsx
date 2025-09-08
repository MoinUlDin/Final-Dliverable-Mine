// src/pages/dashboards/ManagerDashboard.tsx
import {
  Users,
  ClipboardList,
  FileText,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";

export default function ManagerDashboard() {
  const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Manager Dashboard
        </h1>
        <p className="text-slate-600">
          Welcome back, {userInfo?.first_name}! Here's your management overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Team Members</p>
              <p className="text-2xl font-bold text-slate-800">12</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Tasks</p>
              <p className="text-2xl font-bold text-orange-600">8</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ClipboardList className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Reports Due</p>
              <p className="text-2xl font-bold text-purple-600">3</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Performance</p>
              <p className="text-2xl font-bold text-green-600">94%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    New team member joined
                  </p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    Task completed by John
                  </p>
                  <p className="text-xs text-slate-500">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    Monthly report submitted
                  </p>
                  <p className="text-xs text-slate-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-slate-800">
                  Manage Team
                </p>
              </button>

              <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-200 transition-colors">
                  <ClipboardList className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-slate-800">View Tasks</p>
              </button>

              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-slate-800">
                  Generate Report
                </p>
              </button>

              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-green-200 transition-colors">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-slate-800">
                  Schedule Meeting
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Team Goals</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    Complete Q4 Objectives
                  </p>
                  <p className="text-sm text-slate-600">Due in 2 weeks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">75%</p>
                <div className="w-20 bg-slate-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    Team Training Completion
                  </p>
                  <p className="text-sm text-slate-600">Due in 1 month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">60%</p>
                <div className="w-20 bg-slate-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
