import { motion, AnimatePresence } from "motion/react";
import { LuX } from "react-icons/lu";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/Context";
import { PasswordInput } from "./ui/Inputs";
import Modal from "./ui/Modal";

export default function ExportBackupModal({ onClose, isOpen }) {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");

  const [state, setState] = useState("current");
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });

  const [errors, setErrors] = useState({ current: "", new: "", repeat: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    setErrorMsg("");
    setErrors((prev) => ({ ...prev, new: "" }));
    setNewPass(e.target.value);
  };

  const handleInputRepeatPass = (e) => {
    setErrorMsg("");
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
          err.new = "";
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
          <h1 className="font-bold text-lg text-white">Export Vault</h1>
          <button
            className="hover:text-white/50 duration-200"
            onClick={handleClose}
          >
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
}
