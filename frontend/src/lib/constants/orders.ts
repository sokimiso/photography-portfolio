import { OrderResult } from "@/types/order.dto";

export const glassBoxStyle = "w-full p-2 rounded-md backdrop-blur-md bg-transparent border border-white/20 shadow-xl";

export const statusColors: Record<OrderResult["status"], string> = {
  PENDING: "bg-yellow-300/80 dark:bg-yellow-300/70",
  CONFIRMED: "bg-green-300/80 dark:bg-green-300/70",
  COMPLETED: "bg-blue-300/80 dark:bg-blue-300/70",
  CANCELLED: "bg-red-500/80 dark:bg-red-500",
};
