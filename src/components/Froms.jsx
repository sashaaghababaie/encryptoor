import { useState } from "react";
import { motion } from "motion/react";
import { nanoid } from "nanoid";
import { useAppContext } from "../context/Context";
import { TextInput, PasswordInput } from "./ui/Inputs";

/**
 * Input Form for store a LoginInfo
 * @param {*} param0
 * @returns
 */
export const LoginForm = ({ onClose, initData }) => {
  // const [success, setSuccess] = useState(false);
  const [error, setError] = useState({ title: "" });
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [loginData, setLoginData] = useState(
    initData || { username: "", password: "", website: "", title: "" }
  );

  const { setData, data, passKey } = useAppContext();

  const handleInput = (e) => {
    error[e.target.name] = "";
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!loginData.title) {
      setError((prev) => ({ ...prev, title: "Required" }));

      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });

      setTimeout(() => {
        setButtonAnim({});
      }, 200);

      return;
    }

    const loginInfo = {
      id: initData ? initData.id : nanoid(),
      type: "login",
      ...loginData,
    };

    try {
      const newData = [...data];

      if (initData) {
        let edited = newData.find((d) => d.id === loginInfo.id);
        Object.assign(edited, loginInfo);
      } else {
        newData.push(loginInfo);
      }
      // setSuccess(true);
      await window.api.encryptVault(passKey, newData);

      // onClose();

      const res = await window.api.decryptVault(passKey);

      if (res.success) {
        setData(res.data);
        onClose();
      } else {
        console.log("error");
        return;
      }
    } catch (error) {
      console.log("error");
      return;
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* {success && (
        <motion.div
          className="w-44 h-44 text-8xl rounded-full absolute bg-white/10 backdrop-blur-lg inset-0"
          initial={{ y: 0, scale: 0, opacity: 1 }}
          animate={{ y: 100, scale: 1, opacity: 0 }}
        ></motion.div>
      )} */}
      <h1 className="font-bold text-lg text-white">Add Login info</h1>{" "}
      <div className="flex flex-col mt-4 text-sm h-full ">
        <div className="flex flex-col gap-2 h-full justify-between py-8">
          <TextInput
            name="title"
            error={error.title}
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
 * Input Form for store a Note
 * @param {*} param0
 * @returns
 */
export const NoteForm = ({ onClose, initData }) => {
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [noteData, setNoteData] = useState(initData || { note: "", title: "" });
  const [error, setError] = useState({ title: "" });

  const { setData, data, passKey } = useAppContext();

  const handleInput = (e) => {
    error[e.target.name] = "";
    setNoteData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!noteData.title) {
      setError((prev) => ({ ...prev, title: "Required" }));

      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });

      setTimeout(() => {
        setButtonAnim({});
      }, 200);

      return;
    }

    const noteInfo = {
      id: initData ? initData.id : nanoid(),
      type: "note",
      ...noteData,
    };

    try {
      const newData = [...data];

      if (initData) {
        let edited = newData.find((d) => d.id === noteInfo.id);
        Object.assign(edited, noteInfo);
      } else {
        newData.push(noteInfo);
      }

      await window.api.encryptVault(passKey, newData);

      const res = await window.api.decryptVault(passKey);

      if (res.success) {
        setData(res.data);
        onClose();
      } else {
        console.log("error");
        return;
      }
    } catch (error) {
      console.log("error");
      return;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="font-bold text-lg text-white">Add Secure note</h1>
      <div className="flex flex-col mt-4 text-sm h-full ">
        <div className="flex flex-col gap-2 h-full justify-between py-8">
          <TextInput
            error={error.title}
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
            className="resize-none outline-none w-full p-4 rounded-3xl h-full shadow-inner-lg bg-zinc-700/20 text-zinc-300 font-bold shadow-white"
          />
        </div>
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
