"use client";

import { motion } from "framer-motion";

const images = [
  "/portfolio/wedding/photography-wedding-1-thumb.jpg",
  "/portfolio/wedding/photography-wedding-3-thumb.jpg",
  "/portfolio/wedding/photography-wedding-2-thumb.jpg",
  "/portfolio/portrait-kids/photography-portrait-kids-2-thumb.jpg",
  "/portfolio/portrait-kids/photography-portrait-kids-4-thumb.jpg",
  "/portfolio/homephotoshoot/photography-homephotoshoot-1-thumb.jpg",
  "/portfolio/homephotoshoot/photography-homephotoshoot-3-thumb.jpg",
];

export default function GalleryPreview() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 w-full bg-background-light dark:bg-background-dark">
      <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-8 text-center text-foreground">
        Galéria
      </h2>

      {/* Gallery grid */}
      <div className="flex flex-wrap justify-center gap-2 w-full h-[600px] overflow-hidden">
        {images.map((src, index) => (
          <div
            key={index}
            className="
              flex-grow 
              basis-[calc(25%-0.5rem)]   /* 4 per row on large screens */
              md:basis-[calc(33.333%-0.5rem)] /* 3 per row on medium screens */
              sm:basis-[calc(50%-0.5rem)] /* 2 per row on small screens */
              h-1/2  /* makes two equal rows within 300px */
              overflow-hidden 
              rounded-lg
            "
          >
            <motion.img
              src={src}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
