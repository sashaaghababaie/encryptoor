import { motion, AnimatePresence } from "motion/react";
import {
  LuFilePlus,
  LuCircleUserRound,
  LuLock,
  LuShare,
  LuImport,
} from "react-icons/lu";
import { useState } from "react";
import { Panel } from "./Panel";
import { LoginForm, NoteForm } from "./Froms";
import Layout from "./layout/Layout";
import { useAppContext } from "../context/Context";
import ExportBackupModal from "./ExportBackupModal";
import ImportBackupModal from "./ImportBackupModal";
import ActionButton from "./ui/ActionButton";

/**
 *
 */
export default function OpenedVault({ setLock }) {
  const [panelState, setPanelState] = useState("active");
  const [hoverLock, setHoverLock] = useState(false);
  const [hoverBackup, setHoverBackup] = useState(false);
  const [hoverImport, setHoverImport] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [editor, setEditor] = useState({
    show: false,
    type: "login",
    animate: "show",
    initData: null,
  });

  const { setData, setSession } = useAppContext();

  const handleLock = async () => {
    await window.api.lock();
    setSession("");
    setData([]);
    setLock();
  };

  return (
    <Layout>
      <ExportBackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />
      <ImportBackupModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
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
                show: { opacity: 1, scale: 1, backdropFilter: "blur(4px)" },
                disable: {
                  opacity: 0.8,
                  scale: 0.8,
                  y: 26,
                  backdropFilter: "none",
                },
              }}
              className={`${
                editor.animate === "disable" ? "z-10" : "z-30"
              } border border-lime-100/10 bg-zinc-800/50 absolute top-0 p-4 left-0 w-full h-[464px] rounded-3xl`}
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
      <div className="fixed right-2 bottom-[120px] z-20">
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
      <div className="fixed right-2 bottom-[64px] z-20">
        <motion.button
          onHoverStart={() => setHoverBackup(true)}
          onHoverEnd={() => setHoverBackup(false)}
          whileHover={{ width: 126 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => setShowBackupModal(true)}
          className="w-[52px] h-[52px]
                    rounded-full bg-emerald-800 font-bold hover:bg-emerald-600 text-white
                    text-lg flex items-center justify-center hover:text-white overflow-hidden"
        >
          {hoverBackup ? (
            <span className="select-none block text-xs font-bold w-[126px] shrink-0">
              Safe Backup
            </span>
          ) : (
            <LuShare />
          )}
        </motion.button>
      </div>
      <div className="fixed right-2 bottom-2 z-20">
        <motion.button
          onHoverStart={() => setHoverImport(true)}
          onHoverEnd={() => setHoverImport(false)}
          whileHover={{ width: 126 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => setShowImportModal(true)}
          className="w-[52px] h-[52px]
                    rounded-full bg-blue-600 font-bold hover:bg-blue-500 text-white
                    text-lg flex items-center justify-center hover:text-white overflow-hidden"
        >
          {hoverImport ? (
            <span className="select-none block text-xs font-bold w-[126px] shrink-0">
              Import Backup
            </span>
          ) : (
            <LuImport />
          )}
        </motion.button>
      </div>
    </Layout>
  );
}
