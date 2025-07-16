import { motion, AnimatePresence } from "motion/react";
import { LuFilePlus, LuCircleUserRound, LuLock } from "react-icons/lu";
import { useState, useEffect } from "react";
import { Panel } from "./Panel";
import { LoginForm, NoteForm } from "./Froms";
import Layout from "./layout/Layout";
import { Lock, ChangePassword } from "./Lock";
import { useAppContext } from "../context/Context";
import { VaultDoor } from "./anim/VaultDoor";

const OpenVault = ({ setLock }) => {
  const [panelState, setPanelState] = useState("active");
  const [hoverLock, setHoverLock] = useState(false);
  const [editor, setEditor] = useState({
    show: false,
    type: "login",
    animate: "show",
    initData: null,
  });

  const { data, setData, setPassKey, passKey } = useAppContext();

  const handleLock = async () => {
    const res = await window.api.encryptVault(passKey, data);
    if (res.success) {
      setPassKey("");
      setData([]);
      setLock();
    }
  };

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
          onClick={() => handleLock()}
          className="w-[52px] h-[52px]
                    rounded-full bg-rose-800 font-bold hover:bg-rose-600 text-white
                    text-lg flex items-center justify-center hover:text-white overflow-hidden"
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
  const [state, setState] = useState("close");
  const [offload, setOffload] = useState(false);

  useEffect(() => {
    if (state !== "open") return;

    const timer = setTimeout(() => setOffload(true), 300);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <div className="relative w-full h-full">
        <AnimatePresence>
          {!offload && (
            <>
              <VaultDoor state={state} duration={0.2} delay={0} />
              <Lock setState={setState} state={state} />
              <AnimatePresence>
                {state === "disable" && (
                  <ChangePassword onClose={() => setState("close")} />
                )}
              </AnimatePresence>
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {state === "open" && (
            <OpenVault
              setLock={() => {
                setOffload(false);
                setState("close");
                // setTimeout(() => setOpen(false), 1);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 *
 * @param {*} param0
 * @returns
 */
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
