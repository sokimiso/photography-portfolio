"use client";

import { useState } from "react";
import Breadcrumb from "./components/Breadcrumb";
import PendingOrdersPanel from "./components/PendingOrdersPanel";
import GlobalSearchPanel from "./components/GlobalSearchPanel";
import NotificationsPanel from "./components/NotificationsPanel";
import DashboardContent from "./components/DashboardContent";

import { useGlobalSearch, UserResult, OrderResult } from "@hooks/useGlobalSearch";
import { usePendingOrders } from "@/hooks/usePendingOrders";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@context/AuthContext";

export default function DashboardPageComponent() {
  const { token, user, role } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const path = ["Dashboard", "Dashboard"];
  const { results, loading: loadingSearch, message, globalSearch } = useGlobalSearch(
    process.env.NEXT_PUBLIC_API_URL!,
    token
  );

  const { pendingOrders, loading: loadingPending } = usePendingOrders(token, role);
  const { notifications, loading: loadingNotifications } = useNotifications(token ?? undefined, user?.id);
  // Handle search selection
  const handleSelectUser = (user: UserResult) => {
    setSelectedUser(user);
    setSelectedOrder(null);
    setActiveTab("Užívatelia");
  };

  const handleSelectOrder = (order: OrderResult) => {
    setSelectedOrder(order);
    setSelectedUser(null);
    setActiveTab("Objednávky");
  };

  return (
    <div className="space-y-6">
      <div><Breadcrumb path={path} /></div>

      {/* Dashboard panels */}
      {activeTab === "Dashboard" && (
        <>
          <PendingOrdersPanel
            pendingOrders={pendingOrders}
            loading={loadingPending}
            onSelectOrder={handleSelectOrder}
          />
          <NotificationsPanel
            notifications={notifications}
            loading={loadingNotifications}
          />
        </>
      )}

      {/* Tab content */}
      <DashboardContent
        activeTab={activeTab}
        selectedUser={selectedUser}
        selectedOrder={selectedOrder}
      />
    </div>
  );
}
