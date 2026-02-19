import { useAppContext } from "../context/Context";
import { useState, useEffect, useRef } from "react";
import { PasswordInput } from "./ui/Inputs";
import { motion } from "motion/react";
import { ERRORS } from "../utils/error";
import Key from "./ui/Key";

/**
 *
 */
export const Lock = ({ setState, state }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });

  const { setData, setInitialized, setSession } = useAppContext();

  const input = useRef(null);

  const addToRef = (el) => {
    if (el && input.current !== el) {
      input.current = el;
    }
  };

  useEffect(() => {
    if (state === "close") {
      if (input.current) {
        input.current.focus();
      }
    }
  }, [state]);

  const handleOpenVault = async () => {
    try {
      if (password.length === 0) {
        throw new Error("Please type the password");
      }

      const res = await window.api.unlock(password);

      if (res.success) {
        setSession(true);
        setData(res.data);
        setState("open");
        setPassword("");
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      if (
        err.message === ERRORS.NOT_INITIALIZED ||
        err.message === ERRORS.INVALID_VAULT
      ) {
        setInitialized(false);
      } else {
        setError(err.message);
      }

      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });

      setTimeout(() => setButtonAnim({}), 250);
    }
  };

  useEffect(() => {
    const down = (e) => {
      if (e.key === "Enter") {
        if (state !== "disable") {
          handleOpenVault();
        }
      }
    };

    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [handleOpenVault, state]);

  return (
    <div className="absolute p-4 inset-0 z-30 flex items-center justify-center">
      <motion.div
        className="flex p-4 flex-col gap-4 w-full max-w-[600px] text-white border border-lime-100/10 bg-lime-700/10 rounded-3xl"
        variants={{
          open: { opacity: 0, y: 200, scale: 1 },
          close: { opacity: 1, y: 0, scale: 1 },
          disable: { opacity: 0.5, scale: 0.8, y: -160 },
        }}
        initial={
          state === "close" ? { opacity: 0, y: 200 } : { opacity: 1, y: 0 }
        }
        animate={state}
      >
        <motion.div
          className="h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 1 }}
        >
          <div className="mb-4">
            <h2 className="font-bold text-sm">
              Enter Password to open the vault
            </h2>
          </div>

          <PasswordInput
            autoFocus
            addToRef={addToRef}
            // label="Password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mt-8">
            <p className="text-xs text-orange-400">
              If you forget the password, we cannot recover it for you.
            </p>
            <motion.button
              {...buttonAnim}
              className="shadow-lg shadow-emerald-300/20 mt-4 w-full h-12 border border-transparent rounded-full bg-emerald-300 text-black font-bold"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleOpenVault()}
            >
              Open Vault{" "}
              <Key
                size="sm"
                keyCode="enter"
                className="text-emerald-600 border-emerald-600"
              />
            </motion.button>
            <p className="text-rose-500 h-12 py-2 text-xs font-bold">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={() => setState("disable")}
                className="text-xs text-zinc-400 underline-offset-2 underline underline-zinc-400 hover:underline-zinc-300 hover:text-zinc-300"
              >
                Change Password
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

/**
 *
 */
export const ChangePassword = ({ onClose }) => {
  const [inputs, setInputs] = useState({
    current: "",
    newPass: "",
    repeatNewPass: "",
  });
  const [error, setError] = useState("");
  const [buttonAnim, setButtonAnim] = useState({ animate: {}, transition: {} });
  const [secureHint, setSecureHint] = useState(false);

  const handleInput = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (
      inputs.repeatNewPass.length > 0 &&
      inputs.newPass !== inputs.repeatNewPass
    ) {
      setError("Passwords aren't match");
    } else {
      setError("");
    }
  }, [inputs]);

  const handleChangePassword = async () => {
    try {
      if (inputs.newPass.length === 0) {
        throw new Error("Please type a password");
      }

      if (inputs.newPass !== inputs.repeatNewPass) {
        throw new Error("Passwords aren't match");
      }

      const res = await window.api.changePassword(
        inputs.current,
        inputs.newPass,
      );

      if (res.success === true) {
        setInputs({ current: "", newPass: "", repeatNewPass: "" });
        onClose();
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      setError(err.message);

      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });

      setTimeout(() => {
        setButtonAnim({});
      }, 250);

      return;
    }
  };

  useEffect(() => {
    const down = (e) => {
      if (e.key === "Enter") {
        handleChangePassword();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [handleChangePassword, onClose]);

  const enoughLen = () => inputs.newPass.length >= 8;
  const hasDigit = () => /\d/.test(inputs.newPass);
  const hasUppercase = () => /[A-Z]/.test(inputs.newPass);
  const hasLowercase = () => /[a-z]/.test(inputs.newPass);
  const hasSpecial = () =>
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~ ]/.test(inputs.newPass);

  return (
    <div className="absolute p-4 inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="flex p-4 flex-col gap-4 w-full max-w-[600px] text-white border backdrop-blur-lg border-lime-100/10 bg-lime-700/10 rounded-3xl"
        initial={{ opacity: 0, y: 300 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 300 }}
      >
        <div className="mb-4">
          <h2 className="font-bold text-sm">Create a Strong master password</h2>
          <p className="text-xs text-orange-400">
            If you forget the password, we cannot recover it for you.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Current Password:</label>
          <PasswordInput
            autoFocus
            name="current"
            value={inputs.current}
            onChange={handleInput}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">New Password:</label>
          <PasswordInput
            name="newPass"
            value={inputs.newPass}
            onChange={handleInput}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Repeat New Password:</label>
          <PasswordInput
            name="repeatNewPass"
            value={inputs.repeatNewPass}
            onChange={handleInput}
          />
        </div>

        <div>
          <p className="text-rose-500 h-4 text-xs font-bold">{error}</p>
          <div className="flex gap-4">
            <motion.button
              onClick={onClose}
              className="relative mt-4 w-full h-12 rounded-full border border-white/40 bg-transparent text-white/40 hover:text-rose-500 font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel{" "}
              <span className="hidden absolute ml-2 bottom-3.5 sm:inline-block">
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
              onClick={handleChangePassword}
            >
              Change Password{" "}
              <Key
                size="sm"
                keyCode="enter"
                className="text-emerald-600 border-emerald-600"
              />
            </motion.button>
          </div>
        </div>

        <button
          onClick={() => setSecureHint(true)}
          className="text-xs text-blue-400 underline-offset-2 underline underline-blue-400 hover:underline-blue-300 hover:text-blue-300"
        >
          Help me create a basic secure password
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
              -More than 8 characters
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
              -Add at least 1 special character e.g !@#$
            </li>
          </motion.ul>
        )}
      </motion.div>
    </div>
  );
};
