"use client";

import React from "react";
import { motion } from "framer-motion";
import { glassBoxStyle, statusColors } from "@/lib/constants/orders";

export type Notification = {
  id: string;
  message: string;
  type: "ORDER_STATUS" | "REMINDER" | "GENERAL";
  sentAt?: string | Date;
  status: "PENDING" | "SENT" | "FAILED";
};

type Props = {
  notifications: Notification[];
  loading: boolean;
};

export default function NotificationsPanel({ notifications, loading }: Props) {
  const getTitle = (type: Notification["type"]) => {
    switch (type) {
      case "ORDER_STATUS":
        return "Aktualizácia objednávky";
      case "REMINDER":
        return "Pripomienka";
      case "GENERAL":
        return "Všeobecná notifikácia";
      default:
        return "Notifikácia";
    }
  };

  return (
    <div className={`p-4 mb-4 rounded-xl ${glassBoxStyle}`}>
      <h2 className="text-lg font-bold mb-2 cursor-default">Notifikácie</h2>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div>Žiadne notifikácie</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              className={`p-2 border rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 flex justify-between items-center ${
                n.status === "PENDING" ? "bg-blue-100 dark:bg-blue-800 font-medium" : ""
              }`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <div className="font-semibold">{getTitle(n.type)}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">{n.message}</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {n.sentAt
                  ? `${new Date(n.sentAt).toLocaleDateString()} ${new Date(n.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : ""}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
