"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { usePendingOrders } from "@/hooks/usePendingOrders";
import { useNotifications } from "@/hooks/useNotifications";

interface DashboardSidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function DashboardSidebar({ activeTab, setActiveTab }: DashboardSidebarProps) {
  const router = useRouter();
  const { logout, token, role, user } = useAuth();

  // Hooks for live counts
  const { pendingOrders } = usePendingOrders(token, role);
  const { notifications } = useNotifications(token ?? undefined, user?.id);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/orders", label: "Objednávky", badgeCount: role === "ADMIN" ? pendingOrders.length : 0 },
    { href: "/dashboard/users", label: "Užívatelia" },
    { href: "/dashboard/manageweb", label: "Správa webu" },
    { href: "/dashboard/photos", label: "Fotky" },
    { href: "/dashboard/notifications", label: "Notifikácie", badgeCount: role === "ADMIN" ? notifications.length : 0 },
    { href: "/dashboard/analytics", label: "Analytics" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setActiveTab?.(item.label)}
          className={`relative flex items-center justify-between p-2 rounded ${
            activeTab === item.label
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <span>{item.label}</span>
          {item.badgeCount !== undefined && item.badgeCount > 0 && (
            <Badge
              count={item.badgeCount}
              size="small"
              className="ml-2"
            />
          )}
        </Link>
      ))}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full text-left block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Odhlásiť sa
      </button>
    </aside>
  );
}
