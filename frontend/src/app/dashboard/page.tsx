"use client";

import DashboardPageComponent from "./DashboardPageComponent";
import AdminGuard from "@/components/auth/AdminGuard";

export default function DashboardPage() {
  // No need to check loggedIn or role here
  return (
    <AdminGuard>
      <DashboardPageComponent />
    </AdminGuard>
  );
}
