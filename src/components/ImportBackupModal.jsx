import { motion, AnimatePresence } from "motion/react";
import { LuX } from "react-icons/lu";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/Context";
import { PasswordInput } from "./ui/Inputs";
import Modal from "./ui/Modal";
import { useDropzone } from "react-dropzone";

const ImportDropzone = ({ setFile }) => {
  const [error, setError] = useState("");

  const onDropAccepted = async (acceptedFiles) => {
    setError("");

    if (!acceptedFiles.length) return;

    const filePath = acceptedFiles[0].path;
    const fileName = acceptedFiles[0].name;
    let buffer = null;

    if (filePath.trim() === "") {
      buffer = await acceptedFiles[0].arrayBuffer();
    }

    setFile({ filePath, fileName, buffer });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "application/json": [".json", ".enc"],
    },
    onDropAccepted,
    onDropRejected: (fileRejections) => {
      const errorMessages = fileRejections
        .map((rejection) => {
          const reasons = rejection.errors.map((e) => e.message).join(", ");
          return `${reasons}`;
        })
        .join("\n");

      if (errorMessages.startsWith("File type must be ")) {
        setError(errorMessages);
      } else {
        setError("File is broken");
      }
    },
  });

  return (
    <div className="my-4">
      <div
        {...getRootProps()}
        className={`border-dashed text-sm border rounded-3xl h-20 flex items-center justify-center cursor-pointer hover:bg-white/10 ${isDragActive ? "bg-white/10" : ""}`}
      >
        <input {...getInputProps()} />
        {isDragActive
          ? "Drop the vault file here"
          : "Drag & drop a vault file, or click to select"}
      </div>
      <AnimatePresence>
        {error.length && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            exit={{ height: 0, opacity: 0 }}
            animate={{ height: 36, opacity: 1 }}
            className="text-rose-500 text-sm flex items-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ImportBackupModal({ onClose, isOpen }) {
  const [file, setFile] = useState(null);
  const [pass, setPass] = useState("");
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [status, setStatus] = useState(null);
  const [inputError, setInputError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { session, setData } = useAppContext();

  useEffect(() => {
    if (!file) setPass("");
  }, [file]);

  const handleInputPass = (e) => {
    setInputError("");
    setPass(e.target.value);
  };

  const handleClose = () => {
    setPass("");
    setFile(null);

    setSuccess(null);
    setShowSuccess(false);
    setInputError("");
    setErrorMsg("");

    onClose();
  };

  const handleImport = async () => {
    setInputError("");
    setErrorMsg("");

    try {
      if (!file) {
        throw new Error("No File.");
      }

      if (pass.length === 0) {
        setInputError("Required");
        throw new Error("Required");
      }

      let res;

      if (file.buffer) {
        res = await window.api.importByBuffer(session, pass, file.buffer);
      } else {
        res = await window.api.importByPath(session, pass, file.filePath);
      }

      if (res.success === true) {
        setSuccess(true);
        setTimeout(() => setShowSuccess(true), 100);
        setStatus(res.status);
        setData(res.data);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });

      if (err.message !== "Required") {
        setErrorMsg(err.message);
      }

      setSuccess(false);
      setTimeout(() => setButtonAnim({}), 250);
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <motion.div animate={success ? { height: 200 } : {}}>
        <div className="flex justify-between">
          <h1 className="font-bold text-lg text-white">Import Vault</h1>
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
              <AnimatePresence>
                {file === null ? (
                  <motion.div
                    className="h-full text-white"
                    initial={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                  >
                    <ImportDropzone setFile={setFile} />
                  </motion.div>
                ) : (
                  <motion.div
                    className="h-full text-white"
                    initial={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                  >
                    <div className="h-20 my-4 flex items-center justify-between px-12 border rounded-3xl">
                      {file.fileName}{" "}
                      <button
                        onClick={() => setFile(null)}
                        className="w-32 rounded-full hover:bg-rose-400 font-semibold py-2 bg-rose-500"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {file !== null && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    exit={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                  >
                    <div className="mb-4 mt-4 text-sm">
                      <PasswordInput
                        onChange={handleInputPass}
                        value={pass}
                        error={inputError}
                        name="pass"
                        label="File Password"
                        placeholer="asdf"
                      />
                    </div>
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
                        onClick={handleImport}
                      >
                        Import
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {success && showSuccess && status && (
            <motion.div
              className="flex h-full flex-col items-start justify-center"
              transition={{ delay: 0.3 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-emerald-300 text-center font-black p-2">
                {status.new} new Item{status.new <= 1 ? "" : "s"} imported.
              </p>
              {/* <p className="text-emerald-300 text-center font-black p-2">
                {status.updated} Item{status.updated <= 1 ? "" : "s"}{" "}
                overwritten.
              </p> */}
              <p className="text-emerald-300 text-center font-black p-2">
                {status.skipped} Item{status.skipped <= 1 ? "" : "s"} skipped.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Modal>
  );
}
