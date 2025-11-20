// Final Deliverable BC200414690
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy } from "react";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import SidebarLayout from "./layouts/SidebarLayout";
import { Toaster } from "react-hot-toast";

const LoginPage = lazy(() => import("./pages/auth/Login"));
const RegisterPage = lazy(() => import("./pages/auth/Register"));

// Admin related
const AdminDashboard = lazy(() => import("./pages/Dashboards/AdminDashboard"));
const UserManagementpage = lazy(
  () => import("./pages/UserManagement/UserManagementpage")
);

// Member Related
const MemberTaskPage = lazy(() => import("./pages/Tasks/MemberTaskPage"));

const ManagerDashboard = lazy(
  () => import("./pages/Dashboards/ManagerDashboard")
);
const MemberDashboard = lazy(
  () => import("./pages/Dashboards/MemberDashboard")
);

// Admin--Managers
const TaskManagerPage = lazy(() => import("./pages/Tasks/TaskManagerPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const WorkingOnPage = lazy(() => import("./pages/WorkingOnPage"));
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Main Content (right) */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Admin Related Routes */}
            <Route
              path="/Admin-Dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["Admin"]}>
                  <SidebarLayout>
                    <AdminDashboard />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <RoleProtectedRoute allowedRoles={["Admin"]}>
                  <SidebarLayout>
                    <UserManagementpage />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/Manager-Dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["Manager"]}>
                  <SidebarLayout>
                    <ManagerDashboard />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/Member-Dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["Member"]}>
                  <SidebarLayout>
                    <MemberDashboard />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <SidebarLayout>
                    <TaskManagerPage />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/my-tasks"
              element={
                <RoleProtectedRoute allowedRoles={["Member"]}>
                  <SidebarLayout>
                    <MemberTaskPage />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <SidebarLayout>
                  <ProfilePage />
                </SidebarLayout>
              }
            />
            <Route
              path="*"
              element={
                <SidebarLayout>
                  <WorkingOnPage />
                </SidebarLayout>
              }
            />
          </Routes>
        </main>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </Router>
  );
}

export default App;
