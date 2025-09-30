"use client";

import OrdersPage from "../orders/page";
import UsersPage from "../users/page";
import PhotosPage from "../photos/page";
import ManageWebPage from "../manageweb/page";
import AnalyticsPage from "../analytics/page";
import { UserResult, OrderResult } from "@hooks/useGlobalSearch";

type Props = {
  activeTab: string;
  selectedUser: UserResult | null;
  selectedOrder: OrderResult | null;
};

export default function DashboardContent({ activeTab, selectedUser, selectedOrder }: Props) {
  if (selectedOrder) return <OrdersPage selectedOrder={selectedOrder} />;

  if (selectedUser) {
    // Map UserResult (with orders as objects) → User (with orders as string IDs)
    const mappedUser = {
      ...selectedUser,
      orders: selectedUser.orders?.map((o) => o.id) ?? [],
    };
    return <UsersPage selectedUser={mappedUser} />;
  }

  switch (activeTab) {
    case "Objednávky":
    case "Moje objednávky":
      return <OrdersPage />;
    case "Užívatelia":
      return <UsersPage />;
    case "Fotky":
      return <PhotosPage />;
    case "Správa webu":
      return <ManageWebPage />;
    case "Analytics":
      return <AnalyticsPage />;
  }
}
