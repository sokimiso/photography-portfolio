"use client";

import AdminGuard from "@/components/auth/AdminGuard";
import NotificationsPageComponent from "./NotificationsPageComponent";

export default function NotificationsPage() {
  return (
    <AdminGuard>
    <NotificationsPageComponent/>
    </AdminGuard>
  );
}
