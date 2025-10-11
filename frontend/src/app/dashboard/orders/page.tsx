"use client";

import AdminGuard from "@/components/auth/AdminGuard";
import OrdersPageComponent from "./OrdersPageComponent";

export default function OrdersPage() {
  return (
    <AdminGuard>
    <OrdersPageComponent/>
    </AdminGuard>
  );
}
