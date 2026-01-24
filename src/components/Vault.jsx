import { motion, AnimatePresence } from "motion/react";
import {
  LuFilePlus,
  LuCircleUserRound,
  LuLock,
  LuShare,
  LuX,
} from "react-icons/lu";
import { useState, useEffect } from "react";
import { Panel } from "./Panel";
import { LoginForm, NoteForm } from "./Froms";
import Layout from "./layout/Layout";
import { Lock, ChangePassword } from "./Lock";
import { useAppContext } from "../context/Context";
import { VaultDoor } from "./anim/VaultDoor";
import { PasswordInput } from "./ui/Inputs";

const OpenVault = ({ setLock }) => {
  const [panelState, setPanelState] = useState("active");
  const [hoverLock, setHoverLock] = useState(false);
  const [hoverBackup, setHoverBackup] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [editor, setEditor] = useState({
    show: false,
    type: "login",
    animate: "show",
    initData: null,
  });

  const { data, setData, passKey, setPassKey } = useAppContext();

  const handleLock = async () => {
    const res = await window.api.encryptVault(passKey, data);

    if (res.success) {
      setPassKey("");
      setData([]);
      setLock();
    }
  };

  // const handleBakcup = async () => {
  //   // const res = await window.api.encryptVault(passKey, data);
  //   // if (res.success) {
  //   //   setPassKey("");
  //   //   setData([]);
  //   //   setLock();
  //   // }
  // };

  return (
    <Layout>
      <ExportBackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
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
      <div className="fixed right-2 bottom-[64px] z-20">
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
      <div className="fixed right-2 bottom-2 z-20">
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

const Modal = ({ isOpen, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed flex items-center justify-center z-50 inset-0 bg-black/50 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            exit={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex z-2 p-4 flex-col gap-4 w-full max-w-[600px] text-white border border-lime-100/10 bg-lime-700/10 rounded-3xl"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ExportBackupModal = ({ onClose, isOpen }) => {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [state, setState] = useState("current");
  const [errors, setErrors] = useState({ current: "", new: "", repeat: "" });
  const [success, setSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { passKey, data } = useAppContext();

  useEffect(() => {
    setNewPass("");
    setRepeatPass("");
    setErrors((prev) => ({ ...prev, new: "", repeat: "" }));
  }, [state]);

  const handleInputCurrentPass = (e) => {
    setErrors((prev) => ({ ...prev, current: "" }));
    setCurrentPass(e.target.value);
  };

  const handleInputNewPass = (e) => {
    setErrors((prev) => ({ ...prev, new: "" }));
    setNewPass(e.target.value);
  };

  const handleInputRepeatPass = (e) => {
    setErrors((prev) => ({ ...prev, repeat: "" }));
    setRepeatPass(e.target.value);
  };

  const handleClose = () => {
    setNewPass("");
    setCurrentPass("");
    setRepeatPass("");
    setState("current");
    setSuccess(null);
    setShowSuccess(false);
    setErrors({ new: "", current: "", repeat: "" });
    setErrorMsg("");

    onClose();
  };

  const handleExport = async () => {
    try {
      const err = { new: "", current: "", repeat: "" };

      setErrors(err);
      setErrorMsg("");

      if (currentPass.length === 0) {
        err.current = "Required";
      }

      if (currentPass.length !== 0 && currentPass !== passKey) {
        err.current = "Not Match";
      }

      if (state === "new") {
        if (repeatPass.length === 0) {
          err.new = "Required";
        }

        if (newPass.length === 0) {
          err.new = "Required";
        }

        if (
          newPass.length !== 0 &&
          repeatPass.length !== 0 &&
          repeatPass !== newPass
        ) {
          err.new = "Not Match";
          err.repeat = "Not Match";
        }
      }

      if (err.current || err.new || err.repeat) {
        setErrors(err);
        throw new Error("");
      }

      const pass = state === "current" ? currentPass : newPass;

      const res = await window.api.exportVault(pass, data);

      if (res.success) {
        setSuccess(true);
        setTimeout(() => setShowSuccess(true), 100);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });

      if (err.message.match("ENOSPC")) {
        setErrorMsg("There is no space left on the device");
      }

      setSuccess(false);
      setTimeout(() => setButtonAnim({}), 250);
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <motion.div animate={success ? { height: 200 } : {}}>
        <div className="flex justify-between">
          <h1 className="font-bold text-lg text-white">Export Data</h1>
          <button onClick={handleClose}>
            <LuX />
          </button>
        </div>
        <AnimatePresence>
          {!success && (
            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mt-8 text-sm">
                <PasswordInput
                  onChange={handleInputCurrentPass}
                  value={currentPass}
                  error={errors.current}
                  name="current"
                  label="Current Password"
                />
              </div>
              <div className="relative flex h-12 bg-zinc-700/20 mt-8 rounded-full">
                <div className="w-full h-12 z-0">
                  <motion.div
                    initial={{ transform: "translateX(0%)", scale: 0.5 }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                    }}
                    animate={
                      state === "current"
                        ? { transform: "translateX(0%)", scale: 0.5 }
                        : { transform: "translateX(100%)", scale: 1.5 }
                    }
                    className="w-1/2 h-12 rounded-full bg-blue-900"
                  ></motion.div>
                </div>
                <div className="absolute font-black text-xs flex inset-0">
                  <button
                    onClick={() => setState("current")}
                    className={`w-1/2 rounded-full ${state !== "current" && "hover:underline hover:underline-offset-2"}`}
                  >
                    Use current pass for backup
                  </button>
                  <button
                    onClick={() => setState("new")}
                    className={`w-1/2 rounded-full ${state !== "new" && "hover:underline hover:underline-offset-2"}`}
                  >
                    Create a new pass for backup
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {state === "new" && (
                  <motion.div
                    transition={{ duration: 0.12 }}
                    className="flex flex-col gap-2 py-2 text-sm items-center"
                    initial={{ opacity: 0, height: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 128 }}
                  >
                    <PasswordInput
                      value={newPass}
                      onChange={handleInputNewPass}
                      error={errors.new}
                      name="new"
                      label="New Password"
                    />
                    <PasswordInput
                      value={repeatPass}
                      onChange={handleInputRepeatPass}
                      error={errors.repeat}
                      name="repeat"
                      label="Repeat Password"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {errorMsg.length > 0 && (
                  <motion.div
                    transition={{ duration: 0.12 }}
                    className="flex flex-col gap-2 py-2 text-sm items-center"
                    initial={{ opacity: 0, height: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 24 }}
                  >
                    <p className="text-sm text-rose-500">{errorMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex gap-4">
                <motion.button
                  onClick={handleClose}
                  className="mt-4 w-full h-12 rounded-full border border-white/40 bg-transparent text-white/40 hover:text-rose-500 font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  {...buttonAnim}
                  className="shadow-lg shadow-emerald-300/20 mt-4 w-full h-12 border border-transparent rounded-full bg-emerald-300 text-black font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExport}
                >
                  Export
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {success && showSuccess && (
            <motion.div
              className="flex h-full items-center justify-center"
              transition={{ delay: 0.3 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-emerald-300  text-center  font-black p-2">
                The Vault successfully encrypted and backed up on /desktop.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Modal>
  );
};
