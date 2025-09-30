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

export default function Navbar() {
  const texts = useTexts();
  const { loggedIn } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Hide navbar only on dashboard when logged in
  if (loggedIn && pathname.startsWith("/dashboard")) return null;

  const menuItems = createMenuItems(texts);

  const toggleMobileSubmenu = (index: number) => setOpenIndex(openIndex === index ? null : index);
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenIndex(null);
  };

  const menuItemClasses =
    "px-3 py-2 font-normal uppercase text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 uppercase"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={logoVariants}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-12 w-32 md:h-16 md:w-40">
                <Image
                  src="/logo.png"
                  alt="Sokirka Photography"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 128px, (max-width: 1200px) 160px, 200px"
                />
              </div>
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item, index) => (
              <DesktopDropdown
                key={index}
                item={item}
                isOpen={openIndex === index}
                onHoverStart={() => item.subItems && setOpenIndex(index)}
                onHoverEnd={() => item.subItems && setOpenIndex(null)}
                menuItemClasses={menuItemClasses}
              />
            ))}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-700 dark:text-gray-200 focus:outline-none"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
