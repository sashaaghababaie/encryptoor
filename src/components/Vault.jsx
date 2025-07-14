import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { LuFilePlus, LuCircleUserRound } from "react-icons/lu";
import { useState, useEffect, useContext } from "react";
import { Panel } from "./Panel";
import { LoginForm, NoteForm } from "./Froms";
import Layout from "./Layout";
import { PasswordInput } from "./Inputs";
import { useAppContext } from "./Context";
import { LuLock } from "react-icons/lu";
const Door = ({ delay, duration, state }) => {
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

const Lock = ({ setOpen, state }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });

  const { setData, setPassKey } = useAppContext();

  const handleOpenVault = async () => {
    try {
      if (password.length === 0) {
        setError("Please type password");
        throw new Error("NO_PASSWORD");
      }
      const res = await window.api.decryptVault(password);
      if (res.success) {
        setPassKey(password);
        setData(res.data);
        setTimeout(() => setOpen(true), 1);
      } else {
        setError("Wrong Password");
        throw new Error("WRONG_PASSWORD");
      }
    } catch (err) {
      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });
      setTimeout(() => {
        setButtonAnim({});
      }, 200);
    }
  };

  return (
    <div className="absolute p-4 inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="flex p-4 flex-col gap-4 w-full max-w-[600px] text-white border border-lime-100/10 bg-lime-700/10 rounded-3xl"
        initial={
          state === "close" ? { opacity: 0, y: 200 } : { opacity: 1, y: 0 }
        }
        animate={
          state === "open" ? { opacity: 0, y: 200 } : { opacity: 1, y: 0 }
        }
        // animate={{ opacity: 1, y: 0 }}
        // exit={{ opacity: 0, y: 200 }}
      >
        <div className="mb-4">
          <h2 className="font-bold text-sm">
            Enter Password to open the vault
          </h2>
        </div>

        <PasswordInput
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="mt-8">
          <p className="text-xs text-orange-400">
            If you forget the password, we cannot recover it for you.
          </p>
          <motion.button
            {...buttonAnim}
            className="shadow-lg shadow-emerald-300/20 mt-4 w-full h-12 border border-transparent rounded-full bg-emerald-300 text-black font-bold"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleOpenVault()}
          >
            Open Vault
          </motion.button>
          <p className="text-rose-500 h-4 py-2 text-xs font-bold">{error}</p>
        </div>
      </motion.div>
    </div>
  );
};

const OpenVault = ({ setLock }) => {
  const [panelState, setPanelState] = useState("active");
  const [editor, setEditor] = useState({
    show: false,
    type: "login",
    animate: "show",
    initData: null,
  });
  const { data, setData, setPassKey, passKey } = useAppContext();

  const lock = async () => {
    const res = await window.api.decryptVault(passKey, data);
    if (res.success) {
      setPassKey("");
      setData([]);
      setLock();
    }
  };
  const [hoverLock, setHoverLock] = useState(false);
  return (
    <Layout>
      <motion.div
        initial={{ scale: 0.5, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0.5 }}
        className="relative w-full h-full"
      >
        <AnimatePresence>
          {editor.show && (
            <motion.div
              onClick={() => {
                setEditor({ ...editor, animate: "show" });
                setPanelState("inactive");
              }}
              variants={{
                show: { opacity: 1, scale: 1, backdropFilter: "blur(10px)" },
                disable: {
                  opacity: 0.8,
                  scale: 0.8,
                  y: 26,
                  backdropFilter: "none",
                },
              }}
              className={`${
                editor.animate === "disable" ? "z-10" : "z-30"
              } border border-lime-100/10 bg-lime-500/10 absolute top-0 p-4 left-0 w-full h-[464px] rounded-3xl`}
              initial={{ opacity: 0, scale: 0.15 }}
              animate={editor.animate}
              exit={{ opacity: 0, scale: 0.15 }}
            >
              {editor.type === "login" ? (
                <LoginForm
                  initData={editor.initData}
                  onClose={() => {
                    setTimeout(() => {
                      setEditor((prev) => ({
                        ...prev,
                        initData: null,
                        show: false,
                      }));
                      setPanelState("active");
                    }, 1);
                  }}
                />
              ) : (
                <NoteForm
                  initData={editor.initData}
                  onClose={() => {
                    setTimeout(() => {
                      setEditor((prev) => ({
                        ...prev,
                        initData: null,
                        show: false,
                      }));
                      setPanelState("active");
                    }, 1);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-16">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-between gap-8"
            >
              <ActionButton
                onClick={() => {
                  setPanelState("inactive");
                  setEditor({ show: true, type: "login", animate: "show" });
                }}
              >
                <span className="w-full flex items-center justify-between px-1 text-sm font-semibold">
                  <span className="w-full">+ New Login info</span>
                  <span className="bg-blue-500/30 shrink-0 h-14 w-14 rounded-full flex items-center justify-center">
                    <LuCircleUserRound className="w-6 h-6" />
                  </span>
                </span>
              </ActionButton>
              <ActionButton
                onClick={() => {
                  setPanelState("inactive");
                  setEditor({ show: true, type: "note", animate: "show" });
                }}
              >
                <span className="w-full flex items-center justify-between px-1 text-sm font-semibold">
                  <span className="w-full">+ New Secure Note</span>
                  <span className="bg-emerald-500/30 shrink-0 h-14 w-14 rounded-full flex items-center justify-center">
                    <LuFilePlus className="w-6 h-6" />
                  </span>
                </span>
              </ActionButton>
            </motion.div>
          </AnimatePresence>
        </div>
        <Panel
          panelState={panelState}
          setEditorState={setEditor}
          setPanelState={setPanelState}
          editor={editor}
        />
      </motion.div>
      <div className="fixed right-2 bottom-2 z-20">
        <motion.button
          onHoverStart={() => setHoverLock(true)}
          onHoverEnd={() => setHoverLock(false)}
          whileHover={{ width: 126 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => lock()}
          className="w-[52px] h-[52px]
                    rounded-full bg-rose-800 font-bold hover:bg-rose-600 text-white/30
                    text-lg flex items-center justify-center hover:text-white/70 overflow-hidden"
        >
          {hoverLock ? (
            <span className="select-none block text-xs font-bold w-[126px] shrink-0">
              Lock Vault
            </span>
          ) : (
            <LuLock />
          )}
        </motion.button>
      </div>
    </Layout>
  );
};

export default function Vault() {
  const [open, setOpen] = useState(false);
  const [offload, setOffload] = useState(false);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => setOffload(true), 300);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <div className="relative w-full h-full">
        <AnimatePresence>
          {!offload && (
            <>
              <Door state={open ? "open" : "close"} duration={0.2} delay={0} />
              {/* {!open && <Lock setOpen={setOpen} />} */}
              <Lock setOpen={setOpen} state={open ? "open" : "close"} />
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {open && (
            <OpenVault
              setLock={() => {
                setOffload(false);
                setOpen(false);
                // setTimeout(() => setOpen(false), 1);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const ActionButton = ({ children, ...props }) => {
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
};
