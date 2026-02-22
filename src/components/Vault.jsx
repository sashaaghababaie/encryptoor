import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Lock, ChangePassword } from "./Lock";
import { useAppContext } from "../context/Context";
import { VaultDoor } from "./anim/VaultDoor";
import OpenedVault from "./OpenedVault";
import { LuX } from "react-icons/lu";

/**
 *
 */
export default function Vault() {
  const [state, setState] = useState("close");
  const [offload, setOffload] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  const { session } = useAppContext();

  useEffect(() => {
    (async () => {
      const lastCheck = Number(
        localStorage.getItem("vault.update.lastCheck") || "0",
      );

      const now = Date.now();
      const minDelay = 48 * 60 * 60 * 1000;

      if (now - lastCheck < minDelay) {
        return;
      }

      localStorage.setItem("vault.update.lastCheck", String(now));

      const skippedVersion =
        localStorage.getItem("vault.update.skippedVersion") || "";

      const res = await window.api.checkForUpdates();

      if (res.available === true && res.version !== skippedVersion) {
        setUpdateInfo(res);
      }
    })();
  }, [state]);

  useEffect(() => {
    if (state !== "open") return;

    const timer = setTimeout(() => setOffload(true), 300);

    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (!session) {
      setOffload(false);
      setState("close");
    }
  }, [session]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <UpdateBanner
        state={state}
        updateInfo={updateInfo}
        onClose={() => setUpdateInfo(null)}
        onSkip={() => {
          if (updateInfo?.version) {
            localStorage.setItem(
              "vault.update.skippedVersion",
              updateInfo.version,
            );
          }
          setUpdateInfo(null);
        }}
      />
      <div className="relative w-full h-full">
        <AnimatePresence>
          {!offload && (
            <>
              <VaultDoor state={state} duration={0.2} delay={0} />
              <Lock setState={setState} state={state} />
              <AnimatePresence>
                {state === "disable" && (
                  <ChangePassword onClose={() => setState("close")} />
                )}
              </AnimatePresence>
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {state === "open" && (
            <OpenedVault
              setLock={() => {
                setOffload(false);
                setState("close");
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const UpdateBanner = ({ state, updateInfo, onClose, onSkip }) => {
  const [updateState, setUpdateState] = useState({
    status: "idle",
    percent: null,
    received: 0,
    total: 0,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = window.api.onUpdateProgress((data) => {
      setUpdateState((prev) => ({
        ...prev,
        status: data.status || prev.status,
        percent: typeof data.percent === "number" ? data.percent : prev.percent,
        received:
          typeof data.received === "number" ? data.received : prev.received,
        total: typeof data.total === "number" ? data.total : prev.total,
      }));
    });

    return () => unsubscribe?.();
  }, []);

  const isDownloading =
    updateState.status === "downloading" || updateState.status === "verifying";

  const onDownload = async () => {
    setUpdateState((prev) => ({
      ...prev,
      status: "downloading",
      error: null,
    }));

    try {
      const res = await window.api.downloadUpdate();

      if (res.success === true) {
        setUpdateState((prev) => ({
          ...prev,
          status: "completed",
          error: null,
        }));
      } else {
        throw new Error(
          res.error || "Download failed. Please try again later.",
        );
      }
    } catch (err) {
      setUpdateState((prev) => ({
        ...prev,
        status: "error",
        error: err?.message || "Download failed. Please try again later.",
      }));
    }
  };

  const onCancel = async () => {
    await window.api.cancelUpdateDownload();
    setUpdateState((prev) => ({ ...prev, status: "cancelled" }));
  };

  return (
    <AnimatePresence>
      {updateInfo && state !== "disable" && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed flex justify-center p-4 bottom-0 left-0 z-50 w-full"
        >
          <div className="rounded-3xl w-full backdrop-blur-lg max-w-[700px] p-4 border text-white text-xs border-lime-100/10 bg-lime-700/10">
            <div className="flex justify-between">
              <div className="flex flex-col w-full sm:flex-row gap-y-6 justify-between">
                {updateState.status === "completed" && (
                  <>
                    <p className="text-emerald-300 w-full font-black max-w-md">
                      Download is completed and verified, Please close the app
                      and install the update.
                    </p>
                    <button
                      className="rounded-full max-w-44 shrink-0 font-black mr-4 px-3 h-8 hover:bg-blue-500 duration-200 bg-blue-600 text-white"
                      onClick={() => window.api.showDownloadedFile()}
                    >
                      Open file location
                    </button>
                  </>
                )}
                {updateState.status !== "completed" && (
                  <>
                    <div>
                      <h3 className="text-yellow-400 font-black">
                        New Update Available! [v{updateInfo.version}]
                      </h3>
                      <p className="mt-2 max-w-md">{updateInfo.releaseNotes}</p>
                      {updateState.error && (
                        <p className="mt-2 text-red-400">{updateState.error}</p>
                      )}
                      {updateState.error ===
                        "Download failed. Please try again later." && (
                        <button
                          className="underline underline-offset-4 decoration-white/40 text-white/80 hover:text-white/40 mt-6 block"
                          onClick={() => window.api.openDownloadLink()}
                        >
                          Or Download manually from official resource (Github)
                        </button>
                      )}
                    </div>
                    <div className="flex items-center font-black gap-4 mr-4">
                      {!isDownloading && (
                        <>
                          <button
                            className="rounded-full font-black text-black px-4 h-8 duration-200 hover:bg-blue-500 bg-blue-600"
                            onClick={onDownload}
                          >
                            Download
                          </button>
                          <button
                            className="text-white/70 underline duration-200 hover:text-white/40"
                            onClick={onSkip}
                          >
                            Skip this version
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {!isDownloading ? (
                <button
                  aria-label="close banner"
                  className="text-white hover:text-white/50 duration-200"
                  onClick={onClose}
                >
                  <LuX className="text-lg" />
                </button>
              ) : (
                <button
                  className="rounded-full px-4 h-8 font-black hover:bg-red-400 duration-200 bg-red-500 text-white"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
            </div>

            <AnimatePresence>
              {isDownloading && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  exit={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                >
                  <div className="pt-3">
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-2 bg-blue-400 transition-all duration-300"
                        style={{
                          width: `${updateState.percent || 0}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-[10px] text-white/70">
                      {updateState.status === "verifying"
                        ? "Verifying download..."
                        : `Downloading... ${updateState.percent ?? 0}%`}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
