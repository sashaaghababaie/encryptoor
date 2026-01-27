import { useContext, createContext, useState, useEffect, useRef } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [data, setData] = useState([]);
  const [session, setSession] = useState(null);

  // const timerRef = useRef(null);

  // useEffect(() => {
  //   if (session) {
  //     timerRef.current = setTimeout(() => {
  //       window.api.lock();
  //       setSession(null);
  //       setData([]);
  //     }, 60000);
  //   }

  //   return () => clearTimeout(timerRef.current);
  // }, [session, data]);

  useEffect(() => {
    window.api.onLocked((reason) => {
      console.log("message recieved");
      setSession(null);
      setData([]);
      console.log("Vault locked:", reason);
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
