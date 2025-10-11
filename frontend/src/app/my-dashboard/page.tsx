"use client";

import MyDashboardComponent from "./MyDashboardPageComponent";
import CustomerGuard from "@/components/auth/CustomerGuard";

export default function MyDashboardPage() {
  return (
    <CustomerGuard>
      <MyDashboardComponent />
    </CustomerGuard>
  );
}
