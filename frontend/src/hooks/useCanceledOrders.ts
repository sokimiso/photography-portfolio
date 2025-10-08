"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { UserResult, PackageResult } from "./useGlobalSearch";

export type OrderResult = {
  id: string;
  readableOrderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  basePrice: number;
  finalPrice: number;
  transportPrice: number;
  user: UserResult;
  package: PackageResult;
  shootDate?: string;
  shootPlace?: string;
  notes?: string;
  discount?: number;
};

export const useCancelledOrders = (token: string | null, role: string | null) => {
  const [cancelledOrders, setCancelledOrders] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCancelledOrders = async () => {
    if (role !== "ADMIN") return;

    setLoading(true);

    try {
      const res = await axios.get<OrderResult[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/cancelled`,
        {
          withCredentials: true,
        }
      );
      setCancelledOrders(res.data || []);
    } catch (err: any) {
      console.error("Failed to fetch pending orders", err.response?.data || err.message);
      setCancelledOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelledOrders();

    const interval = setInterval(() => {
      fetchCancelledOrders();
    }, 30000); // refresh every 30s

    return () => clearInterval(interval);
  }, [token, role]);

  return { cancelledOrders, loading, refetch: fetchCancelledOrders };
};
