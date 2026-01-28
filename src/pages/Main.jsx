import { useEffect, useState } from "react";
import Vault from "../components/Vault";
import Start from "../components/Start";
import { useAppContext } from "../context/Context";
import { ERRORS } from "../lib";

export default function Main() {
  const [loading, setLoading] = useState(true);

  const { initialized, setInitialized } = useAppContext();

  const init = async () => {
    try {
      await window.api.init();
      setInitialized(true);
    } catch (err) {
      if (
        err.message === ERRORS.NOT_INITIALIZED ||
        err.message === ERRORS.INVALID_VAULT
      ) {
        setInitialized(false);
      } else if (err.message === ERRORS.NO_FILE_BUT_BACKUP_FOUND) {
        setInitialized(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       await window.api.init();
  //     } catch (err) {
  //       if (
  //         err.message === ERRORS.NOT_INITIALIZED ||
  //         err.message === ERRORS.INVALID_VAULT
  //       ) {
  //         setInitialized(false);
  //       }
  //     }
  //     setInitialized(isInit);
  //     setLoading(false);
  //   })();
  // }, []);

  if (loading) {
    return <div className="h-screen w-screen bg-black" />;
  }

  if (initialized) {
    return <Vault />;
  }

  return <Start />;
}
