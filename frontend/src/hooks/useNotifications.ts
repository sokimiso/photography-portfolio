import { useState, useEffect } from "react";

export type Notification = {
  id: string;
  userId: string;
  orderId?: string;
  type: "ORDER_STATUS" | "REMINDER" | "GENERAL";
  message: string;
  sentAt?: Date;
  status: "PENDING" | "SENT" | "FAILED";
};

export const useNotifications = (token?: string, userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!token || !userId) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/pending/${userId}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data: Notification[] = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [token, userId]);

  return { notifications, loading, fetchNotifications };
};
