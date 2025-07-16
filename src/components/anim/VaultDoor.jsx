import { motion } from "motion/react";

export const VaultDoor = ({ delay, duration, state }) => {
  return (
    <>
      <motion.div
        className="absolute left-0 top-0 w-1/2 h-full bg-zinc-800 z-30"
        initial={
          state === "open" ? { marginLeft: "-0.1%" } : { marginLeft: "-50%" }
        }
        animate={
          state === "open"
            ? {
                marginLeft: "-50%",
              }
            : {
                marginLeft: "-0.1%",
              }
        }
        transition={{ duration, delay }}
      ></motion.div>
      <motion.div
        className="top-0 absolute right-0 w-1/2 h-full bg-zinc-800 z-30 "
        initial={
          state === "open" ? { marginRight: "-0.1%" } : { marginRight: "-50%" }
        }
        animate={
          state === "open"
            ? {
                marginRight: "-50%",
              }
            : {
                marginRight: "-0.1%",
              }
        }
        transition={{ duration, delay }}
      ></motion.div>
      <motion.div
        className="top-0 absolute right-0 w-full h-full bg-black z-30 "
        initial={state === "open" ? { opacity: 0.5 } : { opacity: 0 }}
        animate={state === "open" ? { opacity: 0 } : { opacity: 0.5 }}
        transition={{ duration: duration - 0.1, delay: delay + duration - 0.3 }}
      ></motion.div>
    </>
  );
};
