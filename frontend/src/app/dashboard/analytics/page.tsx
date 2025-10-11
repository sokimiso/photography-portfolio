"use client";

import AdminGuard from "@/components/auth/AdminGuard";
import AnalyticsPageComponent from "./AnalyticsPageComponent";

export default function AnalyticsPage() {
  return (
    <AdminGuard>
    <AnalyticsPageComponent/>
    </AdminGuard>
  );
}
