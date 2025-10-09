"use client";

import { motion } from "framer-motion";
import { useTexts } from "@context/TextContext";

export default function ReservationSection() {
  const texts = useTexts();
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
          Reservation
        </h2>
        <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto">
          Placeholder
        </p>
      </motion.div>
    </section>
  );
}
