"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface Photo {
  id: string;
  title?: string;
  url: string; // full size
  thumbnailUrl: string;
  mediumUrl: string; // for grid
  largeUrl: string;
  tags: { id: string; name: string }[];
}

export default function GalleryPageComponent() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState(0); // 1 = next, -1 = prev

  // Load categories & tags
  useEffect(() => {
    const loadCategories = async () => {
      const res = await axios.get(`${BACKEND_URL}/api/photos/categories`);
      setCategories(res.data);
      if (res.data.length > 0) setSelectedCategory(res.data[0].name);
    };
    const loadTags = async () => {
      const res = await axios.get(`${BACKEND_URL}/api/photos/tags`);
      setTags(res.data);
    };
    loadCategories();
    loadTags();
  }, []);

  // Load photos on category change
  useEffect(() => {
    if (!selectedCategory) return;
    const loadPhotos = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/photos/category/${selectedCategory}`
        );
        setPhotos(res.data);
        setSelectedTag(""); // reset tag filter
      } catch (err) {
        console.error("Failed to load photos:", err);
      }
    };
    loadPhotos();
  }, [selectedCategory]);

  // Filter photos by tag
  const filteredPhotos = useMemo(() => {
    if (!selectedTag) return photos;
    return photos.filter((photo) =>
      photo.tags.some((t) => t.name === selectedTag)
    );
  }, [photos, selectedTag]);

  // Active photo
  const activePhoto = useMemo(
    () =>
      activeIndex !== null && filteredPhotos[activeIndex]
        ? filteredPhotos[activeIndex]
        : null,
    [activeIndex, filteredPhotos]
  );

  // Load next image into modalSrc after fully loaded
  useEffect(() => {
    if (!activePhoto) {
      setModalSrc(null);
      return;
    }

    const img = new window.Image();
    img.src = `${BACKEND_URL}${activePhoto.url}`;
    img.onload = () => setModalSrc(activePhoto.url);
  }, [activePhoto]);

  // ESC + arrow navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
      if (!activePhoto) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activePhoto, filteredPhotos]);

  const goNext = () => {
    if (!filteredPhotos.length) return;
    setSwipeDirection(1);
    setActiveIndex((prev) =>
      prev === null ? 0 : (prev + 1) % filteredPhotos.length
    );
  };

  const goPrev = () => {
    if (!filteredPhotos.length) return;
    setSwipeDirection(-1);
    setActiveIndex((prev) =>
      prev === null
        ? filteredPhotos.length - 1
        : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
    );
  };

  // Preload next/prev images
  useEffect(() => {
    if (activeIndex === null) return;

    const preloadImage = (src: string) => {
      const img = new window.Image();
      img.src = src;
    };

    const prevIndex =
      activeIndex === 0 ? filteredPhotos.length - 1 : activeIndex - 1;
    const nextIndex =
      activeIndex === filteredPhotos.length - 1 ? 0 : activeIndex + 1;

    if (filteredPhotos[prevIndex])
      preloadImage(`${BACKEND_URL}${filteredPhotos[prevIndex].url}`);
    if (filteredPhotos[nextIndex])
      preloadImage(`${BACKEND_URL}${filteredPhotos[nextIndex].url}`);
  }, [activeIndex, filteredPhotos]);

  // Swipe navigation
  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      if (!filteredPhotos.length) return;
      if (info.velocity.x < -500) goNext();
      else if (info.velocity.x > 500) goPrev();
    },
    [filteredPhotos]
  );

  // Framer Motion variants for swipe
  const swipeVariants = {
    enter: (direction: number) => ({
      x: direction === 1 ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction === 1 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 w-full bg-background-light dark:bg-background-dark">
      <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-8 text-center text-foreground">
        Galéria
      </h2>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded ${
              selectedCategory === cat.name
                ? "bg-blue-600 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() =>
              setSelectedTag(selectedTag === tag.name ? "" : tag.name)
            }
            className={`px-4 py-2 rounded ${
              selectedTag === tag.name
                ? "bg-green-600 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="w-full max-w-full h-80 overflow-hidden rounded-lg cursor-pointer relative"
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={
                photo.mediumUrl
                  ? `${BACKEND_URL}${photo.mediumUrl}`
                  : "/placeholder.jpg"
              }
              alt={photo.title ?? "Gallery image"}
              fill
              className="object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence initial={false} custom={swipeDirection}>
        {activePhoto && modalSrc && (
          <motion.div
            key={activePhoto.id}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
          >
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={handleDragEnd}
            >
              {/* Close */}
              <button
                onClick={() => setActiveIndex(null)}
                className="absolute top-4 right-4 text-white text-3xl font-bold z-50"
              >
                &times;
              </button>

              {/* Left arrow */}
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-4xl z-50"
              >
                &#10094;
              </button>

              {/* Right arrow */}
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-4xl z-50"
              >
                &#10095;
              </button>

              {/* Fullscreen Image with swipe */}
              <motion.div
                key={modalSrc}
                custom={swipeDirection}
                variants={swipeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <Image
                  src={`${BACKEND_URL}${modalSrc}`}
                  alt={activePhoto.title ?? "Gallery image"}
                  fill
                  className="object-contain select-none"
                  priority
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
