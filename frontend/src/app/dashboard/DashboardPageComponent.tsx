"use client";

import { useState } from "react";
import Breadcrumb from "./components/Breadcrumb";
import PendingOrdersPanel from "./components/PendingOrdersPanel";
import NotificationsPanel from "./components/NotificationsPanel";
import ConfirmedOrdersPanel from "./components/ConfirmedOrdersPanel";
import DashboardContent from "./components/DashboardContent";
import { UserResult, OrderResult } from "@hooks/useGlobalSearch";
import { usePendingOrders } from "@/hooks/usePendingOrders";
import { useNotifications } from "@/hooks/useNotifications";
import { useConfirmedOrders } from "@/hooks/useConfirmedOrders";
import { useAuth } from "@context/AuthContext";

export default function DashboardPageComponent() {
  const { token, user, role } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderResult | null>(null);
  const path = ["Dashboard", activeTab];

  // Data fetching (AdminGuard ensures only ADMIN reaches here)
  const { pendingOrders, loading: loadingPending } = usePendingOrders(token, role);
  const { confirmedOrders, loading: loadingConfirmed } = useConfirmedOrders(token, role);
  const { notifications, loading: loadingNotifications } = useNotifications(token ?? undefined, user?.id);

  return (
    <div className="space-y-6">
      <Breadcrumb path={path} />

      {activeTab === "Dashboard" && (
        <>
          <PendingOrdersPanel pendingOrders={pendingOrders} loading={loadingPending} />
          <NotificationsPanel notifications={notifications} loading={loadingNotifications} />
          <ConfirmedOrdersPanel confirmedOrders={confirmedOrders} loading={loadingConfirmed} />
        </>
      )}

      <DashboardContent
        activeTab={activeTab}
        selectedUser={selectedUser}
        selectedOrder={selectedOrder}
        role={role}
      />
    </div>
  );
}
