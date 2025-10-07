"use client";

import { motion, MotionProps } from "framer-motion";
import React from "react";
import { statusColors } from "@/lib/constants/orders";

type BadgeSize = "small" | "medium" | "large";
type BadgeTheme = "default" | "success" | "warning" | "error" | "info";

type BadgeProps = {
  count: number;
  size?: BadgeSize;
  max?: number;
  animated?: boolean;
  animationProps?: MotionProps; // allow custom Framer Motion props
  theme?: BadgeTheme;
  color?: string; // overrides theme
  statusKey?: keyof typeof statusColors; // new prop for status colors
  className?: string;
  children?: React.ReactNode; // wrap around any element
};

export const Badge: React.FC<BadgeProps> = ({
  count,
  size = "medium",
  max,
  animated = false,
  animationProps,
  theme = "default",
  color,
  statusKey,
  className = "",
  children,
}) => {
  if (count <= 0) return <>{children}</>;

  const sizeClasses: Record<BadgeSize, string> = {
    small: "text-[10px] w-4 h-4",
    medium: "text-xs w-5 h-5",
    large: "text-sm w-8 h-8",
  };

  const themeColors: Record<BadgeTheme, string> = {
    default: "bg-gray-500",
    success: "bg-green-500",
    warning: "bg-yellow-500 text-black",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  const badgeColorClass =
  color ??
  (statusKey ? statusColors[statusKey] : themeColors[theme]);

  const badgeClasses = `
    inline-flex items-center justify-center
    font-bold text-white
    ${badgeColorClass}
    rounded-full
    ${sizeClasses[size]}
    ${className}
  `;

  const displayValue = max && count > max ? `${max}+` : count;

  const badgeElement = animated ? (
    <motion.span
      className={badgeClasses}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      {...animationProps} // allow custom animation
    >
      {displayValue}
    </motion.span>
  ) : (
    <span className={badgeClasses}>{displayValue}</span>
  );

  if (!children) return badgeElement;

  return (
    <div className="relative inline-block">
      {children}
      <div className="absolute -top-1 -right-1">{badgeElement}</div>
    </div>
  );
};
