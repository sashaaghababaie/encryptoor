import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { PasswordInput } from "./Inputs";

const lib =
  "abcdefghijklmnopqrstuvwxyz_1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567980";

const cryptoMock = () => {
  let cryptoMock = "";
  const len = Math.floor(Math.random() * 58) + 5;
  for (let i = 0; i < len; i++) {
    cryptoMock += lib[Math.floor(Math.random() * lib.length)];
  }
  return cryptoMock;
};

const createEffectParams = () => {
  const width = window ? window.innerWidth + 500 : 1000;
  const crypto = cryptoMock();
  const x = Math.random() * width - 500;
  const duration = Math.random() * 10 + 1;
  const delay = Math.random();

  return {
    crypto,
    x,
    duration,
    delay,
  };
};

const CryptoEffect = () => {
  const [data, setData] = useState(() => createEffectParams());
  const [crypto, setCrypto] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(() => createEffectParams());
    }, data.duration * 1000 + data.delay * 1000);

    const time = Math.random() * 250 + 50;
    let counter = 0;

    const interval = setInterval(() => {
      counter++;
      setCrypto(data.crypto.slice(0, counter));
    }, time);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [data]);

  return (
    <motion.p
      key={data.crypto}
      className="font-bold text-white/40"
      initial={{ x: data.x }}
      animate={{
        opacity: [0, 0.4, 0.75, 1, 0],
        filter: [
          "blur(1px)",
          "blur(1px)",
          "blur(1px)",
          "blur(4px)",
          "blur(4px)",
        ],
      }}
      transition={{
        duration: data.duration,
        times: [0, 0.2, 0.5, 0.8, 1],
        delay: data.delay + 0.5,
      }}
    >
      {crypto}
    </motion.p>
  );
};

/**
 *
 * @returns
 */
const CreateVault = ({ setInitialized, setShowLock }) => {
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

  const handleCreateVault = () => {
    if (inputs.password !== inputs.repeat || inputs.password.length === 0) {
      setButtonAnim({
        animate: { x: [null, -12, 10, -8, 6, 0] },
        transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      });

      setTimeout(() => {
        setButtonAnim({});
      }, 200);

      return;
    }

    (async () => {
      const res = await window.api.encryptVault(inputs.password, [
        {
          id: "0",
          title: "Welcome",
          type: "note",
          note: "hello encryptor",
        },
      ]);

      if (res.success) {
        setTimeout(() => {
          setInitialized(true);
        }, 300);
        setTimeout(() => {
          setShowLock(false);
        }, 1);
      } else {
        console.log("error");
        return;
      }
    })();
  };

  const enoughLen = () => inputs.password.length >= 8;
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
        {!secureHint && (
          <button
            onClick={() => setSecureHint(!secureHint)}
            className="text-xs text-zinc-400 underline-offset-2 underline underline-zinc-400 hover:underline-zinc-300 hover:text-zinc-300"
          >
            Help me create a secure password
          </button>
        )}
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

/**
 *
 * @returns
 */
const Doors = () => {
  return (
    <div className="relative w-full h-full">
      <Door delay={0} duration={0.7} />
      <Door delay={0.5} duration={0.6} />
      <Door delay={0.9} duration={0.5} />
      <Door delay={1.2} duration={0.5} />
      <Door delay={1.5} duration={0.5} />
      <Door delay={1.8} duration={0.6} />
      <Door delay={2.2} duration={0.7} />
    </div>
  );
};

/**
 *
 * @param {*} param0
 * @returns
 */
const Door = ({ delay, duration }) => {
  return (
    <>
      <motion.div
        className="absolute left-0 top-0 w-1/2 h-full bg-zinc-800 z-30"
        initial={{ marginLeft: "-50%" }}
        animate={{
          marginLeft: "-0.1%",
        }}
        transition={{ duration, delay }}
      ></motion.div>
      <motion.div
        className="top-0 absolute right-0 w-1/2 h-full bg-zinc-800 z-30 "
        initial={{ marginRight: "-50%" }}
        animate={{
          marginRight: "-0.1%",
        }}
        transition={{ duration, delay }}
      ></motion.div>
      <motion.div
        className="top-0 absolute right-0 w-full h-full bg-black z-30 "
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.5,
        }}
        transition={{ duration: duration - 0.1, delay: delay + duration - 0.3 }}
      ></motion.div>
    </>
  );
};

/**
 *
 * @param {*} param0
 * @returns
 */
export default function Start({ setInitialized }) {
  const [height, setHeight] = useState();
  const [firstShow, setFirstShow] = useState(false);
  const [showDoors, setShowDoors] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showBg, setShowBg] = useState(true);

  useEffect(() => {
    let bgTimer = null;
    let lockTimer = null;

    if (showDoors) {
      lockTimer = setTimeout(() => setShowLock(true), 3000);
      bgTimer = setTimeout(() => setShowBg(false), 2000);
    }

    return () => {
      if (bgTimer) clearTimeout(bgTimer);
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, [showDoors]);

  useEffect(() => {
    const resize = () => setHeight(window.innerHeight);
    setFirstShow(true);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {showBg && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-black"
            >
              {Array.from({ length: 50 }).map(
                (_, i) => height > i * 25 && <CryptoEffect key={i} />
              )}
            </motion.div>
            <AnimatePresence>
              {!showDoors && (
                <motion.button
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                    transition: { duration: 1 },
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: !firstShow ? { duration: 1.5, delay: 2 } : {},
                  }}
                  onClick={() => setShowDoors(true)}
                  whileHover={{
                    scale: 1.2,
                    transition: { duration: 0.3, delay: 0 },
                  }}
                  className="z-10 middle-btn-3 p-4 shadow-none hover:shadow-lg dutaion-200 hover:shadow-white/30 rounded-full text-white"
                >
                  Create a Vault
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
        <div className="absolute inset-0">
          {showDoors && <Doors />}
          <AnimatePresence>
            {showLock && (
              <CreateVault
                setShowLock={setShowLock}
                setInitialized={setInitialized}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
