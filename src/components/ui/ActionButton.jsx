import { motion } from "motion/react";

/**
 *
 */
export default function ActionButton({ children, ...props }) {
  return (
    <motion.button
      className="text-white/70 w-full h-16 rounded-full flex items-center b"
      initial={{ scale: 0.6, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, opacity: 1 }}
      {...props}
    >
      <span className="w-full flex items-center justify-between transition h-full rounded-full middle-btn-3">
        {children}
      </span>
    </motion.button>
  );
}
