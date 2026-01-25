import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CreateVault } from "./CreateVault";

const lib =
  "abcdefghijklmnopqrstuvwxyz_1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567980";

/**
 *
 */
const cryptoMock = () => {
  let cryptoMock = "";
  const len = Math.floor(Math.random() * 58) + 5;
  for (let i = 0; i < len; i++) {
    cryptoMock += lib[Math.floor(Math.random() * lib.length)];
  }
  return cryptoMock;
};

/**
 *
 */
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

/**
 *
 */
const CryptoEffect = () => {
  const [data, setData] = useState(() => createEffectParams());
  const [crypto, setCrypto] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setData(() => createEffectParams());
      },
      data.duration * 1000 + data.delay * 1000
    );

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
      clearTimeout(bgTimer);
      clearTimeout(lockTimer);
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
