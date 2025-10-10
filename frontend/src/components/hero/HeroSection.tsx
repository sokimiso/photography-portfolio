"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTexts } from "@/context/TextContext";
import apiClient from "@/lib/apiClient";

export default function HeroSection() {
  const [bgImage, setBgImage] = useState<string>("");
  const texts = useTexts();

  useEffect(() => {
    const fetchHeroPhotos = async () => {
      try {
        const res = await apiClient.get("/api/photos/category/hero");
        const photos = res.data;

        if (photos.length > 0) {
          const visiblePhotos = photos.filter((p: any) => p.isVisible && !p.deletedAt);
          const pool = visiblePhotos.length > 0 ? visiblePhotos : photos;
          const randomIndex = Math.floor(Math.random() * pool.length);
          setBgImage(pool[randomIndex].url);
        } else {
          // fallback images
          const fallback = [
            "/hero/photography-hero-1.jpg",
            "/hero/photography-hero-2.jpg",
            "/hero/photography-hero-3.jpg",
            "/hero/photography-hero-4.jpg",
          ];
          const randomIndex = Math.floor(Math.random() * fallback.length);
          setBgImage(fallback[randomIndex]);
        }
      } catch (err) {
        console.error("Failed to load hero images:", err);
        // fallback if backend fails
        const fallback = [
          "/hero/photography-hero-1.jpg",
          "/hero/photography-hero-2.jpg",
          "/hero/photography-hero-3.jpg",
          "/hero/photography-hero-4.jpg",
        ];
        const randomIndex = Math.floor(Math.random() * fallback.length);
        setBgImage(fallback[randomIndex]);
      }
    };

    fetchHeroPhotos();
  }, []);

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-background-light dark:bg-background-dark">
      <AnimatePresence>
        {bgImage && (
          <motion.div
            key={bgImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${bgImage})`,
              filter: "brightness(1.0) contrast(1.0)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>

      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative text-center px-4 sm:px-6 lg:px-8 z-10 max-w-3xl"
      >
        <div className="inline-block px-6 py-4 rounded-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground">
            {texts.homepage?.heroTitle}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-foreground/90">
            {texts.homepage?.heroSubtitle}
          </p>
          <motion.a
            onClick={(e) => {
              e.preventDefault();
              const reservationSection = document.getElementById("reservation-section");
              reservationSection?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-block mt-6 px-6 py-3 rounded-lg bg-primary bg-white/60 dark:bg-gray-900/60 text-card-background font-medium shadow-lg hover:bg-primary-light transition-colors cursor-pointer"
          >
            {texts.homepage?.cta}
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
