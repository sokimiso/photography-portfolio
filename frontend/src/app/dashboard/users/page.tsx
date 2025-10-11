"use client";

import AdminGuard from "@/components/auth/AdminGuard";
import UsersPageComponent from "./UsersPageComponent";

export default function UsersPage() {
  return (
    <AdminGuard>
    <UsersPageComponent />
    </AdminGuard>
  );
}
