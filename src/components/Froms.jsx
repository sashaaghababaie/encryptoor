import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { nanoid } from "nanoid";
import { useAppContext } from "../context/Context";
import { TextInput, PasswordInput } from "./ui/Inputs";
import Key from "./ui/Key";
/**
 * Input Form to store a LoginInfo
 */
export const LoginForm = ({ onClose, initData }) => {
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState("");
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [loginData, setLoginData] = useState(
    initData || { username: "", password: "", website: "", title: "" },
  );

  const { setData } = useAppContext();

  useEffect(() => {
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [loginData, onClose]);

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

      const id = initData ? initData.id : nanoid();
      const createdAt = initData ? initData.createdAt : Date.now();
      const updatedAt = Date.now();

      const loginInfo = {
        id,
        type: "login",
        ...loginData,
        createdAt,
        updatedAt,
      };

      const res = await window.api.upsert(loginInfo);

      if (res.success === true) {
        setData(res.data);
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
            Cancel{" "}
            <span className="hidden sm:inline">
              <Key
                size="sm"
                keyCode="esc"
                className="text-white/40 border-white/40"
              />
            </span>
          </motion.button>
          <motion.button
            {...buttonAnim}
            className="shadow-lg shadow-emerald-300/20 mt-4 w-full h-12 border border-transparent rounded-full bg-emerald-300 text-black font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
          >
            Save Login Info{" "}
            <span className="hidden sm:inline">
              <Key
                size="sm"
                keyCode="cmd"
                className="text-emerald-700 border-emerald-700"
              />{" "}
              <span className="text-emerald-700">+</span>{" "}
              <Key
                size="sm"
                keyCode="enter"
                className="text-emerald-700 border-emerald-700"
              />
            </span>
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

  const { setData } = useAppContext();

  useEffect(() => {
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [noteData]);

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

      const id = initData ? initData.id : nanoid();
      const createdAt = initData ? initData.createdAt : Date.now();
      const updatedAt = Date.now();

      const noteInfo = {
        id,
        type: "note",
        ...noteData,
        createdAt,
        updatedAt,
      };

      const res = await window.api.upsert(noteInfo);

      if (res.success === true) {
        setData(res.data);
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
            className="placeholder-zinc-500 resize-none min-h-[200px] outline-none w-full p-4 rounded-3xl h-full shadow-inner-lg bg-zinc-700/20 text-zinc-300 font-bold shadow-white"
          />
        </div>
        <div className="h-full"></div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 24, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-sm flex items-center text-rose-500"
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
            Cancel{" "}
            <span className="hidden sm:inline">
              <Key
                size="sm"
                keyCode="esc"
                className="text-white/25 border-white/25"
              />
            </span>
          </motion.button>
          <motion.button
            {...buttonAnim}
            className="shadow-lg shadow-emerald-300/20 mt-4 w-full h-12 border border-transparent rounded-full bg-emerald-300 text-black font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
          >
            Save Note{" "}
            <span className="hidden sm:inline">
              <Key
                size="sm"
                keyCode="cmd"
                className="text-emerald-700 border-emerald-700"
              />{" "}
              <span className="text-emerald-700">+</span>{" "}
              <Key
                size="sm"
                keyCode="enter"
                className="text-emerald-700 border-emerald-700"
              />
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
