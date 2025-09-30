"use client";

import { motion } from "framer-motion";

const images = [
  "/gallery/img1.jpg",
  "/gallery/img2.jpg",
  "/gallery/img3.jpg",
  "/gallery/img4.jpg",
  "/gallery/img5.jpg",
  "/gallery/img6.jpg",
  "/gallery/img7.jpg",
];

export default function GalleryPreview() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-background-light dark:bg-background-dark">
      <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-8 text-center text-foreground">
        Galéria
      </h2>
      <div className="flex flex-wrap gap-2 h-[400px] overflow-hidden">
        {images.map((src, index) => (
          <motion.div
            key={index}
            className="flex-1 min-w-[120px] max-w-[200px] h-full overflow-hidden rounded-md"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={src}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
