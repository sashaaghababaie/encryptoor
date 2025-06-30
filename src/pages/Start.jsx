import { motion } from "motion/react";

export default function Start() {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <motion.button
        className="text-black/70 border-b border-emerald-500 font-bold text-xl bg-emerald-200 w-96 p-4 rounded-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        start
      </motion.button>
    </div>
  );
}
