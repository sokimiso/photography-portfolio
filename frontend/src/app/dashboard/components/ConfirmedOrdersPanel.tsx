"use client";

import { OrderResult } from "@hooks/useGlobalSearch";
import { glassBoxStyle, statusColors } from "@/lib/constants/orders";
import { useRouter } from "next/navigation";
import { useTexts } from "@/context/TextContext";
import { CalendarDays, CalendarPlus } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";

type Props = {
  confirmedOrders: OrderResult[];
  loading: boolean;
};

export default function ConfirmedOrdersPanel({ confirmedOrders, loading }: Props) {
  const router = useRouter();
  const texts = useTexts();

  // Helper: Get start/end for this and next week (Mon → Sun)
  const getWeekRanges = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = (today.getDay() + 6) % 7; // Monday=0, Sunday=6

    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - dayOfWeek);
    thisMonday.setHours(0, 0, 0, 0);

    const thisSunday = new Date(thisMonday);
    thisSunday.setDate(thisMonday.getDate() + 6);
    thisSunday.setHours(23, 59, 59, 999);

    const nextMonday = new Date(thisMonday);
    nextMonday.setDate(thisMonday.getDate() + 7);
    nextMonday.setHours(0, 0, 0, 0);

    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);

    return { today, thisMonday, thisSunday, nextMonday, nextSunday };
  };

  const { today, thisMonday, thisSunday, nextMonday, nextSunday } = getWeekRanges();

  // Split confirmed orders by time range
  const overdueOrders = confirmedOrders.filter((order) => {
    if (!order.shootDate) return false;
    const date = new Date(order.shootDate);
    return date < today; // overdue
  });

  const thisWeekOrders = confirmedOrders.filter((order) => {
    if (!order.shootDate) return false;
    const date = new Date(order.shootDate);
    return date >= thisMonday && date <= thisSunday;
  });

  const nextWeekOrders = confirmedOrders.filter((order) => {
    if (!order.shootDate) return false;
    const date = new Date(order.shootDate);
    return date >= nextMonday && date <= nextSunday;
  });

  const getDaysLeft = (shootDate?: string) => {
    if (!shootDate) return null;
    const diffMs = new Date(shootDate).getTime() - new Date().getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Combine this week + next week into one unified list (today → next Sunday)
  const upcomingOrders = confirmedOrders.filter((order) => {
    if (!order.shootDate) return false;
    const date = new Date(order.shootDate);
    return date >= today && date <= nextSunday;
  });

  // Helper for week range label
  const formatRange = (start: Date, end: Date) =>
    `${start.toLocaleDateString("sk-SK", { day: "2-digit", month: "2-digit" })} – ${end.toLocaleDateString("sk-SK", { day: "2-digit", month: "2-digit" })}`;
  const columns = [
    {
      key: "shootDate",
      header: texts.dashboard?.ordersPage?.orders?.shootDate || "Date",
      render: (order: OrderResult) => {

        if (!order.shootDate) return false; // filter
        const date = new Date(order.shootDate); // safe

        const daysLeft = getDaysLeft(order.shootDate);
        return (
          <>
            {date.toLocaleDateString("sk-SK", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            ({daysLeft !== null ? (daysLeft >= 0 ? `${daysLeft} dní` : "overdue") : ""})
          </>
        );
      },
    },
    {
      key: "shootPlace",
      header: texts.dashboard?.ordersPage?.orders?.shootPlace || "Place",
      className: "font-semibold",
    },
    {
      key: "user",
      header: texts.dashboard?.ordersPage?.orders?.client || "Client",
      render: (order: OrderResult) =>
        `${order.user.firstName} ${order.user.lastName} ${order.user.email}`,
    },
    {
      key: "package",
      header: texts.dashboard?.ordersPage?.orders?.package || "Package",
      render: (order: OrderResult) => order.package.displayName,
    },
    {
      key: "readableOrderNumber",
      header: texts.dashboard?.ordersPage?.orders?.orderNumber || "Order #",
      className: "font-semibold",
    },
    {
      key: "finalPrice",
      header: texts.dashboard?.ordersPage?.orders?.finalPrice || "Balance (€)",
      align: "right" as const,
      render: (order: OrderResult) =>
        (order.finalPrice - (order.amountPaid ?? 0)).toFixed(2),
    },
  ];

  return (
    <>
      {/* Overdue Orders */}
      {overdueOrders.length > 0 && (
        <div className={`p-4 mb-4 rounded-xl ${glassBoxStyle}`}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
            <CalendarDays className="w-5 h-5" />
            {texts.dashboard?.eventsPage?.overdueEvents || "Overdue Events"}
          </h2>
          <DataTable
            data={overdueOrders}
            columns={columns}
            //onRowClick={(order) => router.push(`/dashboard/orders/${order.id}`)}
            loading={loading}
            highlightRow={(o) => {
              const daysLeft = getDaysLeft(o.shootDate);
              return daysLeft !== null && daysLeft < 0;
              }
            }
          />
        </div>
      )}

      {/* Upcoming Events (Today → Next Sunday) */}
      <div className={`p-4 mb-4 rounded-xl ${glassBoxStyle}`}>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-emerald-500" />
          {texts.dashboard?.eventsPage?.nextEvents || "Upcoming Events"} ({formatRange(today, nextSunday)})
        </h2>

        <DataTable
          data={upcomingOrders}
          columns={columns}
          //onRowClick={(order) => router.push(`/dashboard/orders/${order.id}`)}
          loading={loading}
          emptyMessage="No upcoming orders between now and next Sunday."
        />
      </div>

    </>
  );
}