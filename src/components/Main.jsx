import { useEffect, useRef, useState } from "react";
import Vault from "./Vault";
import Start from "./Start";
import { useAppContext } from "../context/Context";

export default function Main() {
  const [loading, setLoading] = useState(true);

  const { initialized, setInitialized, setPlatform } = useAppContext();

  useEffect(() => {
    (async () => {
      const { isInit, platform } = await window.api.init();
      setInitialized(isInit);
      setPlatform(platform);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="h-screen w-screen bg-black" />;
  }

  if (initialized) {
    return <Vault />;
  }

  return <Start />;
}
