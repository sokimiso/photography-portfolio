"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Image,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@context/AuthContext";
import SidebarItem from "./SidebarItem";
import { usePendingOrders } from "@/hooks/usePendingOrders";
import { useConfirmedOrders } from "@/hooks/useConfirmedOrders";
import { useNotifications } from "@/hooks/useNotifications";

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout, token, role, user } = useAuth();

  const { pendingOrders } = usePendingOrders(token, role);
  const { confirmedOrders } = useConfirmedOrders(token, role);
  const { notifications } = useNotifications(token ?? undefined, user?.id);

  const navItems = [
    { href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badgeCount: role === "ADMIN" ? pendingOrders.length : 0,
      badgeStatus: "CANCELLED",
    },
    {
      href: "/dashboard/orders",
      label: "Objednávky",
      icon: ShoppingBag,
      badgeCount: role === "ADMIN" ? confirmedOrders.length : 0,
      badgeStatus: "CONFIRMED",
    },
    { href: "/dashboard/users", label: "Užívatelia", icon: Users },
    { href: "/dashboard/manageweb", label: "Správa webu", icon: Settings },
    { href: "/dashboard/photos", label: "Fotky", icon: Image },
    {
      href: "/dashboard/notifications",
      label: "Notifikácie",
      icon: Bell,
      badgeCount: role === "ADMIN" ? notifications.length : 0,
    },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  ] as const;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* MOBILE OVERLAY BACKDROP */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        className={`fixed lg:static z-40 h-screen flex flex-col bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
          {/* Only show title if not collapsed */}
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Admin Panel
            </h2>
          )}

          {/* Collapse button only visible on desktop */}
          <button
            className="hidden lg:flex p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              collapsed={collapsed}
              active={pathname === item.href}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-300 dark:border-gray-700">
          <SidebarItem
            href="#"
            label="Odhlásiť sa"
            icon={LogOut}
            collapsed={collapsed}
            onClick={handleLogout}
          />
        </div>
      </motion.aside>

      {/* MOBILE MENU BUTTON (ALWAYS ABOVE SIDEBAR) */}
      <button
        className="fixed top-4 left-4 z-[60] p-2 bg-blue-600 text-white rounded-md shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </>
  );
}
