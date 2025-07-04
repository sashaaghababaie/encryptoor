import { useState } from "react";
import { motion } from "motion/react";
import { nanoid } from "nanoid";
import { useAppContext } from "./Context";
import { TextInput, PasswordInput } from "./Inputs";

export const LoginForm = ({ onClose, initData }) => {
  const [error, setError] = useState({ title: "" });
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [loginData, setLoginData] = useState(
    initData || { username: "", password: "", website: "", title: "" }
  );
  // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  const pass = "1234";

  const handleInput = (e) => {
    error[e.target.name] = "";
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const { setData, data, passKey } = useAppContext();

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
      id: nanoid(),
      type: "login",
      ...loginData,
    };

    try {
      await window.api.encryptVault(pass, [...data, loginInfo]);

      const res = await window.api.decryptVault(pass);

      if (res.success) {
        setData(res.data);
      } else {
        console.log("error");
      }

      onClose();
    } catch (error) {
      console.log("error");
      return;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="font-bold text-lg text-white">Add Login info</h1>
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
            // animate={{
            //   ...buttonAnim.animate,
            //   transition: buttonAnim.transition,
            // }}
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

export const NoteForm = ({ onClose, initData }) => {
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [noteData, setNoteData] = useState(initData || { note: "", title: "" });
  const [error, setError] = useState({ title: "" });

  const pass = "1234";

  const handleInput = (e) => {
    error[e.target.name] = "";
    setNoteData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const { setData, data, passKey } = useAppContext();

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

    const loginInfo = {
      id: nanoid(),
      type: "note",
      ...noteData,
    };

    try {
      await window.api.encryptVault(pass, [...data, loginInfo]);

      const res = await window.api.decryptVault(pass);

      if (res.success) {
        setData(res.data);
      } else {
        console.log("error");
      }

      onClose();
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
            // animate={{
            //   ...buttonAnim.animate,
            //   transition: buttonAnim.transition,
            // }}
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
