import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Copiable } from "./Copiable";
import {
  LuExternalLink,
  LuEye,
  LuEyeOff,
  LuTrash,
  LuPenLine,
} from "react-icons/lu";

const mock = [
  {
    id: "0",
    title: "Login Info",
    type: "login",
    username: "user",
    password: "password",
    website: "https://example.com",
  },
  {
    id: "1",
    title: "Another isti pitst long Login credentials for safety and security",
    type: "login",
    username: "anotherUser",
    password: "anotherPassword",
    website: "https://another-example.com",
  },
  {
    id: "2",
    title: "Another Login yet",
    type: "login",
    username: "anotherUser",
    password: "anotherPassword",
    website: "",
  },
  {
    id: "3",
    title: "Secure Note",
    type: "note",
    note: "this is another secure note and is really serius, this is another secure note and its really important,this is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really important",
  },
  {
    id: "4",
    title: "Another Login yet",
    type: "login",
    username: "",
    password: "anotherPassword",
    website: "",
  },

  {
    id: "5",
    title: "Secure Note 2",
    type: "note",
    note: "this is a secure note",
  },
  {
    id: "6",
    title: "Another Login yet",
    type: "login",
    username: "",
    password: "anotherPassword",
    website: "",
  },
  {
    id: "7",
    title: "Another Login yet",
    type: "login",
    username: "",
    password: "anotherPassword",
    website: "",
  },
];

export const Panel = ({
  setEditorState,
  setPanelState,
  editor,
  panelState,
}) => {
  const [data, setData] = useState(mock);

  return (
    <motion.div
      className={`px-2 py-2 mt-2 absolute w-full left-0 top-16 z-20 backdrop-blur-md text-white border border-lime-100/10 bg-lime-500/10 rounded-3xl`}
      initial={{ y: 400, opacity: 0.5 }}
      animate={panelState}
      variants={{
        active: { y: 0, opacity: 1 },
        topover: { y: 30, opacity: 1 },
        inactive: { y: 400, opacity: 0.5 },
      }}
      onClick={() => {
        if (editor.show) {
          setEditorState({ ...editor, animate: "disable" });
          setPanelState("topover");
        }
      }}
    >
      {editor.show && editor.animate !== "disable" && (
        <div
          onClick={() => {
            if (editor.show) {
              setEditorState({ ...editor, animate: "disable" });
              setPanelState("topover");
            }
          }}
          className="h-full w-full absolute left-0 top-10 cursor-pointer"
        ></div>
      )}

      <div className="pb-2">
        <motion.input className="h-8 w-full rounded-full bg-zinc-500/10 text-white/70 px-2" />
      </div>
      <div
        style={{ height: "calc(100vh - 128px)" }}
        className={`overflow-auto ${
          editor.animate === "disable" ? "pb-12" : "pb-4"
        }`}
      >
        <motion.ul>
          <AnimatePresence>
            {data.map((item, index) => (
              <ItemView
                key={item.id}
                index={index}
                setData={setData}
                {...item}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </motion.div>
  );
};

const ItemView = ({ type, ...props }) => {
  if (type === "login") return <LoginView {...props} />;
  if (type === "note") return <NoteView {...props} />;
  return null;
};

/**
 *
 * @param {*} item
 * @returns
 */
// const NoteView = ({ setData, ...item }) => {
//   const [isOpen, setOpen] = useState(false);

//   return (
//     <motion.li
//       initial={{ width: "0%", opacity: 0 }}
//       animate={{ width: "100%", opacity: 1 }}
//       transition={{ delay: item.index * 0.1 }}
//       className="middle-btn-3  rounded-[30px] bg-zinc-500/30 flex flex-col justify-center items-center"
//     >
//       <h1
//         onClick={() => setTimeout(() => setOpen(!isOpen), 1)}
//         className={`cursor-pointer h-[60px] px-4 w-full flex items-center border-b transition-all duration-200 font-bold text-sm ${
//           isOpen ? "border-b-white/50" : "border-b-transparent"
//         }`}
//       >
//         {item.title}
//       </h1>
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             className="w-full flex flex-col gap-2 mt-2 text-sm px-2 overflow-hidden font-bold text-white/70"
//             initial={{ height: 0, opacity: 0 }}
//             exit={{ height: 0, opacity: 0 }}
//             animate={{ height: isOpen ? 200 : 0, opacity: isOpen ? 1 : 0 }}
//             transition={{ duration: 0.15, ease: "easeOut" }}
//           >
//             {item.note && (
//               <Copiable text={item.note} type="multi-line">
//                 <div className="flex">
//                   <p className="w-full h-[192px] overflow-auto py-4">
//                     {item.note}
//                   </p>
//                 </div>
//               </Copiable>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.li>
//   );
// };

const NoteView = ({ setData, ...item }) => {
  const [isOpen, setOpen] = useState(false);
  const [startDelete, setStartDelete] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showed, setShowed] = useState(false);
  const [hoverTrash, setHoverTrash] = useState(false);
  const [hoverEdit, setHoverEdit] = useState(false);

  const deleteItem = () => {
    setData((prev) => prev.filter((d) => d.id !== item.id));
  };

  useEffect(() => setShowed(true), []);
  useEffect(() => {
    let interval;

    if (startDelete === false) {
      setHoldProgress(0);
      interval && clearInterval(interval);
      return;
    }

    interval = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        } else {
          deleteItem();
          return 100;
        }
      });
    }, 15);

    return () => interval && clearInterval(interval);
  }, [startDelete]);

  return (
    <motion.li
      initial={{ width: "0%", opacity: 0, marginTop: 10 }}
      animate={{ width: "100%", opacity: 1, marginTop: 10 }}
      exit={{ x: "100%", opacity: 0, height: 0, marginTop: 0 }}
      transition={{ delay: showed ? 0 : item.index * 0.1 }}
      className={`${
        holdProgress !== 100 && "middle-btn-3"
      } rounded-[30px] flex flex-col justify-center items-center relative overflow-hidden ${
        startDelete && "shadow-lg shadow-rose-500/20"
      }`}
    >
      <div
        style={{ width: `${holdProgress}%` }}
        className={`absolute h-full top-0 left-0 bg-rose-500/20 rounded-[30px] ${
          startDelete === false && "transition-all duration-200"
        }`}
      ></div>
      <motion.div
        className="w-full overflow-hidden font-bold text-white/70"
        initial={{ height: 60 }}
        animate={{
          height: isOpen ? 268 : 60,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex shrink-0 w-full min-w-[340px] group">
          <h1
            onClick={() => setTimeout(() => setOpen(!isOpen), 10)}
            className={`select-none cursor-pointer h-[60px] px-4 w-full flex items-center border-b transition-all duration-200 font-bold text-sm ${
              isOpen ? "border-b-white/50" : "border-b-transparent"
            }`}
          >
            {item.title}
          </h1>

          <div className="hidden group-hover:flex absolute top-1 right-1 gap-1 items-center">
            <motion.button
              onHoverStart={() => setHoverTrash(true)}
              onHoverEnd={() => setHoverTrash(false)}
              whileHover={{ width: 126 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onPointerDown={() => setStartDelete(true)}
              onPointerUp={() => {
                setStartDelete(false);
                setHoldProgress(0);
              }}
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
              // onPointerDown={() => setStartDelete(true)}
              // onPointerUp={() => setStartDelete(false)}
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
 * @param {*} item
 * @returns
 */
const LoginView = ({ setData, ...item }) => {
  const [isOpen, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [startDelete, setStartDelete] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showed, setShowed] = useState(false);
  const [hoverTrash, setHoverTrash] = useState(false);
  const [hoverEdit, setHoverEdit] = useState(false);

  const deleteItem = () => {
    setData((prev) => prev.filter((d) => d.id !== item.id));
  };

  useEffect(() => setShowPassword(false), [isOpen]);
  useEffect(() => setShowed(true), []);
  useEffect(() => {
    let interval;

    if (startDelete === false) {
      setHoldProgress(0);
      interval && clearInterval(interval);
      return;
    }

    interval = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        } else {
          deleteItem();
          return 100;
        }
      });
    }, 15);

    return () => interval && clearInterval(interval);
  }, [startDelete]);

  const height =
    (Object.values(item).filter((val) => val.length > 0).length - 2) * 56 + 8;

  return (
    <motion.li
      initial={{ width: "0%", opacity: 0, marginTop: 10 }}
      animate={{ width: "100%", opacity: 1, marginTop: 10 }}
      exit={{ x: "100%", opacity: 0, height: 0, marginTop: 0 }}
      transition={{ delay: showed ? 0 : item.index * 0.1 }}
      className={`${
        holdProgress !== 100 && "middle-btn-3"
      } rounded-[30px] flex flex-col justify-center items-center relative overflow-hidden ${
        startDelete && "shadow-lg shadow-rose-500/20"
      }`}
    >
      <div
        style={{ width: `${holdProgress}%` }}
        className={`absolute h-full top-0 left-0 bg-rose-500/20 rounded-[30px] ${
          startDelete === false && "transition-all duration-200"
        }`}
      ></div>
      <motion.div
        className="w-full overflow-hidden font-bold text-white/70"
        initial={{ height: 60 }}
        animate={{
          height: isOpen ? height + 60 : 60,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex shrink-0 w-full min-w-[340px] group">
          <h1
            onClick={() => setTimeout(() => setOpen(!isOpen), 10)}
            className={`select-none cursor-pointer h-[60px] px-4 w-full flex items-center border-b transition-all duration-200 font-bold text-sm ${
              isOpen ? "border-b-white/50" : "border-b-transparent"
            }`}
          >
            {item.title}
          </h1>

          <div className="hidden group-hover:flex absolute top-1 right-1 gap-1 items-center">
            <motion.button
              onHoverStart={() => setHoverTrash(true)}
              onHoverEnd={() => setHoverTrash(false)}
              whileHover={{ width: 126 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
              // onPointerDown={() => setStartDelete(true)}
              // onPointerUp={() => setStartDelete(false)}
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
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LuExternalLink />
                    </a>
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
