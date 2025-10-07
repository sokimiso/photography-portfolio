"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTexts } from "@/context/TextContext";

const heroImages = [
  "/hero/photography-hero-1.jpg",
  "/hero/photography-hero-2.jpg",
  "/hero/photography-hero-3.jpg",
  "/hero/photography-hero-4.jpg",
];

export default function HeroSection() {
  const [bgImage, setBgImage] = useState<string>("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * heroImages.length);
    setBgImage(heroImages[randomIndex]);
  }, []);

  const texts = useTexts();  
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
            style={{ backgroundImage: `url(${bgImage})`, filter: "brightness(1.0) contrast(1.0)" }}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>

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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/rezervacia"
            className="inline-block mt-6 px-6 py-3 rounded-lg bg-primary  bg-white/60 dark:bg-gray-900/60 text-card-background font-medium shadow-lg hover:bg-primary-light transition-colors"
          >
            {texts.homepage?.cta}
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
