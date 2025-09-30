"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem, SubMenuItem } from "@content/menu";

interface MobileDropdownProps {
  item: MenuItem;
  index: number;
  openIndex: number | null;
  toggleOpen: (index: number) => void;
  closeMenu: () => void;
}

export default function MobileDropdown({
  item,
  index,
  openIndex,
  toggleOpen,
  closeMenu,
}: MobileDropdownProps) {
  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
      closeMenu();
    }
  };

  // Container animation (height + opacity)
  const containerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
  };

  // Each item slides + fades
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  if (item.subItems) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleOpen(index)}
          className="w-full text-left px-3 py-2 font-normal text-gray-900 dark:text-gray-100 flex justify-between items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          {item.label}
          <motion.span
            animate={{ rotate: openIndex === index ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.span>
        </button>

        <AnimatePresence>
          {openIndex === index && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
              transition={{ duration: 0.25, ease: [0.42, 0, 0.58, 1] }}
              className="bg-gray-50 dark:bg-gray-800 overflow-hidden"
            >
              {item.subItems.map((subItem: SubMenuItem, subIndex: number) => (
                <motion.div
                  key={subIndex}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{
                    duration: 0.2,
                    ease: [0.42, 0, 0.58, 1],
                    delay: subIndex * 0.05, // stagger effect
                  }}
                  whileHover={{ scale: 1.03 }} // subtle scale-up on hover
                >
                  <Link
                    href={subItem.href}
                    className="block px-5 py-2 text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-normal uppercase"
                    onClick={closeMenu}
                  >
                    {subItem.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Single top-level item
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      {item.href ? (
        <Link
          href={item.href}
          className="block px-3 py-2 font-normal text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          onClick={closeMenu}
        >
          {item.label}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className="w-full text-left px-3 py-2 font-normal text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          {item.label}
        </button>
      )}
    </div>
  );
}
