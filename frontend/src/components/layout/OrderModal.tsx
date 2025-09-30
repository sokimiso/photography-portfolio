"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function OrderModal({ isOpen, onClose, children }: OrderModalProps) {
  // Variants for the modal container (fade + scale)
  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.05, ease: [0.42, 0, 0.58, 1] }, // Bezier curve for ease
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      transition: { duration: 0.2, ease: [0.42, 0, 0.58, 1] },
    },
  };

  // Variants for content children (fade-in + slight slide)
  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    },
  };

  // Variants for container that handles staggering of children
  const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0  z-40 bg-amber-200/80"
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            {/* Content container with staggered children */}
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full p-6 relative space-y-4"
              variants={staggerContainer}  // handles staggerChildren
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-700 dark:text-gray-200 hover:text-red-500 rounded p-2"
                variants={contentVariants} // animate button separately
              >
                ✕
              </motion.button>

              {/* Wrap children in a motion.div to allow stagger fade-in */}
              <motion.div variants={contentVariants}>
                {children}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
