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

export const usePendingOrders = (token: string | null, role: string | null) => {
  const [pendingOrders, setPendingOrders] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPendingOrders = async () => {
    if (!token || !role || role !== "ADMIN") return;

    setLoading(true);

    try {
      const res = await axios.get<OrderResult[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingOrders(res.data || []);
    } catch (err: any) {
      console.error("Failed to fetch pending orders", err.response?.data || err.message);
      setPendingOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();

    const interval = setInterval(() => {
      fetchPendingOrders();
    }, 30000); // refresh every 30s

    return () => clearInterval(interval);
  }, [token, role]);

  return { pendingOrders, loading, refetch: fetchPendingOrders };
};
