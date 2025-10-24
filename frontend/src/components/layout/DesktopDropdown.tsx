"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "@content/menu";
import { useState, useEffect } from "react";
import {
  getActiveWeddingPackages,
  getActiveKidsPortraitPackages,
  getActiveSchoolPackages,
  PhotoshootPackage,
} from "@lib/api";
import { FeaturedThumbs } from "@/components/common/FeaturedThumbs";

interface DesktopDropdownProps {
  item: MenuItem;
  isOpen: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  menuItemClasses: string;
}

const fetchPackages = async (itemId: string) => {
  const packageMap: { [key: string]: () => Promise<PhotoshootPackage[]> } = {
    wedding: getActiveWeddingPackages,
    kids: getActiveKidsPortraitPackages,
    school: getActiveSchoolPackages,
  };
  const packageCategory = Object.keys(packageMap).find((key) =>
    itemId.includes(key)
  );
  if (packageCategory && packageMap[packageCategory]) {
    return await packageMap[packageCategory]();
  }
  return [];
};

export default function DesktopDropdown({
  item,
  isOpen,
  onHoverStart,
  onHoverEnd,
  menuItemClasses,
}: DesktopDropdownProps) {
  const [dynamicSubItems, setDynamicSubItems] = useState(item.subItems || []);

  useEffect(() => {
    const fetchDynamicContent = async () => {
      if (!item.subItems || item.subItems.length === 0) return;

      let updatedSubItems = [...item.subItems];
      const hasDynamicPackages = item.subItems.some(
        (sub) => sub.dynamicPackages
      );

      if (hasDynamicPackages) {
        try {
          const fetchedPackages = await fetchPackages(item.id || "");
          updatedSubItems = updatedSubItems.map((sub) => {
            if (sub.dynamicPackages) {
              const formattedPackages = fetchedPackages.map((pkg) => ({
                label: `${pkg.shortName} - od ${pkg.basePrice}€, približne ${pkg.maxPhotos} fotiek`,
              }));
              return { ...sub, packages: formattedPackages };
            }
            return sub;
          });
        } catch (err) {
          console.error("Failed to fetch packages", err);
        }
      }

      setDynamicSubItems(updatedSubItems);
    };

    if (isOpen) fetchDynamicContent();
  }, [isOpen, item.subItems, item.id]);

  const handleClick = () => {
    if (item.onClick) item.onClick();
  };

  return (
    <div
      className="relative h-full"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div
        className={`relative h-full flex items-center cursor-pointer group ${
          isOpen ? "active" : ""
        }`}
      >
        {item.subItems ? (
          <span className="navbar-item">{item.label}</span>
        ) : (
          <motion.span
            onClick={handleClick}
            className="navbar-item"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.15 }}
          >
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </motion.span>
        )}
      </div>

      {/* Dropdown panel */}
      <AnimatePresence>
        {item.subItems && item.subItems.length > 0 && isOpen && (
          <motion.div
            key="full-width-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="navbar fixed top-[64px] p-4 left-0 w-screen border-t border-[var(--primary-light)] dark:border-[var(--primary-light)] shadow-lg z-40"
          >
            <div className="max-w-7xl mx-auto py-6 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      {Icon && (
                        <Icon
                          size={20}
                          className="text-[var(--primary-light)]"
                        />
                      )}
                      <span>{subItem.label}</span>
                    </div>

                    {subItem.description && (
                      <p className="text-sm text-[var(--primary)] mt-1">
                        {subItem.description}
                      </p>
                    )}

                    {subItem.packages && (
                      <div className="mt-3 space-y-1 pl-6 border-l border-[var(--primary-light)]">
                        {subItem.packages.map((pkg: any, pkgIndex: number) => (
                          <div
                            key={pkgIndex}
                            className="text-sm text-[var(--primary)]"
                          >
                            {pkg.label}
                          </div>
                        ))}
                      </div>
                    )}

                    {subItem.featuredCategory && (
                      <FeaturedThumbs
                        category={subItem.featuredCategory}
                        limit={4}
                      />
                    )}

                    {subItem.button && (
                      <Link
                        href={subItem.button.href}
                        className="mt-6 inline-block bg-[var(--primary-light)] text-white px-3 py-1 rounded text-xs font-medium hover:bg-[var(--primary)] transition-all"
                      >
                        {subItem.button.label}
                      </Link>
                    )}

                    {subItem.image && (
                      <Image
                        src={subItem.image}
                        alt={subItem.label || "Image"}
                        width={96}
                        height={64}
                        className="mt-2 object-cover rounded"
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
  );
}
