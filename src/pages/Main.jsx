import { useEffect, useState } from "react";
import Vault from "../components/Vault";
import Start from "../components/Start";
import { useAppContext } from "../context/Context";

export default function Main() {
  const { initialized, setInitialized } = useAppContext();

  useEffect(() => {
    (async () => {
      const isInit = await window.api.init();
      setInitialized(isInit);
    })();
  }, []);

  if (initialized) {
    return <Vault />;
  }

  return <Start setInitialized={setInitialized} />;
}
