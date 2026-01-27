import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { nanoid } from "nanoid";
import { useAppContext } from "../context/Context";
import { TextInput, PasswordInput } from "./ui/Inputs";

/**
 * Input Form to store a LoginInfo
 */
export const LoginForm = ({ onClose, initData }) => {
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState("");
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [loginData, setLoginData] = useState(
    initData || { username: "", password: "", website: "", title: "" }
  );

  const { setData, data, session } = useAppContext();

  const handleInput = (e) => {
    setInputError("");
    setError("");
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setError("");

      if (loginData.title.length === 0) {
        setInputError("Required");
        throw new Error("required");
      }

      const loginInfo = {
        id: initData ? initData.id : nanoid(),
        type: "login",
        ...loginData,
      };

      const newData = structuredClone(data);

      if (initData) {
        let edited = newData.find((d) => d.id === loginInfo.id);
        Object.assign(edited, loginInfo);
      } else {
        newData.push(loginInfo);
      }

      const res = await window.api.update(session, newData);

      if (res.success === true) {
        setData(newData);
        onClose();
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      if (err.message === "required") {
        setError("");
      } else if (err.message.match("ENOSPC")) {
        setError("There is no space left on the device.");
      } else {
        setError("Unexpected error :(");
      }

      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });

      setTimeout(() => setButtonAnim({}), 250);
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <h1 className="font-bold text-lg text-white">Add Login info</h1>{" "}
      <div className="flex flex-col mt-4 text-sm h-full ">
        <div className="flex flex-col gap-2 h-full justify-between py-8">
          <TextInput
            name="title"
            error={inputError}
            shouldAlign
            label="Title:"
            value={loginData.title}
            onChange={handleInput}
            autoFocus
            placeholder="A meaningful title (using for search)"
            type="text"
          />
          <TextInput
            name="username"
            shouldAlign
            label="Username:"
            value={loginData.username}
            onChange={handleInput}
            placeholder="awesome_me"
            type="text"
          />
          <PasswordInput
            name="password"
            shouldAlign
            label="Password:"
            value={loginData.password}
            onChange={handleInput}
            placeholder="p@ssW0rD!"
            type="text"
          />
          <TextInput
            name="website"
            shouldAlign
            label="Website:"
            value={loginData.website}
            onChange={handleInput}
            placeholder="Website URL (Optional)"
            type="text"
          />
        </div>
        <div className="h-full"></div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 24, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-sm flex items-center  text-rose-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex gap-4">
          <motion.button
            onClick={onClose}
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
            onClick={handleSave}
          >
            Save Login Info
          </motion.button>
        </div>
      </div>
    </div>
  );
};

/**
 * Input Form to store a Note
 */
export const NoteForm = ({ onClose, initData }) => {
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [noteData, setNoteData] = useState(initData || { note: "", title: "" });
  const [inputError, setInputError] = useState("");
  const [error, setError] = useState("");

  const { setData, data, session } = useAppContext();

  const handleInput = (e) => {
    setError("");
    setInputError("");
    setNoteData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setError("");

      if (!noteData.title) {
        setInputError("Required");
        throw new Error("required");
      }

      const noteInfo = {
        id: initData ? initData.id : nanoid(),
        type: "note",
        ...noteData,
      };

      const newData = structuredClone(data);

      if (initData) {
        let edited = newData.find((d) => d.id === noteInfo.id);
        Object.assign(edited, noteInfo);
      } else {
        newData.push(noteInfo);
      }

      const res = await window.api.update(session, newData);

      if (res.success === true) {
        setData(newData);
        onClose();
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      if (err.message === "required") {
        setError("");
      } else if (err.message.match("ENOSPC")) {
        setError("There is no space left on the device.");
      } else {
        setError("Unexpected error :(");
      }

      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });

      setTimeout(() => setButtonAnim({}), 250);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="font-bold text-lg text-white">Add Secure note</h1>
      <div className="flex flex-col mt-4 text-sm h-full ">
        <div className="flex flex-col gap-2 h-full pt-8">
          <TextInput
            className="py-4"
            error={inputError}
            label="Title"
            value={noteData.title}
            name="title"
            onChange={handleInput}
            autoFocus
            placeholder="A meaningful title (using for search)"
            type="text"
          />
          <textarea
            value={noteData.note}
            name="note"
            onChange={handleInput}
            placeholder="Your note..."
            className="resize-none min-h-[200px] outline-none w-full p-4 rounded-3xl h-full shadow-inner-lg bg-zinc-700/20 text-zinc-300 font-bold shadow-white"
          />
        </div>
        <div className="h-full"></div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 24, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-sm flex items-center  text-rose-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex gap-4">
          <motion.button
            onClick={onClose}
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
            onClick={handleSave}
          >
            Save Note
          </motion.button>
        </div>
      </div>
    </div>
  );
};
