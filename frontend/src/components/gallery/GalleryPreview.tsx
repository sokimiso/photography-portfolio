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
    <section className="py-20 px-4 sm:px-6 lg:px-8 w-full bg-background-light dark:bg-background-dark">
      <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-8 text-center text-foreground">
        Galéria
      </h2>

      <div className="flex flex-wrap justify-center gap-2 w-full h-[300px] overflow-hidden">
        {images.map((src, index) => (
          <motion.div
            key={index}
            className="
              flex-grow 
              basis-[calc(12.5%-0.5rem)]  /* 4 per row on desktop */
              sm:basis-[calc(12.5%-0.5rem)] /* 3 per row on tablets */
              xs:basis-[calc(50%-0.5rem)] /* 2 per row on small screens */
              min-w-[180px]
              h-full 
              overflow-hidden 
              rounded-lg
            "
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.25 }}
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
