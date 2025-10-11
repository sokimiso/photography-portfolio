"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
}

export default function NotFound() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 10 + Math.random() * 20,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
    }));
    setParticles(initialParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrame: number;

    const animateParticles = () => {
      setParticles((prev) =>
        prev.map((p) => {
          const dx = p.x - mousePos.x;
          const dy = p.y - mousePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const repelRadius = 150;
          const repelStrength = 0.2;
          let offsetX = 0;
          let offsetY = 0;
          if (dist < repelRadius && dist > 0) {
            const factor = (repelRadius - dist) / repelRadius;
            offsetX = (dx / dist) * factor * repelStrength * 50;
            offsetY = (dy / dist) * factor * repelStrength * 50;
          }

          let newX = p.x + p.speedX + offsetX;
          let newY = p.y + p.speedY + offsetY;

          if (newX > window.innerWidth) newX = 0;
          if (newX < 0) newX = window.innerWidth;
          if (newY > window.innerHeight) newY = 0;
          if (newY < 0) newY = window.innerHeight;

          return { ...p, x: newX, y: newY };
        })
      );

      animationFrame = requestAnimationFrame(animateParticles);
    };

    animateParticles();
    return () => cancelAnimationFrame(animationFrame);
  }, [mousePos]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-900 dark:to-gray-800 overflow-hidden px-4 text-center">
      {/* Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white/40 dark:bg-gray-700 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            top: p.y,
            left: p.x,
          }}
        />
      ))}

      {/* Foreground 404 + robot */}
      <motion.div
        className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <h1 className="text-8xl font-extrabold text-gray-900 dark:text-gray-100">Uups!</h1>
        <motion.img
          src="/illustrations/404-robot.png"
          alt="404 Robot"
          className="w-48 md:w-64 h-auto"
          animate={{ y: [0, -15, 0] }} // floating up and down
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Message */}
      <motion.p
        className="mt-4 text-xl text-gray-700 dark:text-gray-300 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Stránka nenájdená. Možno sa iba pripravuje.
      </motion.p>

      {/* Go back home */}
      <motion.div
        className="mt-6 z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
      >
        <Link
          href="/"
          className="inline-block px-6 py-3 text-lg font-semibold text-white  rounded-lg shadow-lg "
        >
          Utiecť domov
        </Link>
      </motion.div>
    </div>
  );
}
