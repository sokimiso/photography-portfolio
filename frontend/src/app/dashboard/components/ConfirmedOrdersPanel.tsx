"use client";

import { OrderResult } from "@hooks/useGlobalSearch";
import { glassBoxStyle, statusColors } from "@/lib/constants/orders";
import { useRouter } from "next/navigation";
import { useTexts } from "@/context/TextContext";

type Props = {
  confirmedOrders: OrderResult[];
  loading: boolean;
};

export default function ConfirmedOrdersPanel({ confirmedOrders, loading }: Props) {
  const router = useRouter();
  const texts = useTexts();

  const handleViewOrders = () => {
    router.push("/dashboard/orders");
  };

  // helper to calculate days left
  const getDaysLeft = (shootDate?: string) => {
    if (!shootDate) return null;
    const diffMs = new Date(shootDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  // show only upcomming orders in next 7 days
  const upcoming = confirmedOrders.filter((order) => {
    if (!order.shootDate) return false;
    const daysLeft = getDaysLeft(order.shootDate);
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  });

  return (
    <div className={`p-4 mb-4 rounded-xl ${glassBoxStyle}`}>
      <h2 className="text-lg font-bold mb-4 cursor-default flex items-center justify-between">
        <span>
           {texts.events?.thisWeeksEvents}
        </span>

        {confirmedOrders.length > 0 && (
          <button
            className="px-3 py-1 main-ui-button rounded"
            onClick={handleViewOrders}
          >
            {texts.buttons.show}
          </button>
        )}
      </h2>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-300 dark:bg-gray-700 rounded" />
          ))}
        </div>
      ) : upcoming.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 px-3 font-medium">{texts.orders?.shootDate || "Date"}</th>
                <th className="py-2 px-3 font-medium">{texts.orders?.shootPlace || "Date"}</th>
                <th className="py-2 px-3 font-medium">{texts.orders?.client || "Client"}</th>
                <th className="py-2 px-3 font-medium">{texts.orders?.package || "Package"}</th>
                <th className="py-2 px-3 font-medium">{texts.orders?.orderNumber || "Order #"}</th>
                <th className="py-2 px-3 font-medium text-right">{texts.orders?.finalPrice || "Balance (€)"}</th>
              </tr>
            </thead>

            <tbody>
              {upcoming.map((order) => {
                const daysLeft = getDaysLeft(order.shootDate);
                const highlightCancelled = daysLeft !== null && daysLeft <= 1;

                return (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                      highlightCancelled ? statusColors.CANCELLED : ""
                     
                    }`}
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  >
                    <td className="py-2 px-3">
                      {order.shootDate ? (
                        <>
                          {new Date(order.shootDate).toLocaleDateString("sk-SK", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" "}(
                          {daysLeft} dní)
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2 px-3 font-semibold">{order.shootPlace}</td>
                    <td className="py-2 px-3">
                      {order.user.firstName} {order.user.lastName} {order.user.email}
                    </td>
                    <td className="py-2 px-3">{order.package.displayName}</td>
                    <td className="py-2 px-3 font-semibold">{order.readableOrderNumber}</td>
                    <td className="py-2 px-3 text-right">
                      {(order.finalPrice - (order.amountPaid ?? 0)).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400">{texts.dashboard?.ordersPage?.noOrdersMessage}</div>
      )}
    </div>
  );
}
