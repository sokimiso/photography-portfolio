"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTexts } from "@context/TextContext";
import { useAuth } from "@context/AuthContext";
import { createMenuItems } from "@content/menu";
import { usePathname } from "next/navigation";
import DesktopDropdown from "./DesktopDropdown";
import MobileDropdown from "./MobileDropdown";
import { logoVariants } from "@animations/navbar";
import { LogIn } from "lucide-react";

export default function Navbar() {
  const texts = useTexts();
  const { loggedIn } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (loggedIn && pathname.startsWith("/dashboard")) return null;

  const menuItems = createMenuItems(texts);

  const toggleMobileSubmenu = (index: number) =>
    setOpenIndex(openIndex === index ? null : index);
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenIndex(null);
  };

  const menuItemClasses =
    "navbar-a px-4 py-0 text-sm font-normal uppercase text-gray-900 dark:text-gray-100 transition-colors flex items-center h-full relative";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white dark:bg-gray-900 shadow-md top-0 z-50 relative"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-stretch justify-between">
          {/* LEFT: Logo + first menu items */}
          <div className="flex items-stretch space-x-4">
            <Link href="/" className="flex items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={logoVariants}
                transition={{ duration: 0.2 }}
              >
                <div className="relative h-16 w-40 md:h-16 md:w-40">
                  <Image
                    src="/logoInvert.png"
                    alt="Sokirka Photography"
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            </Link>

            <div className="hidden md:flex items-stretch space-x-8 px-4 py-0 uppercase text-sm">
              {menuItems.slice(0, -1).map((item, index) => (
                <DesktopDropdown
                  key={index}
                  item={item}
                  isOpen={openIndex === index}
                  onHoverStart={() => setOpenIndex(index)}
                  onHoverEnd={() => setOpenIndex(null)}
                  menuItemClasses={menuItemClasses}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: login icon with tooltip */}
          <div className="hidden md:flex items-center ml-4">
            <div className="relative group">
              <Link
                href="/login"
                className="navbar-a flex items-center h-full p-2 text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <LogIn size={20} />
              </Link>

              {/* Tooltip */}
              <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 -ml-3 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap">
                {texts.menu.customerZone}
              </span>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-700 dark:text-gray-200 focus:outline-none"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden bg-white dark:bg-gray-900 shadow-lg overflow-hidden"
          >
            {menuItems.map((item, index) => (
              <MobileDropdown
                key={index}
                item={item}
                index={index}
                openIndex={openIndex}
                toggleOpen={toggleMobileSubmenu}
                closeMenu={closeMobileMenu}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
