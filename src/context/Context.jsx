import { useContext, createContext, useState, useEffect, useRef } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [data, setData] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    window.api.onLocked((r) => {
      console.log(r);
      setSession(null);
      setData([]);
    });
  }, []);

  return (
    <Context.Provider
      value={{
        session,
        setSession,
        data,
        setData,
        initialized,
        setInitialized,
      }}
    >
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
