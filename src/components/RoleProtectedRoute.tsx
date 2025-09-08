import React from "react";
import { Navigate } from "react-router-dom";

type Role = "Admin" | "Manager" | "Member" | null;

function getUserRole(): Role {
  try {
    const raw = localStorage.getItem("user_info");
    if (!raw) return null;
    const user = JSON.parse(raw);
    console.log("User is : ", user);
    return (user?.role ?? null) as Role;
  } catch {
    return null;
  }
}

type Props = {
  allowedRoles?: Role[]; // if omitted => any authenticated role allowed
  children: React.ReactNode;
};

// Usage: <RoleProtectedRoute allowedRoles={['admin']}><AdminPage/></RoleProtectedRoute>
export default function RoleProtectedRoute({ allowedRoles, children }: Props) {
  const role = getUserRole();
  const tokens = !!localStorage.getItem("access_token");

  if (!tokens || !role) {
    // not authenticated — go to login
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // authenticated but not authorized
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
