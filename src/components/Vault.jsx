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
  const [updateState, setUpdateState] = useState({
    status: "idle",
    percent: null,
    received: 0,
    total: 0,
    error: null,
  });

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
  }, []);

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
        updateInfo={updateInfo}
        updateState={updateState}
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
        onDownload={async () => {
          setUpdateState((prev) => ({
            ...prev,
            status: "downloading",
            error: null,
          }));

          try {
            await window.api.downloadUpdate();
          } catch (err) {
            setUpdateState((prev) => ({
              ...prev,
              status: "error",
              error: err?.message || "Download failed",
            }));
          }
        }}
        onCancel={async () => {
          await window.api.cancelUpdateDownload();
          setUpdateState((prev) => ({ ...prev, status: "cancelled" }));
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

const UpdateBanner = ({
  updateInfo,
  updateState,
  onClose,
  onSkip,
  onDownload,
  onCancel,
}) => {
  const isDownloading =
    updateState.status === "downloading" || updateState.status === "verifying";

  return (
    <AnimatePresence>
      {updateInfo && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed p-4 bottom-0 left-0 z-50 w-full"
        >
          <div className="rounded-3xl flex justify-between p-4 border text-white text-xs border-lime-100/10 bg-lime-700/10 bg-black">
            <div className="max-w-[60%]">
              <h3 className="text-yellow-400 font-black">
                New Update Available! [v{updateInfo.version}]
              </h3>
              <p className="mt-2">{updateInfo.releaseNotes}</p>
              {updateState.error && (
                <p className="mt-2 text-red-400">{updateState.error}</p>
              )}
              {isDownloading && (
                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-2 bg-blue-400 transition-all"
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
              )}
            </div>
            <div className="flex text-black font-black gap-2">
              {!isDownloading ? (
                <>
                  <button
                    className="rounded-full px-4 h-12 bg-blue-500"
                    onClick={onDownload}
                  >
                    Download
                  </button>
                  <button onClick={onSkip}>Skip this version</button>
                </>
              ) : (
                <button
                  className="rounded-full px-4 h-12 bg-red-500 text-white"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
            </div>
            <button
              aria-label="close banner"
              className="text-white hover:text-white/50 duration-200"
              onClick={onClose}
            >
              <LuX className="text-lg" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
