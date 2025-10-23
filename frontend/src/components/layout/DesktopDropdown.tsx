"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "@content/menu";

interface DesktopDropdownProps {
  item: MenuItem;
  isOpen: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  menuItemClasses: string;
}

export default function DesktopDropdown({
  item,
  isOpen,
  onHoverStart,
  onHoverEnd,
  menuItemClasses,
}: DesktopDropdownProps) {
  const handleClick = () => {
    if (item.onClick) item.onClick();
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="relative h-full"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div
        className="relative h-full"
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Navbar item text */}
        <div className="relative h-full flex items-center cursor-pointer group">
          {item.subItems ? (
            <span className="px-4 py-0 text-gray-900 dark:text-gray-100 relative group h-full flex items-center">
              {item.label}
              {/* Underline at bottom of navbar */}
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[var(--primary-light)] dark:bg-[var(--primary-light)] group-hover:w-full transition-all duration-300"></span>
            </span>
          ) : (
            <motion.span
              onClick={handleClick}
              className={menuItemClasses + " relative h-full flex items-center"}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.15 }}
            >
              {item.href ? (
                <Link href={item.href} className={menuItemClasses}>
                  <span className="relative px-4 py-0 h-full group flex items-center">
                    {item.label}
                    {/* Underline at bottom of navbar */}
                    <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[var(--primary-light)] dark:bg-[var(--primary-light)] group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              ) : (
                <span className="relative px-4 py-0 h-full group flex items-center">
                  {item.label}
                  {/* Underline at bottom of navbar */}
                  <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[var(--primary-light)] dark:bg-[var(--primary-light)] group-hover:w-full transition-all duration-300"></span>
                </span>
              )}
            </motion.span>
          )}
        </div>

        {/* Full-width hover panel */}
        <AnimatePresence>
          {item.subItems && isOpen && (
            <motion.div
              key="full-width-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed top-[64px] left-0 w-screen border-t bg-white dark:bg-gray-900 shadow-lg z-40"
            >
              <div className="max-w-[1280px] mx-auto px-8 py-6 grid grid-cols-3 gap-8">
                {item.subItems.map((subItem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col items-start"
                  >
                    <Link
                      href={subItem.href}
                      className="text-gray-900 dark:text-gray-100 uppercase font-medium hover:text-[var(--primary-light)] transition-colors"
                    >
                      {subItem.label}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Additional text / description
                    </p>
                    <img
                      src="/placeholder.jpg"
                      alt={subItem.label}
                      className="mt-2 w-24 h-16 object-cover rounded"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
