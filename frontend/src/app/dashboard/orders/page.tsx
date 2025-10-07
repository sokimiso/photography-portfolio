"use client";

import OrdersPageComponent from "./OrdersPageComponent";
import { OrderResult } from "@hooks/useGlobalSearch";

interface OrdersPageProps {
  selectedOrder?: OrderResult | null;
}

export default function OrdersPage({ selectedOrder }: OrdersPageProps) {
  return <OrdersPageComponent selectedOrder={selectedOrder} />;
}
