import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { LuFilePlus } from "react-icons/lu";
import { useState } from "react";
import { Panel } from "../components/Panel";
import { LoginForm, NoteForm } from "../components/Froms";

export default function Main() {
  const [panelState, setPanelState] = useState("inactive");
  const [editor, setEditor] = useState({
    show: true,
    type: "login",
    animate: "show",
  });

  return (
    <div className="relative w-full h-full">
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
            } border border-lime-100/10 bg-lime-500/10 absolute top-0 p-4 left-0 w-full h-[464px] z-10 rounded-3xl`}
            initial={{ opacity: 0, scale: 0.15 }}
            animate={editor.animate}
            exit={{ opacity: 0, scale: 0.15 }}
          >
            {editor.type === "login" ? (
              <LoginForm
                onCancel={() => {
                  setTimeout(() => {
                    setEditor((prev) => ({ ...prev, show: false }));
                    setPanelState("active");
                  }, 1);
                }}
              />
            ) : (
              <NoteForm
                onCancel={() => {
                  setTimeout(() => {
                    setEditor((prev) => ({ ...prev, show: false }));
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
                  <LuFilePlus className="w-6 h-6" />
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
    </div>
  );
}

export const ActionButton = ({ children, ...props }) => {
  return (
    <motion.button
      className="text-white/70 bg-zinc-800 w-full h-16 rounded-full flex items-center"
      initial={{ scale: 0.6, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, opacity: 1 }}
      //   whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
