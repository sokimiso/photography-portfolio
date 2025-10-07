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

  // Variants for the dropdown submenu
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="relative px-2 py-1"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div className="text-gray-900 dark:text-gray-100 relative cursor-pointer group">
        {item.subItems ? (
          <span className="block py-1">{item.label}</span>
        ) : (
          <motion.span
            onClick={handleClick}
            className={menuItemClasses}
            whileHover={{ scale: 1.03 }} // subtle scale-up on hover
            transition={{ duration: 0.15 }}
          >
            {item.href ? <Link href={item.href}className={menuItemClasses}>{item.label}</Link> : item.label}
          </motion.span>
        )}
      </div>

      {/* Dropdown for subitems */}
      {item.subItems && isOpen && (
        <AnimatePresence>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            transition={{ duration: 0.2, ease: [0.42, 0, 0.58, 1] }}
            className="font-normal uppercase absolute top-full left-0 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 min-w-max"
          >
            {item.subItems.map((subItem, index) => (
              <motion.div
                key={index}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{
                  duration: 0.15,
                  ease: [0.42, 0, 0.58, 1],
                  delay: index * 0.05, // stagger effect
                }}
                whileHover={{ scale: 1.03 }} // subtle scale-up on hover
              >
                <Link
                  href={subItem.href}
                  className="block px-4 py-2 text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  {subItem.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>  
  );
}
