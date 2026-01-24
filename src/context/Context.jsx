import { useContext, createContext, useState, useEffect, useRef } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [passKey, setPassKey] = useState("");
  const [data, setData] = useState([]);

  const timerRef = useRef(null);

  useEffect(() => {
    if (passKey.length) {
      timerRef.current = setTimeout(() => {
        setPassKey("");
        setData([]);
      }, 60000);
    }

    return () => clearTimeout(timerRef.current);
  }, [passKey, data]);

  return (
    <Context.Provider value={{ passKey, setPassKey, data, setData }}>
      {children}
    </Context.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }

  return context;
};
