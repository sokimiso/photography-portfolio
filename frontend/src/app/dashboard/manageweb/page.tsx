"use client";

import AdminGuard from "@/components/auth/AdminGuard";
import ManageWebComponent from "./ManageWebComponent";

export default function ManageWebPage() {
  return (
    <AdminGuard>
    <ManageWebComponent/>
    </AdminGuard>
  );
}
