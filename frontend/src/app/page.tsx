"use client";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.h1
      className="text-3xl font-bold text-red-500"
      animate={{ scale: 1.2 }}
      transition={{ duration: 0.5 }}
    >
      Tailwind + Framer Motion works!
    </motion.h1>
  );
}
