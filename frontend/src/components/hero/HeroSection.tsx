"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTexts } from "@/context/TextContext";
import apiClient from "@/lib/apiClient";

export default function HeroSection() {
  const texts = useTexts();
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [images, setImages] = useState<string[]>([]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [isIntroDone, setIsIntroDone] = useState(false);

  // Load hero images
  useEffect(() => {
    const fetchHeroPhotos = async () => {
      try {
        const res = await apiClient.get("/photos/category/hero");
        const photos = res.data.photos || res.data;
        const visiblePhotos = photos.filter(
          (p: any) => p.isVisible && !p.deletedAt,
        );
        setImages(visiblePhotos.map((p: any) => p.url));
      } catch (err) {
        console.error("Failed to load hero images:", err);
        setImages(["/hero/photography-hero-1.jpg"]);
      }
    };

    fetchHeroPhotos();
  }, []);

  // Dramatic intro phase
  useEffect(() => {
    if (!images.length || isIntroDone) return;

    const interval = setInterval(() => {
      if (phaseIndex < images.length - 1) {
        setPhaseIndex((prev) => prev + 1);
        setCurrentImage(images[phaseIndex + 1]);
      } else {
        clearInterval(interval);
        setIsIntroDone(true);
      }
    }, 1500);

    setCurrentImage(images[phaseIndex]);

    return () => clearInterval(interval);
  }, [images, phaseIndex, isIntroDone]);

  // Peaceful loop after intro
  useEffect(() => {
    if (!isIntroDone || !images.length) return;

    let loopIndex = 0;
    const loopInterval = setInterval(() => {
      setCurrentImage(images[loopIndex]);
      loopIndex = (loopIndex + 1) % images.length;
    }, 4000);

    return () => clearInterval(loopInterval);
  }, [isIntroDone, images]);

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${BACKEND_URL}${currentImage})` }}
          />
        )}
      </AnimatePresence>

      {/* Overlay to dim slightly */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />

      {/* === Text content === */}
      <AnimatePresence>
        {isIntroDone && (
          <>
            {/* Title slides up to center */}
            <motion.div
              key="hero-title"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{
                duration: 1.5,
                ease: [0.17, 0.67, 0.83, 0.67], // cinematic easing
              }}
              className="absolute inset-0 flex items-center justify-center z-10 px-4"
            >
              <div className="inline-block text-center">
                <h1 className="text-3xl sm:text-3xl md:text-5xl lg:text-7xl xl:text-8xl font-heading font-bold text-foreground drop-shadow-lg">
                  {texts.homepage?.heroTitle}
                </h1>
              </div>
            </motion.div>

            {/* Subtitle fades in bottom-right 1s after title arrives */}
            <motion.div
              key="hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 1.5, ease: "easeInOut" }}
              className="absolute bottom-18 right-8 z-10 px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-lg text-center"
            >
              <p className="text-lg sm:text-xl text-foreground/90">
                {texts.homepage?.heroSubtitle}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
