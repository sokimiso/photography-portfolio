"use client";

import { useState, useEffect } from "react";
import { OrderResult } from "@/types/order.dto";
import axios from "axios";

export function useUserOrders(userId?: string, status?: string) {
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/orders/user/${userId}${status ? `?status=${status}` : ""}`;
        const response = await axios.get<OrderResult[]>(url, {
          withCredentials: true, // ensure cookies are sent
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, status]);
  return { orders, loading };
}
