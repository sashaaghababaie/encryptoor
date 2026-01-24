import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PasswordInput } from "./ui/Inputs";

export const CreateVault = ({ setInitialized, setShowLock }) => {
  const [inputs, setInputs] = useState({ password: "", repeat: "" });
  const [error, setError] = useState("");
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [secureHint, setSecureHint] = useState(false);

  const handleInput = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (inputs.repeat.length > 0 && inputs.password !== inputs.repeat) {
      setError("Passwords aren't match");
    } else {
      setError("");
    }
  }, [inputs]);

  const handleCreateVault = async () => {
    try {
      if (inputs.password.length === 0) {
        throw new Error("Please type a password");
      }

      if (inputs.password !== inputs.repeat) {
        throw new Error("Passwords aren't match");
      }

      const res = await window.api.encryptVault(inputs.password, [
        {
          id: "0",
          title: "Welcome",
          type: "note",
          note: "Hello Encryptoor",
        },
      ]);

      if (res.success) {
        setTimeout(() => setInitialized(true), 300);
        setTimeout(() => setShowLock(false), 1);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      setError(err.message);

      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });

      setTimeout(() => setButtonAnim({}), 250);
    }
  };

  const enoughLen = () => inputs.password.length >= 10;
  const hasDigit = () => /\d/.test(inputs.password);
  const hasUppercase = () => /[A-Z]/.test(inputs.password);
  const hasLowercase = () => /[a-z]/.test(inputs.password);
  const hasSpecial = () =>
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~ ]/.test(inputs.password);

  return (
    <div className="absolute p-4 inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="flex p-4 flex-col gap-4 w-full max-w-[600px] text-white border border-lime-100/10 bg-lime-700/10 rounded-3xl"
        initial={{ opacity: 0, y: 200 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 200 }}
      >
        <div className="mb-4">
          <h2 className="font-bold text-sm">Create a Strong master password</h2>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Type Password:</label>
          <PasswordInput
            name="password"
            value={inputs.password}
            onChange={handleInput}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Repeat Password:</label>
          <PasswordInput
            name="repeat"
            value={inputs.repeat}
            onChange={handleInput}
          />
        </div>

        <div>
          <p className="text-rose-500 h-4  text-xs font-bold">{error}</p>
          <p className="text-xs text-orange-400">
            If you forget the password, we cannot recover it for you.
          </p>
          <motion.button
            {...buttonAnim}
            className="shadow-lg shadow-emerald-300/20 mt-4 w-full h-12 border border-transparent rounded-full bg-emerald-300 text-black font-bold"
            whileHover={{ scale: 1.05 }}
            onClick={handleCreateVault}
          >
            Create Vault
          </motion.button>
        </div>
        <button
          onClick={() => setSecureHint(true)}
          className="text-xs text-zinc-400 underline-offset-2 underline underline-zinc-400 hover:underline-zinc-300 hover:text-zinc-300"
        >
          Help me create a secure password
        </button>
        {secureHint && (
          <motion.ul
            transition={{ type: "spring", stiffness: 300 }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 80, opacity: 1 }}
            className="text-xs font-bold overflow-none"
          >
            <li
              className={`${
                enoughLen() ? "text-emerald-400" : "text-rose-500"
              }`}
            >
              -More than 10 characters
            </li>
            <li
              className={`${hasDigit() ? "text-emerald-400" : "text-rose-500"}`}
            >
              -Add at least 1 digit
            </li>
            <li
              className={`${
                hasLowercase() ? "text-emerald-400" : "text-rose-500"
              }`}
            >
              -Add at least 1 lower case character
            </li>
            <li
              className={`${
                hasUppercase() ? "text-emerald-400" : "text-rose-500"
              }`}
            >
              -Add at least 1 upper case character
            </li>
            <li
              className={`${
                hasSpecial() ? "text-emerald-400" : "text-rose-500"
              }`}
            >
              -Add at least 1 special character e.g !@#$%^&*-_=+
            </li>
          </motion.ul>
        )}
      </motion.div>
    </div>
  );
};
