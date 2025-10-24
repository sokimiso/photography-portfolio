"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getFeaturedPhotosByCategory } from "@/lib/api";

interface FeaturedThumbsProps {
  category: string; // e.g. "event-wedding"
  limit?: number; // default 4
  className?: string;
}

export const FeaturedThumbs = ({
  category,
  limit = 4,
  className = "",
}: FeaturedThumbsProps) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const featured = await getFeaturedPhotosByCategory(category, limit);
        setPhotos(featured);
      } catch (err) {
        console.error(`Error loading featured photos for ${category}:`, err);
      } finally {
        setLoading(false);
      }
    };
    loadPhotos();
  }, [category, limit]);

  if (loading) return null;
  if (!photos.length) return null;

  return (
    <div
      className={`mt-3 grid grid-cols-${
        limit > 4 ? 5 : 4
      } gap-2 px-4 ${className}`}
    >
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div style={{ position: "relative", width: "100%", height: "200px" }}>
            <Image
              src={`${
                process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"
              }${photo.thumbnailUrl}`}
              alt={photo.title || "Featured photo"}
              fill
              sizes="(max-width: 768px) 25vw, 10vw"
              style={{
                objectFit: "cover",
                objectPosition: "center",
                transition: "transform 0.3s ease",
              }}
              className="hover:scale-105"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
