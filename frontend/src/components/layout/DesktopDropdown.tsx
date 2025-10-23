"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "@content/menu";
import { useState, useEffect } from "react";
import { getActiveWeddingPackages, PhotoshootPackage } from "@lib/api";

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
  const [dynamicSubItems, setDynamicSubItems] = useState(item.subItems || []);

  // Fetch dynamic packages when dropdown opens
  useEffect(() => {
    const fetchDynamicPackages = async () => {
      if (!item.subItems) return;

      const hasDynamic = item.subItems.some(
        (sub) => (sub as any).dynamicPackages
      );
      if (!hasDynamic) return;

      try {
        const packages: PhotoshootPackage[] = await getActiveWeddingPackages();

        // Find the subItem that has dynamicPackages flag
        const newSubItems = item.subItems.map((sub) => {
          if ((sub as any).dynamicPackages) {
            // Keep the original icon + label but append formatted package info
            const formattedPackages = packages.map((pkg) => ({
              label: `${pkg.shortName} - ${pkg.basePrice}€  (približne ${pkg.maxPhotos} ks fotiek)`,
              href: pkg.link || "/service/weddings",
            }));

            return {
              ...sub,
              packages: formattedPackages, // custom key for rendering
            };
          }
          return sub;
        });

        setDynamicSubItems(newSubItems);
      } catch (err) {
        console.error("Failed to fetch wedding packages", err);
      }
    };

    if (isOpen) fetchDynamicPackages();
  }, [isOpen, item.subItems]);

  const handleClick = () => {
    if (item.onClick) item.onClick();
  };

  return (
    <div
      className="relative h-full"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div className="relative h-full">
        <div className="relative h-full flex items-center cursor-pointer group">
          {item.subItems ? (
            <span className="px-4 py-0 text-gray-900 dark:text-gray-100 relative group h-full flex items-center">
              {item.label}
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
                    <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[var(--primary-light)] dark:bg-[var(--primary-light)] group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              ) : (
                <span className="relative px-4 py-0 h-full group flex items-center">
                  {item.label}
                  <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[var(--primary-light)] dark:bg-[var(--primary-light)] group-hover:w-full transition-all duration-300"></span>
                </span>
              )}
            </motion.span>
          )}
        </div>

        {/* Full-width hover panel */}
        <AnimatePresence>
          {dynamicSubItems && isOpen && (
            <motion.div
              key="full-width-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed top-[64px] left-0 w-screen border-t bg-white dark:bg-gray-900 shadow-lg z-40"
            >
              <div className="max-w-[1280px] mx-auto px-8 py-6 grid grid-cols-3 gap-8">
                {dynamicSubItems.map((subItem, index) => {
                  const Icon = subItem.icon;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col items-start"
                    >
                      <div className="flex items-center space-x-2 text-[var(--primary)] font-semibold">
                        {subItem.icon && (
                          <subItem.icon
                            size={20}
                            className="text-[var(--primary-light)]"
                          />
                        )}
                        <span>{subItem.label}</span>
                      </div>

                      {subItem.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {subItem.description}
                        </p>
                      )}

                      {/* Render dynamic packages if available */}
                      {subItem.packages && (
                        <div className="mt-3 space-y-1 pl-6 border-l border-gray-200 dark:border-gray-700">
                          {subItem.packages.map(
                            (pkg: any, pkgIndex: number) => (
                              <div
                                key={pkgIndex}
                                className="text-sm text-gray-700 dark:text-gray-300"
                              >
                                {pkg.label}
                              </div>
                            )
                          )}
                        </div>
                      )}
                      {subItem.button && (
                        <Link
                          href={subItem.button.href}
                          className="mt-6 inline-block bg-[var(--primary-light)] text-white dark:text-gray-900 px-3 py-1 rounded-lg text-xs font-medium hover:bg-[var(--primary)] transition-all"
                        >
                          {subItem.button.label}
                        </Link>
                      )}
                      {subItem.image && (
                        <img
                          src={subItem.image}
                          alt={subItem.label}
                          className="mt-2 w-24 h-16 object-cover rounded"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
