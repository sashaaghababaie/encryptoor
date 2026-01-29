import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import {
  LuExternalLink,
  LuEye,
  LuEyeOff,
  LuTrash,
  LuPenLine,
  LuFilePlus,
  LuCircleUserRound,
} from "react-icons/lu";
import { Copiable } from "./ui/Copiable";
import { useAppContext } from "../context/Context";

/**
 *
 */
export const ItemView = (item) => {
  if (item.type === "login") return <LoginView key={item.id} {...item} />;
  if (item.type === "note") return <NoteView key={item.id} {...item} />;
  return null;
};

/**
 *
 */
const NoteView = ({
  removingId,
  setRemovingId,
  isRemoving,
  onRemoveComplete,
  setEditorState,
  setPanelState,
  ...item
}) => {
  const [isOpen, setOpen] = useState(false);
  const [startDelete, setStartDelete] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [hoverTrash, setHoverTrash] = useState(false);
  const [hoverEdit, setHoverEdit] = useState(false);

  const { session, setSession } = useAppContext();

  useEffect(() => {
    if (holdProgress === 100) setRemovingId(item.id);
  }, [holdProgress, item.id]);

  useEffect(() => {
    if (!hoverTrash) setStartDelete(false);
  }, [hoverTrash]);

  useEffect(() => {
    let interval;

    if (startDelete === false) {
      setHoldProgress(0);
      clearInterval(interval);
      return;
    }

    interval = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev < 100) {
          if (prev < 75) {
            return prev + 1;
          } else if (prev < 99.7) {
            const d = 100 - prev;
            return prev + d * 0.07;
          } else {
            return 100;
          }
        }
      });
    }, 15);

    return () => clearInterval(interval);
  }, [startDelete]);

  return (
    <motion.li
      key={item.id}
      initial={!isRemoving && { width: "0%", opacity: 0, marginTop: 10 }}
      variants={{
        start: {
          width: "100%",
          opacity: 1,
          marginTop: 10,
          transition: { delay: item.index * 0.1 },
          height: "auto",
        },
        delete: {
          x: "100%",
          opacity: 0,
          height: 0,
          marginTop: 0,
        },
      }}
      animate={isRemoving ? "delete" : "start"}
      onAnimationComplete={(def) => {
        if (isRemoving && def === "delete") {
          onRemoveComplete?.();
          setStartDelete(false);
        }
      }}
      className={`middle-btn-3 rounded-[30px] flex flex-col justify-center items-center relative overflow-hidden ${
        startDelete && "shadow-lg shadow-rose-500/20"
      }`}
    >
      <div
        style={{ width: `${holdProgress}%` }}
        className={`absolute h-full top-0 left-0 bg-rose-500/20 rounded-[30px] ${
          startDelete === false && "transition-all duration-500"
        }`}
      ></div>
      <motion.div
        className="w-full overflow-hidden font-bold text-white/70"
        initial={{ height: 60 }}
        animate={{
          height: isOpen ? 268 : 60,
        }}
        transition={{
          type: "spring",
          visualDuration: 0.25,
          bounce: 0.25,
        }}
      >
        <div className="flex shrink-0 w-full min-w-[340px] group">
          <h1
            onClick={() => setOpen(!isOpen)}
            className="gap-2 select-none cursor-pointer h-[60px] pr-4 pl-1 w-full flex items-center font-bold text-sm"
          >
            <span className="bg-emerald-500/30 shrink-0 h-[52px] w-[52px] rounded-full flex items-center justify-center">
              <LuFilePlus className="w-6 h-6" />
            </span>
            {item.title}
          </h1>

          <div className="hidden group-hover:flex absolute top-1 right-1 gap-1 items-center">
            <motion.button
              onHoverStart={() => setHoverTrash(true)}
              onHoverEnd={() => setHoverTrash(false)}
              whileHover={{ width: 126 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => {
                setStartDelete(false);
                setHoldProgress(0);
              }}
              onPointerDown={() => setStartDelete(true)}
              onPointerUp={() => setStartDelete(false)}
              className="w-[52px] h-[52px]
                        rounded-full bg-white/10 hover:bg-rose-500/50 text-white/30
                        text-lg flex items-center justify-center hover:text-white/70 overflow-hidden"
            >
              {hoverTrash ? (
                <span className="select-none block text-xs font-bold w-[126px] shrink-0">
                  Hold to delete
                </span>
              ) : (
                <LuTrash />
              )}
            </motion.button>
            <motion.button
              onHoverStart={() => setHoverEdit(true)}
              onHoverEnd={() => setHoverEdit(false)}
              whileHover={{ width: 126 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => {
                setPanelState("inactive");
                setEditorState({
                  initData: item,
                  type: item.type,
                  show: true,
                  animate: "show",
                });
              }}
              className="w-[52px] h-[52px]
            rounded-full bg-white/10 hover:bg-blue-500/50 text-white/30
            text-lg flex items-center justify-center hover:text-white/70 overflow-hidden"
            >
              {hoverEdit ? (
                <span className="select-none block text-xs font-bold w-[126px] shrink-0">
                  Edit
                </span>
              ) : (
                <LuPenLine />
              )}
            </motion.button>
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="w-full flex flex-col mt-2 gap-2 text-sm px-2 overflow-hidden font-bold text-white/70"
              initial={{ opacity: 0 }}
              exit={{ height: 0, opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {item.note && (
                <Copiable text={item.note} type="multi-line">
                  <div className="flex">
                    <p className="w-full h-[192px] overflow-auto py-4">
                      {item.note}
                    </p>
                  </div>
                </Copiable>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.li>
  );
};

/**
 *
 */
const LoginView = ({
  removingId,
  setRemovingId,
  isRemoving,
  onRemoveComplete,
  setEditorState,
  setPanelState,
  ...item
}) => {
  const [isOpen, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [startDelete, setStartDelete] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [hoverTrash, setHoverTrash] = useState(false);
  const [hoverEdit, setHoverEdit] = useState(false);

  useEffect(() => setShowPassword(false), [isOpen]);

  useEffect(() => {
    if (holdProgress === 100) setRemovingId(item.id);
  }, [holdProgress, item.id]);

  useEffect(() => {
    if (!hoverTrash) setStartDelete(false);
  }, [hoverTrash]);

  useEffect(() => {
    let interval;

    if (startDelete === false) {
      setHoldProgress(0);
      clearInterval(interval);
      return;
    }

    interval = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev < 100) {
          if (prev < 75) {
            return prev + 1;
          } else if (prev < 99.7) {
            const d = 100 - prev;
            return prev + d * 0.07;
          } else {
            return 100;
          }
        }
      });
    }, 15);

    return () => clearInterval(interval);
  }, [startDelete]);

  const height =
    (Object.values(item).filter((val) => val.length > 0).length - 3) * 56 + 8;

  console.log(height);
  return (
    <motion.li
      className={`middle-btn-3 rounded-[30px] flex flex-col justify-center items-center relative overflow-hidden ${
        startDelete && "shadow-lg shadow-rose-500/20"
      }`}
      key={item.id}
      initial={!isRemoving && { width: "0%", opacity: 0, marginTop: 10 }}
      variants={{
        start: {
          width: "100%",
          opacity: 1,
          marginTop: 10,
          height: "auto",
          transition: { delay: item.index * 0.1 },
        },
        delete: {
          x: "100%",
          opacity: 0,
          height: 0,
          marginTop: 0,
        },
      }}
      animate={isRemoving ? "delete" : "start"}
      onAnimationComplete={(def) => {
        if (isRemoving && def === "delete") {
          onRemoveComplete?.();
          setStartDelete(false);
        }
      }}
    >
      <div
        style={{ width: `${holdProgress}%` }}
        className={`absolute h-full top-0 left-0 bg-rose-500/20 rounded-[30px] ${
          startDelete === false && "transition-all duration-500"
        }`}
      ></div>
      <motion.div
        className="w-full overflow-hidden font-bold text-white/70"
        initial={{ height: 60 }}
        animate={{
          height: isOpen ? height + 60 : 60,
        }}
        transition={{
          type: "spring",
          visualDuration: 0.25,
          bounce: 0.35,
        }}
      >
        <div className="flex shrink-0 w-full min-w-[340px] group">
          <h1
            onClick={() => setOpen(!isOpen)}
            className="gap-2 select-none cursor-pointer h-[60px] pr-4 pl-1 w-full flex items-center  font-bold text-sm"
          >
            <span className="bg-blue-500/30 shrink-0 h-[52px] w-[52px] rounded-full flex items-center justify-center">
              <LuCircleUserRound className="w-6 h-6" />
            </span>
            {item.title}
          </h1>

          <div className="hidden group-hover:flex absolute top-1 right-1 gap-1 items-center">
            <motion.button
              onHoverStart={() => setHoverTrash(true)}
              onHoverEnd={() => setHoverTrash(false)}
              whileHover={{ width: 126 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setStartDelete(false)}
              onPointerDown={() => setStartDelete(true)}
              onPointerUp={() => setStartDelete(false)}
              className="w-[52px] h-[52px]
                        rounded-full bg-white/10 hover:bg-rose-500/50 text-white/30
                        text-lg flex items-center justify-center hover:text-white/70 overflow-hidden"
            >
              {hoverTrash ? (
                <span className="select-none block text-xs font-bold w-[126px] shrink-0">
                  Hold to delete
                </span>
              ) : (
                <LuTrash />
              )}
            </motion.button>
            <motion.button
              onHoverStart={() => setHoverEdit(true)}
              onHoverEnd={() => setHoverEdit(false)}
              whileHover={{ width: 126 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => {
                setPanelState("inactive");
                setEditorState({
                  initData: item,
                  type: item.type,
                  show: true,
                  animate: "show",
                });
              }}
              className="w-[52px] h-[52px]
                        rounded-full bg-white/10 hover:bg-blue-500/50 text-white/30
                        text-lg flex items-center justify-center hover:text-white/70 overflow-hidden"
            >
              {hoverEdit ? (
                <span className="select-none block text-xs font-bold w-[126px] shrink-0">
                  Edit
                </span>
              ) : (
                <LuPenLine />
              )}
            </motion.button>
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="w-full flex flex-col mt-2 gap-2 text-sm px-2 overflow-hidden font-bold text-white/70"
              initial={{ opacity: 0 }}
              exit={{ height: 0, opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {item.username && (
                <Copiable text={item.username}>
                  <div className="flex gap-2">
                    <label className="text-white/40">Username:</label>
                    <p className="w-full">{item.username}</p>
                  </div>
                </Copiable>
              )}
              {item.password && (
                <Copiable text={item.password}>
                  <div className="flex items-center h-full">
                    <div className="w-full flex gap-1">
                      <label className="text-white/40">Password:</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="bg-transparent"
                        disabled
                        value={item.password}
                      />
                    </div>
                    <button
                      className="text-white/70 hover:text-white transition-all duration-200 text-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPassword(!showPassword);
                      }}
                    >
                      {showPassword ? <LuEyeOff /> : <LuEye />}
                    </button>
                  </div>
                </Copiable>
              )}
              {item.website && (
                <Copiable text={item.website}>
                  <div className="flex items-center h-full gap-2">
                    <label className="text-white/40">Website:</label>
                    <p className="w-full">{item.website}</p>
                    {/* <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LuExternalLink />
                    </a> */}
                  </div>
                </Copiable>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.li>
  );
};
