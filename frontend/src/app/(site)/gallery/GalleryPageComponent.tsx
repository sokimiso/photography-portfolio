"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface Photo {
  id: string;
  title?: string;
  url: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  tags: { id: string; name: string; friendlyName?: string }[];
}

export default function GalleryPageComponent() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [categories, setCategories] = useState<
    { id: string; name: string; friendlyName?: string }[]
  >([]);
  const [tags, setTags] = useState<
    { id: string; name: string; friendlyName?: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState(0);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [ratios, setRatios] = useState<Record<string, number>>({});

  const handleImageLoad = (id: string, width: number, height: number) => {
    setRatios((prev) => ({ ...prev, [id]: width / height }));
  };

  // Load public categories
  useEffect(() => {
    const loadCategories = async () => {
      const res = await axios.get(`${BACKEND_URL}/api/photos/publicCategories`);
      setCategories(res.data);
      if (res.data.length > 0) setSelectedCategory(res.data[0].name);
    };
    loadCategories();
  }, []);

  // Load first batch of photos + tags
  useEffect(() => {
    if (!selectedCategory) return;

    const loadPhotosAndTags = async () => {
      try {
        const photosRes = await axios.get(
          `${BACKEND_URL}/api/photos/category/${selectedCategory}?limit=1`
        );
        setPhotos(photosRes.data.photos);
        setNextCursor(photosRes.data.nextCursor || null);

        const tagsRes = await axios.get(
          `${BACKEND_URL}/api/photos/publicCategory/${selectedCategory}/tags`
        );
        setTags(tagsRes.data);
        setSelectedTag("");
      } catch (err) {
        console.error(err);
      }
    };

    loadPhotosAndTags();
  }, [selectedCategory]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current || !nextCursor) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          try {
            const res = await axios.get(
              `${BACKEND_URL}/api/photos/category/${selectedCategory}?cursor=${nextCursor}&limit=8`
            );
            setPhotos((prev) => [...prev, ...res.data.photos]);
            setNextCursor(res.data.nextCursor || null);
          } catch (err) {
            console.error(err);
          } finally {
            setIsLoadingMore(false);
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [nextCursor, selectedCategory, isLoadingMore]);

  // Tag filter
  const filteredPhotos = useMemo(() => {
    if (!selectedTag) return photos;
    return photos.filter((p) => p.tags.some((t) => t.name === selectedTag));
  }, [photos, selectedTag]);

  const activePhoto =
    activeIndex !== null && filteredPhotos[activeIndex]
      ? filteredPhotos[activeIndex]
      : null;

  // Preload modal image
  useEffect(() => {
    if (!activePhoto) {
      setModalSrc(null);
      return;
    }
    const img = new window.Image();
    img.src = `${BACKEND_URL}${activePhoto.largeUrl}`;
    img.onload = () => setModalSrc(activePhoto.largeUrl);
  }, [activePhoto]);

  // Key navigation
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

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      if (info.velocity.x < -500) goNext();
      else if (info.velocity.x > 500) goPrev();
    },
    [filteredPhotos]
  );

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
      <h2 className="text-xl sm:text-2xl font-heading font-normal text-left text-foreground">
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
            {(cat.friendlyName || cat.name).toLowerCase()}
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
            {(tag.friendlyName || tag.name).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPhotos.map((photo, index) => {
          const aspectRatio = ratios[photo.id];
          const objectPosition =
            aspectRatio && aspectRatio < 1 ? "center 25%" : "center center";

          return (
            <motion.div
              key={photo.id}
              className="w-full max-w-full h-80 overflow-hidden rounded-lg cursor-pointer relative shadow-2xl"
              onClick={() => setActiveIndex(index)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.05,
                duration: 0.4,
                ease: "easeOut",
              }}
            >
              <Image
                src={
                  photo.mediumUrl
                    ? `${BACKEND_URL}${photo.thumbnailUrl}`
                    : "/placeholder.jpg"
                }
                alt={photo.title ?? "Gallery image"}
                fill
                className="object-cover"
                style={{ objectPosition }}
                onLoad={(e) =>
                  handleImageLoad(
                    photo.id,
                    e.currentTarget.naturalWidth,
                    e.currentTarget.naturalHeight
                  )
                }
                sizes="
                  (max-width: 640px) 100vw,
                  (max-width: 1024px) 50vw,
                  (max-width: 1280px) 33vw,
                  25vw
                "
                priority={index === 0}
                {...(index !== 0 && { loading: "lazy" })}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Infinite scroll trigger with fade */}
      {nextCursor && (
        <motion.div
          ref={loaderRef}
          className="text-center py-6 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoadingMore ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
          {isLoadingMore ? "Loading more..." : "Scroll to load more"}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence initial={false} custom={swipeDirection}>
        {activePhoto && modalSrc && (
          <motion.div
            key={activePhoto.id}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={handleDragEnd}
            >
              <button
                onClick={() => setActiveIndex(null)}
                className="absolute top-4 right-4 text-white text-3xl font-bold z-50"
              >
                &times;
              </button>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-4xl z-50"
              >
                &#10094;
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-4xl z-50"
              >
                &#10095;
              </button>

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
                  sizes="
                    (max-width: 768px) 100vw,
                    (max-width: 1280px) 80vw,
                    90vw
                  "
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
