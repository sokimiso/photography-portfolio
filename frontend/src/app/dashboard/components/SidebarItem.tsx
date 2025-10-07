"use client";

import Link from "next/link";
import * as Tooltip from "@radix-ui/react-tooltip";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { statusColors } from "@/lib/constants/orders";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  collapsed: boolean;
  badgeCount?: number;
  badgeTheme?: "default" | "success" | "warning" | "error" | "info";
  badgeStatus?: keyof typeof statusColors;
  badgeMax?: number;
  animatedBadge?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  badgeCount = 0,
  badgeTheme = "default",
  badgeStatus,
  badgeMax,
  animatedBadge = true,
  onClick,
}: SidebarItemProps) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        active
          ? "bg-blue-600 text-white"
          : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
      )}
    >
      {/* ICON */}
        <Icon className="w-5 h-5 shrink-0" />

      {/* LABEL */}
      {!collapsed && (
        <span className="truncate flex-1 text-sm font-medium">{label}</span>
        
      )}
      
      {/* BADGE */}
      <Badge
        count={badgeCount}
        theme={badgeTheme}
        statusKey={badgeStatus}
        max={badgeMax}
        size="medium"
        animated={animatedBadge}
      >
      </Badge>
    </motion.div>
  );

  // When sidebar is expanded, just render normally
  if (!collapsed) {
    return (
      <Link href={href} onClick={onClick}>
        {content}
      </Link>
    );
  }

  // When collapsed, wrap in tooltip
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Link href={href} onClick={onClick}>
            {content}
          </Link>
        </Tooltip.Trigger>
        <Tooltip.Portal>
            <Tooltip.Content asChild side="right" sideOffset={8}>
            <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.15 }}
                className="bg-gray-800 text-white text-sm px-3 py-1 rounded-md shadow-lg z-[70]"
            >
                {label}
                <Tooltip.Arrow className="fill-gray-800" />
            </motion.div>
            </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
