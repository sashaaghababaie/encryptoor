import { useState } from "react";
import { motion } from "motion/react";

export const LoginForm = ({ onCancel }) => {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");

  return (
    <div className="flex flex-col h-full">
      <h1 className="font-bold text-lg text-white">Add Login info</h1>
      <div className="flex flex-col mt-4 text-sm h-full ">
        <div className="flex flex-col gap-2 h-full justify-between py-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="A meaningful title for searching"
            type="text"
            className="outline-none w-full h-12 px-4 rounded-full shadow-inner-lg bg-zinc-700/20 text-zinc-300 font-bold shadow-white"
          />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            type="text"
            className="outline-none w-full h-12 px-4 rounded-full shadow-inner-lg bg-zinc-700/20 text-zinc-300 font-bold shadow-white"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="text"
            className="outline-none w-full h-12 px-4 rounded-full shadow-inner-lg bg-zinc-700/20 text-zinc-300 font-bold shadow-white"
          />
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Website URL (Optional)"
            type="text"
            className="outline-none w-full h-12 px-4 rounded-full shadow-inner-lg bg-zinc-700/20 text-zinc-300 font-bold shadow-white"
          />
        </div>
        <div className="flex gap-4">
          <motion.button
            onClick={onCancel}
            className="mt-4 w-full h-12 rounded-full border border-white/40 bg-transparent text-white/40 hover:text-rose-500 font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            className="shadow-lg shadow-emerald-300/20 mt-4 w-full h-12 border border-transparent rounded-full bg-emerald-300 text-black font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Login Info
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export const NoteForm = ({ onCancel }) => {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="flex flex-col h-full">
      <h1 className="font-bold text-lg text-white">Add Secure note</h1>
      <div className="flex flex-col mt-4 text-sm h-full ">
        <div className="flex flex-col gap-2 h-full justify-between py-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="A meaningful title for searching"
            type="text"
            className="outline-none w-full h-12 px-4 rounded-full shadow-inner-lg bg-zinc-700/20 text-zinc-300 font-bold shadow-white"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Your note..."
            type="text"
            className="resize-none outline-none w-full p-4 rounded-3xl h-full shadow-inner-lg bg-zinc-700/20 text-zinc-300 font-bold shadow-white"
          />
        </div>
        <div className="flex gap-4">
          <motion.button
            onClick={onCancel}
            className="mt-4 w-full h-12 rounded-full border border-white/40 bg-transparent text-white/40 hover:text-rose-500 font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            className="shadow-lg shadow-emerald-300/20 mt-4 w-full h-12 border border-transparent rounded-full bg-emerald-300 text-black font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Login Info
          </motion.button>
        </div>
      </div>
    </div>
  );
};
