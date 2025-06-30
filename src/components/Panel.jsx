import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Copiable } from "./Copiable";
import { LuExternalLink, LuEye, LuEyeOff } from "react-icons/lu";

const mock = [
  {
    title: "Login Info",
    type: "login",
    username: "user",
    password: "password",
    website: "https://example.com",
  },
  {
    title: "Another Login",
    type: "login",
    username: "anotherUser",
    password: "anotherPassword",
    website: "https://another-example.com",
  },
  {
    title: "Another Login yet",
    type: "login",
    username: "anotherUser",
    password: "anotherPassword",
    website: "",
  },
  {
    title: "Secure Note",
    type: "note",
    note: "this is another secure note and is really serius, this is another secure note and its really important,this is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really importantthis is another secure note and is really serius, this is another secure note and its really important",
  },
  {
    title: "Another Login yet",
    type: "login",
    username: "",
    password: "anotherPassword",
    website: "",
  },
  { title: "Secure Note 2", type: "note", note: "this is a secure note" },
];
export const Panel = ({
  setEditorState,
  setPanelState,
  editor,
  panelState,
}) => {
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
        <motion.ul className="flex flex-col gap-4 mt-2">
          {mock.map((item, index) => (
            <ItemView key={index} index={index} {...item} />
          ))}
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

const NoteView = (item) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <motion.li
      initial={{ width: "10%", opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      transition={{ delay: item.index * 0.1 }}
      className="middle-btn-3  rounded-[30px] bg-zinc-500/30 flex flex-col justify-center items-center"
    >
      <h1
        onClick={() => setTimeout(() => setOpen(!isOpen), 1)}
        className={`cursor-pointer h-[60px] px-4 w-full flex items-center border-b transition-all duration-200 font-bold text-sm ${
          isOpen ? "border-b-white/50" : "border-b-transparent"
        }`}
      >
        {item.title}
      </h1>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="w-full flex flex-col gap-2 mt-2 text-sm px-2 overflow-hidden font-bold text-white/70"
            initial={{ height: 0, opacity: 0 }}
            exit={{ height: 0, opacity: 0 }}
            animate={{ height: isOpen ? 200 : 0, opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {item.note && (
              <Copiable text={item.note} type="multi-line">
                <div className="flex">
                  <p className="w-full h-[192px] overflow-auto py-2">
                    {item.note}
                  </p>
                </div>
              </Copiable>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

const LoginView = (item) => {
  const [isOpen, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => setShowPassword(false), [isOpen]);

  const height =
    (Object.values(item).filter((val) => val.length > 0).length - 1) * 56;

  return (
    <motion.li
      initial={{ width: "10%", opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      transition={{ delay: item.index * 0.1 }}
      className="middle-btn-3  rounded-[30px] bg-zinc-500/30 flex flex-col justify-center items-center"
    >
      <h1
        onClick={() => setTimeout(() => setOpen(!isOpen), 1)}
        className={`cursor-pointer h-[60px] px-4 w-full flex items-center border-b transition-all duration-200 font-bold text-sm ${
          isOpen ? "border-b-white/50" : "border-b-transparent"
        }`}
      >
        {item.title}
      </h1>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="w-full flex flex-col gap-2 mt-2 text-sm px-2 overflow-hidden font-bold text-white/70"
            initial={{ height: 0, opacity: 0 }}
            exit={{ height: 0, opacity: 0 }}
            animate={{ height: isOpen ? height : 0, opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {item.username && (
              <Copiable text={item.username}>
                <div className="flex">
                  <p className="w-full">{item.username}</p>
                </div>
              </Copiable>
            )}
            {item.password && (
              <Copiable text={item.password}>
                <div className="flex items-center h-full">
                  <div className="w-full">
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
                <div className="flex items-center h-full">
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
    </motion.li>
  );
};
