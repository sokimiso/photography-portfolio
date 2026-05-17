"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Photo {
  id: string;
  title?: string;
  url: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  tags: { id: string; name: string; friendlyName?: string }[];
}

export default function ServicesPageComponent() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  return (
    <section className="px-4 sm:px-6 lg:px-8 w-full bg-background-light dark:bg-background-dark">
      <h2 className="text-xl sm:text-2xl font-heading font-normal text-left text-foreground">
        Služby
      </h2>
    </section>
  );
}
